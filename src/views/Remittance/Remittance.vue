<template>
<!-- 메인 콘텐츠 -->
      <div class="main-content">
        <!-- 1단계: 초기 화면 -->
        <div v-if="currentStep === 1" class="step-container">
          <h2 class="page-title">친구간 송금</h2>
          <div class="welcome-card">
            <h3>간편하고 빠른 친구간 송금</h3>
            <p>보유 통화에서 원하는 통화로 자유롭게 송금하세요</p>
            <button class="send-button" @click="nextStep">
              보내기
            </button>
          </div>
        </div>

        <!-- 2단계: 통화 선택 (FROM/TO) -->
        <div v-if="currentStep === 2" class="step-container">
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

          <button 
            class="continue-btn" 
            :disabled="!fromCurrency || !toCurrency"
            @click="nextStep"
          >
            계속
          </button>
        </div>

        <!-- 3단계: 수취인 정보 입력 -->
        <div v-if="currentStep === 3" class="step-container">
          <div class="step-header">
            <button class="back-btn" @click="prevStep">←</button>
            <h2 class="page-title">수취인 정보</h2>
          </div>

          <div class="form-container">
            <div class="form-group">
              <label class="form-label">누구에게 보낼까요?</label>
              <input 
                v-model="recipientName" 
                type="text" 
                class="form-input"
                placeholder="받는 분 이름을 입력하세요"
              >
            </div>

            <div class="form-group">
              <label class="form-label">휴대폰 번호</label>
              <input 
                v-model="recipientPhone" 
                type="tel" 
                class="form-input"
                placeholder="010-0000-0000"
              >
            </div>

            <div class="selected-currency-info">
              <div class="currency-flow">
                <div class="currency-badge">{{ fromCurrency }}</div>
                <span class="arrow">→</span>
                <div class="currency-badge">{{ toCurrency }}</div>
              </div>
              <span v-if="fromCurrency === toCurrency">직접 송금</span>
              <span v-else>환전 후 송금</span>
            </div>
          </div>

          <button 
            class="continue-btn" 
            :disabled="!recipientName || !recipientPhone"
            @click="nextStep"
          >
            계속
          </button>
        </div>

        <!-- 4단계: 송금 금액 입력 -->
        <div v-if="currentStep === 4" class="step-container">
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

          <button 
            class="send-final-btn" 
            :disabled="!sendAmount || sendAmount <= 0 || sendAmount > getMyBalanceNumber(fromCurrency)"
            @click="confirmSend"
          >
            {{ sendAmount ? `${calculateReceiveAmount()} ${toCurrency} 보내기` : '금액을 입력하세요' }}
          </button>
        </div>
      </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'FriendTransfer',
  setup() {
    const currentStep = ref(1)
    const fromCurrency = ref('')
    const toCurrency = ref('')
    const recipientName = ref('')
    const recipientPhone = ref('')
    const sendAmount = ref('')

    // 사용자 보유 잔액
    const myBalances = ref([
      { code: 'KRW', amount: '1,250,000' },
      { code: 'USD', amount: '850.50' },
      { code: 'EUR', amount: '420.30' },
      { code: 'JPY', amount: '125,000' }
    ])

    // 전체 지원 통화
    const currencies = ref([
      { code: 'KRW', name: '한국 원', flag: '🇰🇷' },
      { code: 'USD', name: '미국 달러', flag: '🇺🇸' },
      { code: 'EUR', name: '유럽 유로', flag: '🇪🇺' },
      { code: 'JPY', name: '일본 엔', flag: '🇯🇵' },
    //   { code: 'CNY', name: '중국 위안', flag: '🇨🇳' },
    //   { code: 'GBP', name: '영국 파운드', flag: '🇬🇧' },
    //   { code: 'AUD', name: '호주 달러', flag: '🇦🇺' }
    ])

    // 환율 정보
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

    // 보낼 수 있는 통화 (잔액이 있는 통화만)
    const availableFromCurrencies = computed(() => {
      return currencies.value.filter(currency => 
        myBalances.value.some(balance => balance.code === currency.code)
      )
    })

    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const selectFromCurrency = (code) => {
      fromCurrency.value = code
    }

    const selectToCurrency = (code) => {
      toCurrency.value = code
    }

    const getMyBalance = (currencyCode) => {
      const balance = myBalances.value.find(b => b.code === currencyCode)
      return balance ? balance.amount : '0'
    }

    const getMyBalanceNumber = (currencyCode) => {
      const balance = myBalances.value.find(b => b.code === currencyCode)
      return balance ? parseFloat(balance.amount.replace(/,/g, '')) : 0
    }

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

    const calculateReceiveAmount = () => {
      if (!sendAmount.value) return '0'
      const amount = parseFloat(sendAmount.value)
      const rate = parseFloat(getExchangeRate(fromCurrency.value, toCurrency.value))
      return (amount * rate).toFixed(2)
    }

    const calculateFee = () => {
      if (!sendAmount.value) return '0'
      const amount = parseFloat(sendAmount.value)
      // 같은 통화면 수수료 없음, 다른 통화면 0.1%
      const feeRate = fromCurrency.value === toCurrency.value ? 0 : 0.001
      return (amount * feeRate).toFixed(2)
    }

    const calculateTotal = () => {
      if (!sendAmount.value) return '0'
      const amount = parseFloat(sendAmount.value)
      const fee = parseFloat(calculateFee())
      return (amount + fee).toFixed(2)
    }

    const confirmSend = () => {
      const receiveAmount = calculateReceiveAmount()
      const message = fromCurrency.value === toCurrency.value 
        ? `${recipientName.value}님에게 ${sendAmount.value} ${fromCurrency.value} 직접 송금을 시작합니다.`
        : `${recipientName.value}님에게 ${sendAmount.value} ${fromCurrency.value}를 환전하여 ${receiveAmount} ${toCurrency.value}로 송금을 시작합니다.`
      alert(message)
    }

    return {
      currentStep,
      fromCurrency,
      toCurrency,
      recipientName,
      recipientPhone,
      sendAmount,
      myBalances,
      currencies,
      availableFromCurrencies,
      nextStep,
      prevStep,
      selectFromCurrency,
      selectToCurrency,
      getMyBalance,
      getMyBalanceNumber,
      getExchangeRate,
      calculateReceiveAmount,
      calculateFee,
      calculateTotal,
      confirmSend
    }
  }
}
</script>

