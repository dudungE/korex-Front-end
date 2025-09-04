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
                v-model.number="transferAmount"
                class="input-field-v4"
                :class="{ 'invalid-amount': isInvalidAmount }"
                placeholder="송금 금액 입력"
                @input="calculateAmounts"
            />
            <span style="font-weight:600;">{{ selectedAccount?.currencyCode || 'KRW' }}</span>
          </div>
          <div v-if="selectedAccount" style="font-size:12px; color:#666;">
            최대: {{ maxAmount.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) }} {{ selectedAccount.currencyCode }} /
            최소: {{ minAmount.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) }} {{ selectedAccount.currencyCode }}
          </div>
        </div>
      </div>

      <!-- 수수료 계좌 표시 -->
      <div class="info-row-v4">
        <span class="input-label-v4">수수료 계좌</span>
        <span class="input-field-v4" style="text-align:right">
          원화(KRW) 계좌에서 차감
        </span>
      </div>

      <!-- 수수료 표시 -->
      <div class="info-row-v4">
        <span class="input-label-v4">수수료</span>
        <span class="input-field-v4" style="text-align:right">
          {{ feeKRW.toLocaleString() }} KRW
        </span>
      </div>

      <!-- 환율 표시 -->
      <div class="info-row-v4">
        <span class="input-label-v4">환율</span>
        <span class="input-field-v4" style="text-align:right">
          1 {{ recipientCurrency }} = {{ exchangeRate.toLocaleString() }} KRW
        </span>
      </div>

      <!-- 총액(KRW) -->
      <div class="info-row-v4">
        <span class="input-label-v4">총 금액(KRW)</span>
        <span class="input-field-v4" style="text-align:right">
          {{ totalKRW.toLocaleString() }} 원
        </span>
      </div>

      <!-- 환전 금액 표시 -->
      <div v-if="selectedAccount && selectedAccount.currencyCode !== 'KRW'" class="info-row-v4">
        <span class="input-label-v4">환전 금액</span>
        <span class="input-field-v4" style="text-align:right">
          {{ convertedAmount.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) }} {{ selectedAccount.currencyCode }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const selectedAccount = ref(props.selectedRecipient || null)
const balance = ref(0)
const transferAmount = ref(Number(props.initialAmount) || 0)
const exchangeRate = ref(1)
const recipientCurrency = ref('KRW')
const feeRate = 0.01
const isInvalidAmount = ref(false)
const convertedAmount = ref(0)

const currencyDecimals = { KRW:0, USD:2, EUR:2, JPY:0, GBP:2, AUD:2, CAD:2, CHF:2, CNY:2 }
const decimals = computed(() => currencyDecimals[selectedAccount.value?.currencyCode] ?? 2)
const minAmounts = { KRW:1000, USD:10, EUR:10, JPY:100, GBP:10, AUD:10, CAD:10, CHF:10, CNY:10 }

const filteredAccounts = computed(() => {
  if (!accounts.value.length) return []
  const currency = props.selectedRecipient?.currencyCode || 'USD'
  return accounts.value.filter(acc => acc.currencyCode === 'KRW' || acc.currencyCode === currency)
})

const feeKRW = computed(() => {
  if (!selectedAccount.value) return 0
  // 항상 원화 기준
  const krwAmount = selectedAccount.value.currencyCode === 'KRW'
      ? transferAmount.value
      : transferAmount.value * exchangeRate.value
  return Math.round(krwAmount * feeRate)
})

const totalKRW = computed(() => {
  if (!selectedAccount.value) return 0
  // 총액 = KRW 계좌 기준 송금액 + 수수료
  const krwAmount = selectedAccount.value.currencyCode === 'KRW'
      ? transferAmount.value
      : transferAmount.value * exchangeRate.value
  return Math.round(krwAmount + feeKRW.value)
})

const minAmount = computed(() => selectedAccount.value ? minAmounts[selectedAccount.value.currencyCode] ?? 1 : 0)
const maxAmount = computed(() => {
  if (!selectedAccount.value) return 0
  const curr = selectedAccount.value.currencyCode
  let max = curr === 'KRW'
      ? Math.floor(balance.value / (1 + feeRate))
      : Math.floor(balance.value / (1 + feeRate) * Math.pow(10, decimals.value)) / Math.pow(10, decimals.value)
  return max < minAmount.value ? minAmount.value : max
})

const loadAccounts = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const res = await axios.get('/api/foreign-transfer/balances', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (Array.isArray(res.data?.balances)) {
      accounts.value = res.data.balances.map(acc => ({
        ...acc,
        accountType: acc.accountType || 'KRW'
      }))
    }
  } catch (e) {
    console.error('계좌 불러오기 실패', e)
  }
}

