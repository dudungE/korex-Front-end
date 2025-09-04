<template>
  <section class="remit-info-section-v4">
    <h2 class="section-title-v4">출금 정보</h2>

    <div class="info-table-v4">
      <!-- 계좌 선택 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 계좌</label>
        <select v-model="selectedAccount" class="input-field-v4" @change="onAccountSelect">
          <option value="" disabled>계좌 선택</option>
          <option v-for="acc in filteredAccounts" :key="acc.accountNumber" :value="acc">
            {{ acc.accountNumber }} / {{ acc.currencyCode }}
          </option>
        </select>
      </div>

      <!-- 잔액 표시 -->
      <div v-if="selectedAccount" class="info-row-v4">
        <span class="input-label-v4">잔액</span>
        <span class="input-field-v4" style="text-align:right">
          {{ balance.toLocaleString() }} {{ selectedAccount.currencyCode }}
        </span>
      </div>

      <!-- 계좌 비밀번호 입력 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">계좌 비밀번호</label>
        <input
            type="password"
            maxlength="4"
            :value="props.accountPin"
            @input="(e) => emit('update:accountPin', e.target.value)"
            class="input-field-v4"
            placeholder="4자리 입력"
        />
      </div>

      <!-- 송금 금액 입력 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">송금 금액</label>
        <div style="display:flex; flex-direction:column; flex-grow:1; gap:4px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input
                type="number"
                step="1"
                v-model.number="transferAmount"
                class="input-field-v4"
                :class="{ 'invalid-amount': isInvalidAmount }"
                placeholder="송금 금액 입력"
                @input="fetchConvertedAmount"
            />
            <span style="font-weight:600;">{{ selectedAccount?.currencyCode || 'KRW' }}</span>
          </div>
          <div v-if="selectedAccount" style="font-size:12px; color:#666;">
            최대: {{ maxAmount.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) }} {{ selectedAccount.currencyCode }} /
            최소: {{ minAmount.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) }} {{ selectedAccount.currencyCode }}
          </div>
        </div>
      </div>

      <!-- 환율 표시 -->
      <div class="info-row-v4">
        <span class="input-label-v4">환율</span>
        <span class="input-field-v4" style="text-align:right">
    1 {{ selectedAccount?.currencyCode || '---' }} =
    {{ (1 * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }} {{ recipientCurrency }}
  </span>
      </div>

      <!-- 환전 금액 표시 -->
      <div v-if="selectedAccount && convertedAmount > 0" class="info-row-v4">
        <span class="input-label-v4">환전 금액</span>
        <span class="input-field-v4" style="text-align:right">
    {{ Number(convertedAmount).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }} {{ recipientCurrency }}
  </span>
      </div>

      <!-- 수수료 표시 -->
      <div v-if="selectedAccount" class="info-row-v4">
        <span class="input-label-v4">수수료</span>
        <span class="input-field-v4" style="text-align:right">
    {{ Number(feeInKRW).toLocaleString() }} KRW
  </span>
      </div>

      <!-- 총 금액 -->
      <div v-if="selectedAccount" class="info-row-v4">
        <span class="input-label-v4">총 송금액</span>
        <span class="input-field-v4" style="text-align:right">
    {{ Number(totalAmountKRW).toLocaleString() }} KRW
  </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  selectedRecipient: { type: Object, default: null },
  initialAmount: { type: [Number, String], default: 0 },
  accountPin: { type: String, default: '' }
})

const emit = defineEmits([
  'update:selectedAccount',
  'update:selectedCurrency',
  'update:amountInput',
  'update:totalAmountKRW',
  'update:feeAmountKRW',
  'update:convertedAmount',
  'update:isValid',
  'update:accountPin'
])

const accounts = ref([])
const selectedAccount = ref(null)
const balance = ref(0)
const transferAmount = ref(Number(props.initialAmount) || 0)
const exchangeRate = ref(1)
const recipientCurrency = ref('KRW')
const feeInKRW = ref(0)
const convertedAmount = ref(0)
const isInvalidAmount = ref(false)
const totalAmountKRW = ref(0)

const currencyDecimals = { KRW:0, USD:2, EUR:2, JPY:0, GBP:2, AUD:2, CAD:2, CHF:2, CNY:2 }
const decimals = computed(() => currencyDecimals[selectedAccount.value?.currencyCode] ?? 2)
const minAmounts = { KRW:1000, USD:10, EUR:10, JPY:100, GBP:10, AUD:10, CAD:10, CHF:10, CNY:10 }
const minAmount = computed(() => selectedAccount.value ? minAmounts[selectedAccount.value.currencyCode] ?? 1 : 0)
const maxAmount = computed(() => selectedAccount.value ? balance.value : 0)

