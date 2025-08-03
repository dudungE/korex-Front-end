<template>
  <div class="main-content">
    <!-- 1단계: 초기 화면 -->
    <div v-if="currentStep === 1" class="step-container step-1">
      <div class="step-content">
        <h2 class="page-title">친구간 송금</h2>
        <div class="welcome-card">
          <h3>간편하고 빠른 친구간 송금</h3>
          <p>보유 통화에서 원하는 통화로 자유롭게 송금하세요</p>
          <button class="send-button" @click="nextStep">
            보내기
          </button>
        </div>
      </div>
    </div>

    <!-- 2단계: 통화 선택 (FROM/TO) -->
    <div v-if="currentStep === 2" class="step-container">
      <div class="step-content">
        <div class="step-header">
          <button class="back-btn" @click="prevStep">←</button>
          <h2 class="page-title">송금 통화 설정</h2>
        </div>

        <!-- 내 잔액 표시 -->
        <div class="balance-section">
          <h3>내 잔액</h3>
          <div class="balance-grid">
            <div v-for="balance in myBalances" :key="balance.code" class="balance-item">
              <span class="balance-currency">{{ balance.code }}</span>
              <span class="balance-amount">{{ balance.amount }}</span>
            </div>
          </div>
        </div>

        <!-- FROM 통화 선택 -->
        <div class="currency-section">
          <h3>보낼 통화 선택 (FROM)</h3>
          <div class="currency-grid">
            <div 
              v-for="currency in availableFromCurrencies" 
              :key="'from-' + currency.code"
              class="currency-card"
              :class="{ active: fromCurrency === currency.code }"
              @click="selectFromCurrency(currency.code)"
            >
              <div class="currency-flag">{{ currency.flag }}</div>
              <div class="currency-info">
                <div class="currency-code">{{ currency.code }}</div>
                <div class="currency-name">{{ currency.name }}</div>
                <div class="currency-balance">잔액: {{ getMyBalance(currency.code) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TO 통화 선택 -->
        <div class="currency-section">
          <h3>받을 통화 선택 (TO)</h3>
          <div class="currency-grid">
            <div 
              v-for="currency in currencies" 
              :key="'to-' + currency.code"
              class="currency-card"
              :class="{ active: toCurrency === currency.code }"
              @click="selectToCurrency(currency.code)"
            >
              <div class="currency-flag">{{ currency.flag }}</div>
              <div class="currency-info">
                <div class="currency-code">{{ currency.code }}</div>
                <div class="currency-name">{{ currency.name }}</div>
              </div>
              <div v-if="fromCurrency && fromCurrency !== currency.code" class="currency-rate">
                {{ getExchangeRate(fromCurrency, currency.code) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 선택된 통화 요약 -->
        <div v-if="fromCurrency && toCurrency" class="selection-summary">
          <div class="summary-row">
            <span>{{ fromCurrency }}</span>
            <div class="arrow">→</div>
            <span>{{ toCurrency }}</span>
          </div>
          <div class="summary-info">
            <span v-if="fromCurrency === toCurrency" class="direct-transfer">
              직접 송금 (환전 수수료 없음)
            </span>
            <span v-else class="exchange-transfer">
              환율: {{ getExchangeRate(fromCurrency, toCurrency) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="step-actions">
        <button 
          class="continue-btn" 
          :disabled="!fromCurrency || !toCurrency"
          @click="nextStep"
        >
          계속
        </button>
      </div>
    </div>

    <!-- 3단계: 수취인 정보 입력 (단계적 완료 후 다음 단계 진행) -->
    <div v-if="currentStep === 3" class="step-container">
      <div class="step-content">
        <div class="step-header">
          <button class="back-btn" @click="prevStep">←</button>
          <h2 class="page-title">수취인 정보</h2>
        </div>

        <div class="form-container">
          <!-- 1단계: 이름 입력 -->
          <div class="form-group">
            <label class="form-label">누구에게 보낼까요?</label>
            <div class="input-with-confirm">
              <input 
                v-model="recipientName" 
                type="text" 
                class="form-input"
                placeholder="받는 분 이름을 입력하세요"
                @keyup.enter="confirmNameInput"
                :disabled="nameConfirmed"
              >
              <button 
                v-if="recipientName.trim() && !nameConfirmed" 
                class="confirm-btn"
                @click="confirmNameInput"
              >
                확인
              </button>
              <div v-if="nameConfirmed" class="confirmed-mark">✓</div>
            </div>
          </div>

          <!-- 2단계: 전화번호 입력 (이름 확인 후에만 표시) -->
          <transition name="slide-down">
            <div v-if="nameConfirmed" class="form-group">
              <label class="form-label">휴대폰 번호</label>
              <div class="input-with-confirm">
                <input 
                  v-model="recipientPhone" 
                  type="tel" 
                  class="form-input"
                  placeholder="010-0000-0000"
                  @keyup.enter="confirmPhoneInput"
                  :disabled="phoneConfirmed"
                  ref="phoneInput"
                >
                <button 
                  v-if="recipientPhone.trim() && !phoneConfirmed" 
                  class="confirm-btn"
                  @click="confirmPhoneInput"
                >
                  확인
                </button>
                <div v-if="phoneConfirmed" class="confirmed-mark">✓</div>
              </div>
            </div>
          </transition>

          <!-- 통화 선택 요약 (모든 입력 완료 후에만 표시) -->
          <transition name="slide-down">
            <div v-if="nameConfirmed && phoneConfirmed" class="selected-currency-info">
              <div class="currency-flow">
                <div class="currency-badge">{{ fromCurrency }}</div>
                <span class="arrow">→</span>
                <div class="currency-badge">{{ toCurrency }}</div>
              </div>
              <span v-if="fromCurrency === toCurrency">직접 송금</span>
              <span v-else>환전 후 송금</span>
            </div>
          </transition>
        </div>
      </div>
      
      <div class="step-actions">
        <button 
          class="continue-btn" 
          :disabled="!nameConfirmed || !phoneConfirmed"
          @click="nextStep"
        >
          계속
        </button>
      </div>
    </div>

    <!-- 4단계: 송금 금액 입력 -->
    <div v-if="currentStep === 4" class="step-container">
      <div class="step-content">
        <div class="step-header">
          <button class="back-btn" @click="prevStep">←</button>
          <h2 class="page-title">송금 금액</h2>
        </div>

        <div class="amount-container">
          <div class="recipient-summary">
            <div class="recipient-info">
              <span class="recipient-name">수취인 : {{ recipientName }}</span>
              <span class="recipient-phone">휴대폰 번호 : {{ recipientPhone }}</span>
            </div>
            <div class="currency-flow">
              <div class="currency-badge">{{ fromCurrency }}</div>
              <span class="arrow">→</span>
              <div class="currency-badge">{{ toCurrency }}</div>
            </div>
          </div>

          <div class="amount-input-section">
            <label class="form-label">보낼 금액 ({{ fromCurrency }})</label>
            <div class="amount-input-container">
              <input 
                v-model="sendAmount" 
                type="number" 
                class="amount-input"
                placeholder="0"
                :max="getMyBalanceNumber(fromCurrency)"
              >
              <span class="currency-symbol">{{ fromCurrency }}</span>
            </div>
            <div class="balance-info">
              사용 가능: {{ getMyBalance(fromCurrency) }} {{ fromCurrency }}
            </div>
          </div>

          <div class="conversion-info" v-if="sendAmount">
            <div class="conversion-row" v-if="fromCurrency !== toCurrency">
              <span>환율 ({{ fromCurrency }} → {{ toCurrency }})</span>
              <span>{{ getExchangeRate(fromCurrency, toCurrency) }}</span>
            </div>
            <div class="conversion-row">
              <span>받을 금액</span>
              <span>{{ calculateReceiveAmount() }} {{ toCurrency }}</span>
            </div>
            <div class="conversion-row">
              <span>수수료</span>
              <span>{{ calculateFee() }} {{ fromCurrency }}</span>
            </div>
            <div class="conversion-row total">
              <span>차감될 금액</span>
              <span>{{ calculateTotal() }} {{ fromCurrency }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="step-actions">
        <button 
          class="send-final-btn" 
          :disabled="!sendAmount || sendAmount <= 0 || sendAmount > getMyBalanceNumber(fromCurrency)"
          @click="confirmSend"
        >
          {{ sendAmount ? `${calculateReceiveAmount()} ${toCurrency} 보내기` : '금액을 입력하세요' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// 반응형 상태 정의
const currentStep = ref(1)
const fromCurrency = ref('')
const toCurrency = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const sendAmount = ref('')
const phoneInput = ref(null)

// 입력 확인 상태
const nameConfirmed = ref(false)
const phoneConfirmed = ref(false)

// 사용자 보유 잔액 데이터
const myBalances = ref([
  { code: 'KRW', amount: '1,250,000' },
  { code: 'USD', amount: '850.50' },
  { code: 'EUR', amount: '420.30' },
  { code: 'JPY', amount: '125,000' }
])

// 전체 지원 통화 목록
const currencies = ref([
  { code: 'KRW', name: '한국 원', flag: '🇰🇷' },
  { code: 'USD', name: '미국 달러', flag: '🇺🇸' },
  { code: 'EUR', name: '유럽 유로', flag: '🇪🇺' },
  { code: 'JPY', name: '일본 엔', flag: '🇯🇵' },
])

// 환율 정보 객체
const exchangeRates = ref({
  'KRW-USD': 0.000773,
  'USD-KRW': 1293.33,
  'KRW-EUR': 0.000709,
  'EUR-KRW': 1410.25,
  'KRW-JPY': 0.1118,
  'JPY-KRW': 8.95,
  'USD-EUR': 0.917,
  'EUR-USD': 1.091,
  'USD-JPY': 144.5,
  'JPY-USD': 0.00692
})

// 계산된 속성: 보낼 수 있는 통화 (잔액이 있는 통화만 필터링)
const availableFromCurrencies = computed(() => {
  return currencies.value.filter(currency => 
    myBalances.value.some(balance => balance.code === currency.code)
  )
})

// 이름 입력 확인
const confirmNameInput = async () => {
  if (recipientName.value.trim()) {
    nameConfirmed.value = true
    await nextTick()
    if (phoneInput.value) {
      phoneInput.value.focus()
    }
  }
}

// 전화번호 입력 확인
const confirmPhoneInput = () => {
  if (recipientPhone.value.trim()) {
    phoneConfirmed.value = true
  }
}

// 단계 이동 함수
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    // 3단계로 돌아갈 때 확인 상태 리셋
    if (currentStep.value === 3) {
      nameConfirmed.value = false
      phoneConfirmed.value = false
    }
  }
}

// 통화 선택 함수들
const selectFromCurrency = (code) => {
  fromCurrency.value = code
}

const selectToCurrency = (code) => {
  toCurrency.value = code
}

// 잔액 조회 함수 (문자열 형태)
const getMyBalance = (currencyCode) => {
  const balance = myBalances.value.find(b => b.code === currencyCode)
  return balance ? balance.amount : '0'
}

// 잔액 조회 함수 (숫자 형태)
const getMyBalanceNumber = (currencyCode) => {
  const balance = myBalances.value.find(b => b.code === currencyCode)
  return balance ? parseFloat(balance.amount.replace(/,/g, '')) : 0
}

// 환율 계산 함수
const getExchangeRate = (from, to) => {
  if (from === to) return '1.0000'
  
  const key = `${from}-${to}`
  const reverseKey = `${to}-${from}`
  
  if (exchangeRates.value[key]) {
    return exchangeRates.value[key].toFixed(4)
  } else if (exchangeRates.value[reverseKey]) {
    return (1 / exchangeRates.value[reverseKey]).toFixed(4)
  }
  return '1.0000'
}

// 받을 금액 계산
const calculateReceiveAmount = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  const rate = parseFloat(getExchangeRate(fromCurrency.value, toCurrency.value))
  return (amount * rate).toFixed(2)
}

// 수수료 계산
const calculateFee = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  // 같은 통화면 수수료 없음, 다른 통화면 0.1%
  const feeRate = fromCurrency.value === toCurrency.value ? 0 : 0.001
  return (amount * feeRate).toFixed(2)
}

// 총 차감 금액 계산
const calculateTotal = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  const fee = parseFloat(calculateFee())
  return (amount + fee).toFixed(2)
}

// 송금 확인 함수
const confirmSend = () => {
  const receiveAmount = calculateReceiveAmount()
  const message = fromCurrency.value === toCurrency.value 
    ? `${recipientName.value}님에게 ${sendAmount.value} ${fromCurrency.value} 직접 송금을 시작합니다.`
    : `${recipientName.value}님에게 ${sendAmount.value} ${fromCurrency.value}를 환전하여 ${receiveAmount} ${toCurrency.value}로 송금을 시작합니다.`
  alert(message)
}
</script>

<style scoped>
/* 기존 스타일들... */
html, body {
  background-color: #f8f9fa !important;
  margin: 0;
  padding: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-content {
  width: 100%;
  max-width: none;
  background: #f8f9fa !important;
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 160px);
}

.step-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
}

.step-container.step-1 {
  justify-content: center;
  max-width: 1000px;
}

.step-content {
  flex: 1;
}

.step-actions {
  margin-top: auto;
  padding-top: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.back-btn {
  background: white;
  border: 1px solid #e9ecef;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.8rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e9ecef;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.balance-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.balance-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.4rem;
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.balance-currency {
  font-weight: 600;
  color: #20c997;
  font-size: 1.1rem;
}

.balance-amount {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.currency-section {
  margin-bottom: 3rem;
}

.currency-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.4rem;
}

.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.currency-card {
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
}

.currency-card:hover {
  border-color: #20c997;
  transform: translateY(-2px);
}

.currency-card.active {
  border-color: #20c997;
  background-color: #f0fdfa;
}

.currency-flag {
  font-size: 2.5rem;
}

.currency-info {
  flex: 1;
}

.currency-code {
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.currency-name {
  color: #6c757d;
  font-size: 1rem;
}

.currency-balance {
  color: #20c997;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.currency-rate {
  font-weight: 600;
  color: #20c997;
  text-align: right;
  font-size: 1.1rem;
}

.selection-summary {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.arrow {
  font-size: 2rem;
}

.summary-info {
  opacity: 0.9;
  font-size: 1.1rem;
}

.currency-flow {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.currency-badge {
  background: #20c997;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
}

.welcome-card {
  text-align: center;
  padding: 4rem 3rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
  margin-top: 3rem;
}

.welcome-card h3 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.welcome-card p {
  opacity: 0.9;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.send-button {
  background: white;
  color: #20c997;
  border: none;
  padding: 1.5rem 4rem;
  border-radius: 60px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-button:hover {
  transform: translateY(-3px);
}

/* 폼 스타일 - 확인 버튼이 있는 입력 스타일 */
.form-container {
  margin-bottom: 3rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #333;
  font-size: 1.1rem;
}

.input-with-confirm {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-input {
  flex: 1;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #20c997;
  box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
}

.confirm-btn {
  padding: 1.5rem 2rem;
  background: #20c997;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.confirm-btn:hover {
  background: #17a085;
  transform: translateY(-1px);
}

.confirmed-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #20c997;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
}

.selected-currency-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background-color: rgba(240, 253, 250, 0.8);
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid #e9ecef;
  justify-content: center;
  font-size: 1.1rem;
}

/* 애니메이션 효과 */
.slide-down-enter-active {
  transition: all 0.4s ease-out;
}

.slide-down-leave-active {
  transition: all 0.3s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 금액 입력 관련 스타일들 */
.amount-container {
  margin-bottom: 3rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.recipient-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin-bottom: 3rem;
  border: 1px solid #e9ecef;
}

.recipient-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipient-name {
  font-weight: 600;
  font-size: 1.2rem;
}

.recipient-phone {
  color: #6c757d;
  font-size: 1rem;
}

.amount-input-section {
  margin-bottom: 3rem;
}

.amount-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input {
  width: 100%;
  padding: 2rem;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.2s;
  background: white;
}

.amount-input:focus {
  outline: none;
  border-color: #20c997;
}

.currency-symbol {
  position: absolute;
  right: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #6c757d;
}

.balance-info {
  text-align: center;
  color: #6c757d;
  font-size: 1rem;
  margin-top: 1rem;
}

.conversion-info {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e9ecef;
}

.conversion-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.conversion-row.total {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.3rem;
}

.continue-btn, .send-final-btn {
  width: 100%;
  padding: 1.5rem 2rem;
  background: #20c997;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover, .send-final-btn:hover {
  background: #17a085;
  transform: translateY(-2px);
}

.continue-btn:disabled, .send-final-btn:disabled {
  background: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.send-final-btn {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  font-size: 1.4rem;
  padding: 1.8rem 2rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 2rem;
  }
  
  .step-container {
    max-width: 100%;
  }
  
  .currency-grid {
    grid-template-columns: 1fr;
  }
  
  .balance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .input-with-confirm {
    flex-direction: column;
    align-items: stretch;
  }
  
  .confirm-btn {
    margin-top: 1rem;
  }
}
</style>
  