const onAccountSelect = async () => {
  if (!selectedAccount.value) return
  selectedAccount.value.accountType ||= 'KRW'
  await refreshBalance()
  emit('update:selectedAccount', selectedAccount.value)
  emit('update:selectedCurrency', selectedAccount.value.currencyCode)
}

const cachedRates = ref({})
const lastFetched = ref({})

const refreshBalance = async () => {
  if (!selectedAccount.value) return
  balance.value = selectedAccount.value.availableAmount || 0
  const recipientCurr = props.selectedRecipient?.currencyCode || 'USD'
  const now = Date.now()
  const cacheTime = 60 * 1000

  if (cachedRates.value[recipientCurr] && now - (lastFetched.value[recipientCurr] || 0) < cacheTime) {
    exchangeRate.value = cachedRates.value[recipientCurr]
    recipientCurrency.value = recipientCurr
    calculateAmounts()
    return
  }

  try {
    const token = localStorage.getItem('accessToken')
    const res = await axios.get('/api/exchange/real-time', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    const found = res.data.find(r => r.currency_code === recipientCurr)
    const rate = found ? Number(found.send_rate?.replace(/,/g, '')) || Number(found.base_rate?.replace(/,/g, '')) : 1
    exchangeRate.value = isNaN(rate) ? 1 : rate
    recipientCurrency.value = recipientCurr
    cachedRates.value[recipientCurr] = exchangeRate.value
    lastFetched.value[recipientCurr] = now
  } catch (err) {
    console.error('환율 조회 실패:', err)
    exchangeRate.value = 1
    recipientCurrency.value = recipientCurr
  }
  calculateAmounts()
}

const calculateAmounts = () => {
  if (!selectedAccount.value) {
    isInvalidAmount.value = false
    emit('update:isValid', false)
    return
  }

  // 환전 금액 계산
  convertedAmount.value = selectedAccount.value.currencyCode === 'KRW'
      ? transferAmount.value
      : Number((transferAmount.value * exchangeRate.value).toFixed(decimals.value))

  const valid = transferAmount.value >= minAmount.value &&
      transferAmount.value <= maxAmount.value &&
      props.accountPin.length === 4

  isInvalidAmount.value = !valid

  emit('update:selectedAccount', selectedAccount.value)
  emit('update:selectedCurrency', selectedAccount.value.currencyCode)
  emit('update:amountInput', transferAmount.value)
  emit('update:totalAmountKRW', totalKRW.value)
  emit('update:feeAmountKRW', feeKRW.value)
  emit('update:convertedAmount', convertedAmount.value)
  emit('update:isValid', valid)
}

onMounted(async () => {
  await loadAccounts()
  if (selectedAccount.value) await refreshBalance()
})

watch([selectedAccount, transferAmount, () => props.accountPin], calculateAmounts, { immediate: true })
</script>

<style scoped>
.remit-info-section-v4 { background-color: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-family: 'Pretendard Variable', sans-serif; color: #333; }
.section-title-v4 { font-size: 26px; font-weight: 700; color: #008681; margin-bottom: 28px; display: flex; justify-content: center; }
.info-table-v4 { background-color: #f8f8f8; border-radius: 10px; border: 1px solid #e0e0e0; overflow: hidden; margin-bottom: 30px; }
.info-row-v4 { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #eee; }
.input-label-v4 { font-size: 15px; color: #666; font-weight: 500; flex-basis: 35%; flex-shrink: 0; text-align: left; }
.input-field-v4 { flex-grow: 1; padding: 8px 12px; border: 1px solid #dcdcdc; border-radius: 6px; font-size: 16px; color: #333; width: auto; box-sizing: border-box; text-align: right; }
.input-field-v4:focus { outline: none; border-color: #009b99; box-shadow: 0 0 0 3px rgba(61,153,112,0.1); }
.invalid-amount { border-color: red !important; box-shadow: 0 0 0 3px rgba(255,0,0,0.1); }
</style>