<style scoped>
/* 기존 스타일 유지하고 새로운 스타일 추가 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: #20c997;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-menu span {
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-menu span:hover {
  background-color: #f8f9fa;
  color: #20c997;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.sidebar {
  width: 200px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
}

.sidebar-title {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.nav-item {
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.nav-item.active {
  background-color: #20c997;
  color: white;
}

.nav-item:hover:not(.active) {
  background-color: #f8f9fa;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.step-container {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 잔액 표시 */
.balance-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.balance-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.balance-currency {
  font-weight: 600;
  color: #20c997;
}

.balance-amount {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* 통화 섹션 */
.currency-section {
  margin-bottom: 2rem;
}

.currency-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.currency-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.currency-card:hover {
  border-color: #20c997;
  transform: translateY(-1px);
}

.currency-card.active {
  border-color: #20c997;
  background-color: #f0fdfa;
}

.currency-flag {
  font-size: 2rem;
}

.currency-info {
  flex: 1;
}

.currency-code {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.currency-name {
  color: #6c757d;
  font-size: 0.9rem;
}

.currency-balance {
  color: #20c997;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.currency-rate {
  font-weight: 600;
  color: #20c997;
  text-align: right;
}

/* 선택 요약 */
.selection-summary {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.arrow {
  font-size: 1.5rem;
}

.summary-info {
  opacity: 0.9;
}

.direct-transfer {
  color: #d1ecf1;
}

.exchange-transfer {
  color: #fff3cd;
}

/* 통화 흐름 표시 */
.currency-flow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-badge {
  background: #20c997;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* 1단계 - 환영 화면 */
.welcome-card {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
  margin-top: 2rem;
}

.welcome-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-card p {
  opacity: 0.9;
  margin-bottom: 2rem;
}

.send-button {
  background: white;
  color: #20c997;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-button:hover {
  transform: translateY(-2px);
}

/* 폼 스타일 */
.form-container {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #20c997;
}

.selected-currency-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f0fdfa;
  border-radius: 8px;
  margin-top: 1rem;
}

/* 금액 입력 */
.amount-container {
  margin-bottom: 2rem;
}

.recipient-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.recipient-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recipient-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.recipient-phone {
  color: #6c757d;
  font-size: 0.9rem;
}

.amount-input-section {
  margin-bottom: 2rem;
}

.amount-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input {
  width: 100%;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.2s;
}

.amount-input:focus {
  outline: none;
  border-color: #20c997;
}

.currency-symbol {
  position: absolute;
  right: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #6c757d;
}

.balance-info {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.conversion-info {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.conversion-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.conversion-row.total {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
}

/* 버튼 스타일 */
.continue-btn, .send-final-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: #20c997;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover, .send-final-btn:hover {
  background: #17a085;
  transform: translateY(-1px);
}

.continue-btn:disabled, .send-final-btn:disabled {
  background: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.send-final-btn {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  font-size: 1.2rem;
  padding: 1.25rem 2rem;
}
</style>