const filteredAccounts = computed(() => {
  if (!accounts.value.length) return []
  const currency = props.selectedRecipient?.currencyCode || 'USD'
  return accounts.value.filter(acc => acc.currencyCode === 'KRW' || acc.currencyCode === currency)
})

// 계좌 불러오기
const loadAccounts = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const res = await axios.get('/api/foreign-transfer/balances', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (Array.isArray(res.data?.balances)) accounts.value = res.data.balances
  } catch (e) {
    console.error('계좌 불러오기 실패', e)
  }
}

// 계좌 선택 시
const onAccountSelect = async () => {
  if (!selectedAccount.value) return
  balance.value = selectedAccount.value.availableAmount || 0
  emit('update:selectedAccount', selectedAccount.value)
  emit('update:selectedCurrency', selectedAccount.value.currencyCode)
  await fetchConvertedAmount()
}

const saveWithdrawDataLocal = () => {
  return {
    feeInCurrency: feeInKRW.value,
    convertedAmount: convertedAmount.value,
    totalAmountKRW: totalAmountKRW.value,
    transferAmount: transferAmount.value,
    selectedAccount: selectedAccount.value,
    selectedCurrency: selectedAccount.value?.currencyCode
  }
}

// 환전 계산
const fetchConvertedAmount = async () => {
  if (!selectedAccount.value || !transferAmount.value) return

  const from = selectedAccount.value.currencyCode
  const to = props.selectedRecipient?.currencyCode || 'USD'

  try {
    const token = localStorage.getItem('accessToken')

    // 1️⃣ 실시간 환율 GET
    const rateRes = await axios.get('/api/exchange/real-time', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    // fromCurrency, toCurrency 각각 환율
    const fromRateObj = rateRes.data.find(r => r.currency_code === from)
    const toRateObj = rateRes.data.find(r => r.currency_code === to)

    const fromRate = fromRateObj ? Number(fromRateObj.send_rate?.replace(/,/g, '')) || Number(fromRateObj.base_rate?.replace(/,/g, '')) : 1
    const toRate = toRateObj ? Number(toRateObj.send_rate?.replace(/,/g, '')) || Number(toRateObj.base_rate?.replace(/,/g, '')) : 1

    // 표시용 환율
    exchangeRate.value = toRate / fromRate
    recipientCurrency.value = to

    // 2️⃣ 환전 시뮬레이션 POST (금액, 수수료, 총액 계산)
    const simRes = await axios.post('/api/exchange/simulate', {
      fromCurrency: from,
      toCurrency: to,
      amount: transferAmount.value
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    const simData = simRes.data
    if (!simData.success) {
      console.error('환전 시뮬레이션 실패:', simData.message)
      return
    }

    // API 기준 값 반영
    convertedAmount.value = simData.toAmount
    feeInKRW.value = simData.fee
    totalAmountKRW.value = simData.totalDeductedAmount

    // 유효성 체크
    isInvalidAmount.value = transferAmount.value < minAmount.value || transferAmount.value > maxAmount.value
    emit('update:isValid', !isInvalidAmount.value && props.accountPin.length === 4)

    // 부모 emit
    emit('update:feeAmountKRW', feeInKRW.value)
    emit('update:convertedAmount', convertedAmount.value)
    emit('update:totalAmountKRW', totalAmountKRW.value)
    emit('update:amountInput', transferAmount.value)

  } catch (err) {
    console.error('환전 금액 계산 실패', err)
  }
}

onMounted(async () => {
  await loadAccounts()
})
defineExpose({
  saveWithdrawDataLocal
})

</script>


<style scoped>
.remit-info-section-v4 {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  font-family: 'Pretendard Variable', sans-serif;
  color: #333;
}
.section-title-v4 {
  font-size: 26px;
  font-weight: 700;
  color: #008681;
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
}
.info-table-v4 {
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 30px;
}
.info-row-v4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #eee;
}
.input-label-v4 {
  font-size: 15px;
  color: #666;
  font-weight: 500;
  flex-basis: 35%;
  flex-shrink: 0;
  text-align: left;
}
.input-field-v4 {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
  color: #333;
  width: auto;
  box-sizing: border-box;
  text-align: right;
}
.input-field-v4:focus {
  outline: none;
  border-color: #009b99;
  box-shadow: 0 0 0 3px rgba(61,153,112,0.1);
}
.invalid-amount {
  border-color: red !important;
  box-shadow: 0 0 0 3px rgba(255,0,0,0.1);
}
</style>
