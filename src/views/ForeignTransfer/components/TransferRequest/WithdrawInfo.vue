<template>
  <section class="remit-info-section-v4">
    <h2 class="section-title-v4">출금 정보</h2>

    <div class="info-table-v4">
      <!-- 계좌 선택 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 계좌</label>
        <select v-model="selectedAccount" class="input-field-v4" @change="onAccountSelect">
          <option value="" disabled>계좌 선택</option>
          <option
              v-for="acc in filteredAccounts"
              :key="acc.accountNumber"
              :value="acc"
          >
            {{ acc.accountNumber }} / {{ acc.currencyCode }}
          </option>
        </select>
        <button
            class="file-button-v4"
            @click="refreshBalance()"
            :disabled="!selectedAccount"
        >
          잔액 조회
        </button>
      </div>

      <!-- 계좌 비밀번호 4자리 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">계좌 비밀번호</label>
        <input
            type="password"
            maxlength="4"
            v-model="accountPin"
            class="input-field-v4"
            placeholder="4자리 입력"
            @input="calculateAmounts"
        />
      </div>

      <!-- 잔액 표시 (조회 후에만) -->
      <div v-if="balance !== null" class="info-row-v4">
        <span class="input-label-v4">잔액</span>
        <span class="input-field-v4" style="text-align:right">
          {{ balance.toLocaleString() }} {{ selectedAccount?.currencyCode }}
        </span>
      </div>

      <!-- 송금 금액 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">송금 금액</label>
        <div style="display:flex; align-items:center; gap:8px; flex-grow:1;">
          <input
              type="number"
              v-model.number="transferAmount"
              class="input-field-v4"
              placeholder="송금 금액 입력"
              @input="calculateAmounts"
          />
          <span style="font-weight:600;">{{ recipientCurrency }}</span>
        </div>
      </div>

      <!-- 수수료 -->
      <div class="info-row-v4">
        <span class="input-label-v4">수수료</span>
        <span class="input-field-v4" style="text-align:right">
          {{ feeKRW.toLocaleString() }} KRW
        </span>
      </div>

      <!-- 환율 -->
      <div class="info-row-v4">
        <span class="input-label-v4">환율</span>
        <span class="input-field-v4" style="text-align:right">{{ exchangeRate }}</span>
      </div>

      <!-- 수취인 통화 기준 금액 -->
      <div class="info-row-v4">
        <span class="input-label-v4">수취인 통화 금액</span>
        <span class="input-field-v4" style="text-align:right">
          {{ amountInRecipientCurrency.toLocaleString() }} {{ recipientCurrency }}
        </span>
      </div>

      <!-- 총액(KRW) -->
      <div class="info-row-v4">
        <span class="input-label-v4">총 금액(KRW)</span>
        <span class="input-field-v4" style="text-align:right">{{ totalKRW.toLocaleString() }} 원</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  selectedRecipient: { type: Object, default: null },
  initialAmount: { type: [Number, String], default: 0 }
})

const emit = defineEmits([
  'update:selectedAccount',
  'update:selectedCurrency',
  'update:amountInput',
  'update:totalAmountKRW',
  'update:feeAmountKRW',
  'update:isValid'
])

const accounts = ref([])
const selectedAccount = ref(null)
const balance = ref(null)
const transferAmount = ref(Number(props.initialAmount) || 0)
const accountPin = ref('') // 계좌 비밀번호
const exchangeRate = ref(1)
const recipientCurrency = ref('KRW')
const feeRate = 0.01

const filteredAccounts = computed(() => {
  if (!accounts.value.length) return []
  const currency = props.selectedRecipient?.currency || 'USD'
  return accounts.value.filter(acc => acc.currencyCode === 'KRW' || acc.currencyCode === currency)
})

const amountInRecipientCurrency = computed(() => {
  if (!selectedAccount.value) return 0
  return selectedAccount.value.currencyCode === 'KRW'
      ? transferAmount.value / exchangeRate.value
      : transferAmount.value
})

const feeKRW = computed(() => {
  if (!selectedAccount.value) return 0
  return Math.round(
      transferAmount.value * feeRate * (selectedAccount.value.currencyCode === 'KRW' ? 1 : exchangeRate.value)
  )
})

const totalKRW = computed(() => {
  if (!selectedAccount.value) return 0
  const amountKRW = selectedAccount.value.currencyCode === 'KRW'
      ? transferAmount.value
      : transferAmount.value * exchangeRate.value
  return Math.round(amountKRW + feeKRW.value)
})

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

const onAccountSelect = () => {
  balance.value = null
}

const refreshBalance = async () => {
  if (!selectedAccount.value) return
  balance.value = selectedAccount.value.availableAmount || 0

  if (selectedAccount.value.currencyCode !== 'KRW') {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await axios.get('/api/exchange/real-time', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const found = res.data.find(r => r.currency_code === selectedAccount.value.currencyCode)
      const rate = found ? Number(found.send_rate?.replace(/,/g, '')) || Number(found.base_rate?.replace(/,/g, '')) : 1
      exchangeRate.value = isNaN(rate) ? 1 : rate
      recipientCurrency.value = selectedAccount.value.currencyCode
    } catch (err) {
      console.error('환율 조회 실패:', err)
      exchangeRate.value = 1
      recipientCurrency.value = selectedAccount.value.currencyCode
    }
  } else {
    exchangeRate.value = 1
    recipientCurrency.value = 'KRW'
  }
  emitAll()
}

const emitAll = () => {
  const valid = selectedAccount.value && transferAmount.value > 0 && accountPin.value.length === 4
  emit('update:selectedAccount', selectedAccount.value)
  emit('update:selectedCurrency', recipientCurrency.value)
  emit('update:amountInput', transferAmount.value)
  emit('update:totalAmountKRW', totalKRW.value)
  emit('update:feeAmountKRW', feeKRW.value)
  emit('update:isValid', valid)
}

onMounted(loadAccounts)
watch([selectedAccount, transferAmount, accountPin], emitAll)
</script>

<style scoped>
.remit-info-section-v4 { background-color: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-family: 'Pretendard Variable', sans-serif; color: #333; }
.section-title-v4 { font-size: 26px; font-weight: 700; color: #008681; margin-bottom: 28px; display: flex; justify-content: center; }
.info-table-v4 { background-color: #f8f8f8; border-radius: 10px; border: 1px solid #e0e0e0; overflow: hidden; margin-bottom: 30px; }
.info-row-v4 { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #eee; }
.input-label-v4 { font-size: 15px; color: #666; font-weight: 500; flex-basis: 35%; flex-shrink: 0; text-align: left; }
.input-field-v4 { flex-grow: 1; padding: 8px 12px; border: 1px solid #dcdcdc; border-radius: 6px; font-size: 16px; color: #333; width: auto; box-sizing: border-box; text-align: right; }
.input-field-v4:focus { outline: none; border-color: #009b99; box-shadow: 0 0 0 3px rgba(61,153,112,0.1); }
.file-button-v4 { padding: 7px 10px; background-color: #009b99; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s ease; }
.file-button-v4:hover { background-color: #008681; }
</style>
