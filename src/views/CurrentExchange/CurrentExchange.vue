<template>
  <div class="forex-system">
    <main class="main-content">
      <h1>환전하기</h1>

      <div class="exchange-main">
        <div class="exchange-form">
          <p class="form-subtitle">환전할 통화 선택 및 금액을 입력하세요</p>

          <!-- From Section -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">From</span>
              <div class="balance-info">
                Balance: {{ getBalanceAmount(fromCurrency) }}
                <button class="max-btn" @click="setMaxAmount">Max</button>
              </div>
            </div>

            <div class="currency-input-row">
              <select v-model="fromCurrency" class="currency-dropdown" @change="calculateExchange">
                <option value="KRW">🇰🇷 한국 KRW</option>
                <option value="USD">🇺🇸 미국 USD</option>
                <option value="JPY">🇯🇵 일본 JPY</option>
                <option value="EUR">🇪🇺 유럽연합 EUR</option>
              </select>

              <input 
                type="number" 
                v-model="inputAmount" 
                class="amount-input" 
                placeholder="0"
                @input="calculateExchange" 
              />
            </div>
          </div>

          <!-- Exchange Icon -->
          <div class="exchange-icon-container">
            <div class="exchange-icon" @click="swapCurrencies">
              ↕
            </div>
          </div>

          <!-- To Section -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">To</span>
            </div>

            <div class="currency-input-row">
              <select v-model="toCurrency" class="currency-dropdown" @change="calculateExchange">
                <option value="KRW">🇰🇷 한국 KRW</option>
                <option value="USD">🇺🇸 미국 USD</option>
                <option value="JPY">🇯🇵 일본 JPY</option>
                <option value="EUR">🇪🇺 유럽연합 EUR</option>
              </select>

              <input 
                type="number" 
                :value="convertedAmount" 
                class="amount-input" 
                placeholder="0" 
                readonly 
              />
            </div>
          </div>

          <!-- 환전 정보 Section -->
          <div class="exchange-info-section" v-if="inputAmount && inputAmount > 0">
            <div class="exchange-info-header">
              <span class="info-label">환전 정보</span>
            </div>

            <div class="fee-details">
              <div class="fee-row">
                <span class="fee-label">환율</span>
                <span class="fee-value">{{ currentExchangeRate.toFixed(4) }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">원 수수료 (0.5%)</span>
                <span class="fee-value">{{ formatNumber(originalFee) }} {{ fromCurrency }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">우대율 (수수료 90% 할인)</span>
                <span class="fee-value highlight">90%</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">실제 수수료 (0.05%)</span>
                <span class="fee-value">{{ formatNumber(actualFee) }} {{ fromCurrency }}</span>
              </div>
              <div class="fee-row total-row">
                <span class="fee-label">실제 받을 금액</span>
                <span class="fee-value total-amount">{{ formatNumber(finalAmount) }} {{ toCurrency }}</span>
              </div>
            </div>
          </div>

          <!-- 환전하기 버튼 부분 -->
          <button 
            class="exchange-btn" 
            :disabled="!inputAmount || inputAmount <= 0 || isAmountExceedsBalance"
          >
            {{ isAmountExceedsBalance ? '잔액 부족' : '환전하기' }}
          </button>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h3>환율 차트</h3>
            <span class="chart-period">{{ formatNumber(currentExchangeRate) }}</span>
          </div>
          <div class="mini-chart">
            <div class="chart-placeholder">
              <div class="chart-line"></div>
            </div>
            <div class="chart-dates">
              <span>2025.05.01</span>
              <span>2025.06.01</span>
              <span>2025.07.01</span>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer-info">
        <span>기준일: {{ getToday() }}</span>
        <span>조회시각: {{ getCurrentTime() }}</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Reactive data
const fromCurrency = ref('KRW')
const toCurrency = ref('USD')
const inputAmount = ref('')
const convertedAmount = ref(0)
const currentExchangeRate = ref(0)
const finalAmount = ref(0)
const originalFee = ref(0)
const actualFee = ref(0)

// 환율 정보 (KRW 기준)
const rates = reactive({
  KRW: 1,
  USD: 1393.33,
  JPY: 9.38, // 100엔당 원화
  EUR: 1617.94
})

// 잔액 정보 (예시)
const balances = reactive({
  KRW: 1000000,
  USD: 500,
  JPY: 50000,
  EUR: 300
})

// 우대율 설정
const discountRate = 0.9 // 90% 우대율
const feeRate = 0.005 // 0.5% 수수료

// Computed
const isAmountExceedsBalance = computed(() => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    return false
  }
  return parseFloat(inputAmount.value) > balances[fromCurrency.value]
})

