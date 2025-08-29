<template>
  <section class="remit-info-section-v4">
    <!-- 단계 제목 -->
    <h2 class="section-title-v4">송금정보</h2>

    <!-- 계좌 선택 토글 -->
    <div class="info-row-v4 toggle-row">
      <label class="input-label-v4">출금 계좌 구분</label>
      <div class="toggle-btns-v4">
        <button :class="{ active: localWithdrawAccountType==='KRW' }" @click="localWithdrawAccountType='KRW'">원화계좌</button>
        <button :class="{ active: localWithdrawAccountType==='FX' }" @click="localWithdrawAccountType='FX'">외화계좌</button>
      </div>
    </div>

    <!-- KRW 계좌 -->
    <div v-if="localWithdrawAccountType==='KRW'" class="info-box-v4">
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 은행</label>
        <select v-model="selectedKrwBank" class="input-field-v4">
          <option value="" disabled>은행 선택</option>
          <option v-for="bank in krwBanks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
        </select>
      </div>
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 계좌번호</label>
        <select v-model="localSelectedKrwAccount" class="input-field-v4">
          <option value="" disabled>계좌 선택</option>
          <option v-for="acc in krwAccounts" :key="acc.accountNumber" :value="acc.accountNumber">{{ acc.accountNumber }}</option>
        </select>
      </div>
      <div class="info-row-v4">
        <label class="input-label-v4">송금 기준</label>
        <span class="info-text-v4">원화 기준으로 송금이 진행됩니다.</span>
      </div>
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 금액 (KRW)</label>
        <input type="number" v-model.number="krwAmountInput" class="input-field-v4" placeholder="0" />
      </div>
      <div class="info-row-v4">
        <label class="input-label-v4">환율</label>
        <span class="info-text-v4">{{ exchangeRate }} 원/USD</span>
      </div>
      <div class="info-row-v4 action-row">
        <button class="action-button-v4" @click="checkBalance('KRW')">계좌조회</button>
      </div>
    </div>

    <!-- FX 계좌 -->
    <div v-if="localWithdrawAccountType==='FX'" class="info-box-v4">
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 은행</label>
        <select v-model="selectedFxBank" class="input-field-v4">
          <option value="" disabled>은행 선택</option>
          <option v-for="bank in fxBanks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
        </select>
      </div>
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 계좌번호</label>
        <select v-model="localSelectedFxAccount" class="input-field-v4">
          <option value="" disabled>계좌 선택</option>
          <option v-for="acc in fxAccounts" :key="acc.accountNumber" :value="acc.accountNumber">{{ acc.accountNumber }}</option>
        </select>
      </div>
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">통화 선택</label>
        <select v-model="selectedCurrency" class="input-field-v4">
          <option value="" disabled>통화 선택</option>
          <option v-for="c in currencyList" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="info-row-v4">
        <label class="input-label-v4">송금 기준</label>
        <span class="info-text-v4">외화 기준으로 송금이 진행됩니다.</span>
      </div>
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">출금 금액 ({{ selectedCurrency || '통화 선택' }})</label>
        <input type="number" v-model.number="fxAmountInput" class="input-field-v4" placeholder="0" />
      </div>
      <div class="info-row-v4">
        <label class="input-label-v4">환율</label>
        <span class="info-text-v4">{{ exchangeRate }} 원/{{ selectedCurrency || '통화' }}</span>
      </div>
      <div class="info-row-v4 action-row">
        <button class="action-button-v4" @click="checkBalance('FX', selectedCurrency)">계좌조회</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  krwAccountsProp: Array,
  fxAccountsProp: Array,
  krwBanksProp: Array,
  fxBanksProp: Array,
  userId: Number
})

const localWithdrawAccountType = ref('KRW')
const krwAmountInput = ref(0)
const fxAmountInput = ref(0)

const selectedKrwBank = ref('')
const localSelectedKrwAccount = ref('')
const selectedFxBank = ref('')
const localSelectedFxAccount = ref('')
const selectedCurrency = ref('')

const krwAccounts = ref(props.krwAccountsProp || [])
const fxAccounts = ref(props.fxAccountsProp || [])
const krwBanks = ref(props.krwBanksProp || [])
const fxBanks = ref(props.fxBanksProp || [])

const exchangeRate = ref(1330.5)
const currencyList = ['USD', 'EUR', 'JPY', 'CNY']

async function checkBalance(accountType, currencyCode) {
  try {
    const payload = {
      userId: props.userId,
      accountType: accountType,
      currencyCode: currencyCode
    }
    const res = await axios.post('/api/ForeignTransfer/check-balance', payload)
    alert(`사용 가능 금액: ${res.data.availableAmount} ${currencyCode || 'KRW'}`)
  } catch (err) {
    console.error('잔액 확인 실패', err)
    alert('잔액 확인에 실패했습니다.')
  }
}
</script>

<style scoped>
.remit-info-section-v4 {
  background:#fff;
  border-radius:12px;
  padding:24px;
  box-shadow:0 4px 15px rgba(0,0,0,0.08);
  font-family:'Pretendard Variable',sans-serif;
  color:#333;
}
.section-title-v4 {
  font-size:26px;
  font-weight:700;
  color:#008681;
  margin-bottom:28px;
  display:flex;
  justify-content:center;
}
.info-box-v4 {
  background:#f8f8f8;
  border:1px solid #e0e0e0;
  border-radius:10px;
  margin-bottom:20px;
}
.info-row-v4 {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 20px;
  border-bottom:1px solid #eee;
}
.input-label-v4 {
  font-size:15px;
  color:#666;
  font-weight:500;
  flex-basis:35%;
  flex-shrink:0;
}
.input-field-v4 {
  flex-grow:1;
  padding:8px 12px;
  border:1px solid #dcdcdc;
  border-radius:6px;
  font-size:16px;
  text-align:right;
}
.input-field-v4:focus {
  outline:none;
  border-color:#009b99;
  box-shadow:0 0 0 3px rgba(0,155,153,0.1);
}
.toggle-btns-v4 {
  display:flex;
  gap:10px;
}
.toggle-btns-v4 button {
  padding:8px 14px;
  border-radius:6px;
  border:1px solid #dcdcdc;
  cursor:pointer;
  font-weight:500;
}
.toggle-btns-v4 button.active {
  background:#009b99;
  color:#fff;
  border-color:#009b99;
}
.info-text-v4 {
  color:#555;
  font-size:14px;
}
.action-row { justify-content:flex-end; }
.action-button-v4 {
  padding:8px 16px;
  background:#009b99;
  color:#fff;
  border:none;
  border-radius:6px;
  font-weight:500;
  cursor:pointer;
}
.action-button-v4:hover {
  background:#008681;
}
</style>