// Methods
const calculateExchange = () => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    convertedAmount.value = 0
    finalAmount.value = 0
    currentExchangeRate.value = 0
    originalFee.value = 0
    actualFee.value = 0
    return
  }

  let rate = 0
  let convertedValue = 0

  if (fromCurrency.value === toCurrency.value) {
    rate = 1
    convertedValue = parseFloat(inputAmount.value)
  } else {
    // KRW를 기준으로 환율 계산
    if (fromCurrency.value === 'KRW') {
      rate = 1 / rates[toCurrency.value]
      convertedValue = parseFloat(inputAmount.value) / rates[toCurrency.value]
    } else if (toCurrency.value === 'KRW') {
      rate = rates[fromCurrency.value]
      convertedValue = parseFloat(inputAmount.value) * rates[fromCurrency.value]
    } else {
      // 둘 다 KRW가 아닌 경우
      const fromToKrw = parseFloat(inputAmount.value) * rates[fromCurrency.value]
      rate = rates[fromCurrency.value] / rates[toCurrency.value]
      convertedValue = fromToKrw / rates[toCurrency.value]
    }
  }

  currentExchangeRate.value = rate
  convertedAmount.value = convertedValue

  // 올바른 우대율 적용 계산
  originalFee.value = parseFloat(inputAmount.value) * feeRate // 원래 수수료 0.5%
  actualFee.value = originalFee.value * (1 - discountRate) // 실제 수수료 0.05%
  
  // 수수료를 환전 후 금액에서 차감
  const feeInTargetCurrency = actualFee.value * rate
  finalAmount.value = convertedValue - feeInTargetCurrency
}

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  calculateExchange()
}

const getBalanceAmount = (currency) => {
  return formatNumber(balances[currency])
}

const setMaxAmount = () => {
  inputAmount.value = balances[fromCurrency.value]
  calculateExchange()
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

const getToday = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const getCurrentTime = () => {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초`
}

// Watchers
watch([fromCurrency, toCurrency], () => {
  calculateExchange()
})

// Lifecycle
onMounted(() => {
  calculateExchange()
})
</script>

<style scoped>
/* 동일한 CSS 스타일 유지 */
.forex-system {
  font-family: 'Noto Sans KR', Arial, sans-serif;
  background: #fafbfc;
  min-height: 100vh;
  width: 100vw;
  min-width: 0;
}

.main-content {
  flex: 1;
  padding: 40px 48px;
}

.main-content h1 {
  font-size: 2rem;
  margin-bottom: 24px;
  color: #222;
}

.exchange-main {
  display: flex;
  gap: 40px;
}

.exchange-form {
  flex: 6;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.form-subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 1rem;
}

/* Currency Section Styles */
.currency-section {
  margin-bottom: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.balance-info {
  color: #999;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.max-btn {
  background: #009490;
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
}

.max-btn:hover {
  background: #007c7a;
}

.currency-input-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.currency-dropdown {
  flex: 2;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.amount-input {
  flex: 3;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: right;
  background: #fff;
}

.amount-input:read-only {
  background: #f8f9fa;
  color: #666;
}

/* 숫자 input의 화살표(스피너) 제거 */
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox용 */
.amount-input[type=number] {
  -moz-appearance: textfield;
}

/* Exchange Icon */
.exchange-icon-container {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.exchange-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}

.exchange-icon:hover {
  border-color: #009490;
  color: #009490;
}

/* 환전 정보 Section */
.exchange-info-section {
  margin: 24px 0;
  padding: 20px;
  background: #f0f8f7;
  border-radius: 12px;
  border: 1px solid #009490;
}

.exchange-info-header {
  margin-bottom: 16px;
}

.info-label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.fee-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fee-row.total-row {
  border-top: 1px solid #009490;
  padding-top: 8px;
  margin-top: 8px;
}

.fee-label {
  color: #666;
  font-size: 0.9rem;
}

.fee-value {
  color: #333;
  font-weight: 500;
}

.fee-value.highlight {
  color: #009490;
  font-weight: 600;
}

.fee-value.total-amount {
  color: #009490;
  font-size: 1.1rem;
  font-weight: 700;
}

/* Exchange Button */
.exchange-btn {
  width: 100%;
  background: #009490;
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 20px;
}

.exchange-btn:hover:not(:disabled) {
  background: #007c7a;
}

.exchange-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Chart Section */
.chart-section {
  flex: 4;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  color: #009490;
  font-size: 1.2rem;
  margin: 0;
}

.chart-period {
  color: #333;
  font-weight: bold;
}

.mini-chart {
  height: 120px;
  position: relative;
  margin-bottom: 16px;
}

.chart-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f0f8f7 0%, #e8f4f3 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.chart-line {
  position: absolute;
  bottom: 30%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #009490;
  border-radius: 1px;
}

.chart-dates {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
}

.footer-info {
  display: flex;
  gap: 32px;
  color: #888;
  font-size: 0.95rem;
  margin-top: 32px;
}
</style>
