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
                {{ getFinalExchangeRate() }}
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
            <span v-else-if="isCrossExchange()" class="exchange-transfer">
              교차 환전 ({{ fromCurrency }} → KRW → {{ toCurrency }})
            </span>
            <span v-else class="exchange-transfer">
              환율: {{ getFinalExchangeRate() }}
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

    <!-- 3단계: 수취인 정보 입력 -->
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

          <!-- 2단계: 전화번호 입력 -->
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

          <!-- 통화 선택 요약 -->
          <transition name="slide-down">
            <div v-if="nameConfirmed && phoneConfirmed" class="selected-currency-info">
              <div class="currency-flow">
                <div class="currency-badge">{{ fromCurrency }}</div>
                <span class="arrow">→</span>
                <div class="currency-badge">{{ toCurrency }}</div>
              </div>
              <span v-if="fromCurrency === toCurrency">직접 송금</span>
              <span v-else-if="isCrossExchange()">교차 환전 (KRW 경유)</span>
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
            <!-- 교차 환전 상세 정보 표시 -->
            <div v-if="isCrossExchange()" class="conversion-row cross-info">
              <span>교차 환전 경로</span>
              <span>{{ fromCurrency }} → KRW → {{ toCurrency }}</span>
            </div>
            
            <div v-if="isCrossExchange()" class="conversion-row">
              <span>1단계: {{ fromCurrency }} → KRW</span>
              <span>{{ getStep1Rate() }}</span>
            </div>
            
            <div v-if="isCrossExchange()" class="conversion-row">
              <span>2단계: KRW → {{ toCurrency }}</span>
              <span>{{ getStep2Rate() }}</span>
            </div>

            <div class="conversion-row" v-if="fromCurrency !== toCurrency">
              <span>최종 환율 ({{ fromCurrency }} → {{ toCurrency }})</span>
              <span>{{ getFinalExchangeRate() }}</span>
            </div>
            
            <div class="conversion-row">
              <span>받을 금액</span>
              <span>{{ calculateReceiveAmount() }} {{ toCurrency }}</span>
            </div>
            
            <div class="conversion-row">
              <span>수수료 {{ getFeeDescription() }}</span>
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
          class="continue-btn" 
          :disabled="!sendAmount || sendAmount <= 0 || sendAmount > getMyBalanceNumber(fromCurrency)"
          @click="nextStep"
        >
          계속
        </button>
      </div>
    </div>

    <!-- 5단계: 비밀번호 입력 -->
    <div v-if="currentStep === 5" class="step-container">
      <div class="step-content">
        <div class="step-header">
          <button class="back-btn" @click="prevStep">←</button>
          <h2 class="page-title">거래 비밀번호</h2>
        </div>

        <div class="password-container">
          <!-- 송금 요약 정보 -->
          <div class="transfer-summary">
            <h3>송금 정보 확인</h3>
            <div class="summary-details">
              <div class="summary-item">
                <span class="label">수취인</span>
                <span class="value">{{ recipientName }} ({{ recipientPhone }})</span>
              </div>
              <div class="summary-item">
                <span class="label">송금 통화</span>
                <span class="value">{{ fromCurrency }} → {{ toCurrency }}</span>
              </div>
              <div v-if="isCrossExchange()" class="summary-item">
                <span class="label">거래 방식</span>
                <span class="value">교차 환전 (KRW 경유)</span>
              </div>
              <div class="summary-item">
                <span class="label">보낼 금액</span>
                <span class="value">{{ sendAmount }} {{ fromCurrency }}</span>
              </div>
              <div class="summary-item">
                <span class="label">받을 금액</span>
                <span class="value">{{ calculateReceiveAmount() }} {{ toCurrency }}</span>
              </div>
              <div class="summary-item total">
                <span class="label">총 차감 금액</span>
                <span class="value">{{ calculateTotal() }} {{ fromCurrency }}</span>
              </div>
            </div>
          </div>

          <!-- 비밀번호 입력 -->
          <div class="password-input-section">
            <label class="form-label">거래 비밀번호 (4자리)</label>
            <div class="password-input-container">
              <input 
                v-model="transactionPassword" 
                type="password" 
                class="password-input"
                placeholder="••••"
                maxlength="4"
                @input="transactionPassword = transactionPassword.replace(/\D/g, '')"
              >
            </div>
            <p class="password-hint">안전한 거래를 위해 4자리 숫자 비밀번호를 입력해주세요.</p>
          </div>
        </div>
      </div>
      
      <div class="step-actions">
        <button 
          class="execute-btn" 
          :disabled="!transactionPassword || transactionPassword.length !== 4 || isProcessing"
          @click="executeTransfer"
        >
          <span v-if="isProcessing">처리 중...</span>
          <span v-else>{{ calculateReceiveAmount() }} {{ toCurrency }} 송금하기</span>
        </button>
      </div>
    </div>

    <!-- 6단계: 송금 완료 -->
    <div v-if="currentStep === 6" class="step-container step-complete">
      <div class="step-content">
        <div class="completion-container">
          <div class="success-icon">✓</div>
          <h2 class="completion-title">송금이 완료되었습니다!</h2>
          
          <div class="completion-details">
            <div class="detail-item">
              <span class="label">거래번호</span>
              <span class="value">{{ transferResult?.transactionId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">수취인</span>
              <span class="value">{{ recipientName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">송금 방식</span>
              <span class="value">{{ getTransferTypeDescription() }}</span>
            </div>
            <div class="detail-item">
              <span class="label">송금 금액</span>
              <span class="value">{{ calculateReceiveAmount() }} {{ toCurrency }}</span>
            </div>
            <div class="detail-item">
              <span class="label">처리 시간</span>
              <span class="value">{{ new Date().toLocaleString() }}</span>
            </div>
          </div>

          <div class="completion-message">
            <p>{{ recipientName }}님에게 송금이 성공적으로 완료되었습니다.</p>
            <p>거래 내역은 거래 내역 페이지에서 확인하실 수 있습니다.</p>
          </div>
        </div>
      </div>
      
      <div class="step-actions">
        <div class="completion-buttons">
          <button class="secondary-btn" @click="$router.push('/transaction/history')">
            거래 내역 보기
          </button>
          <button class="primary-btn" @click="startNewTransfer">
            새 송금하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응형 상태 정의
const currentStep = ref(1)
const fromCurrency = ref('')
const toCurrency = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const sendAmount = ref('')
const transactionPassword = ref('')
const phoneInput = ref(null)

// 상태 관리
const nameConfirmed = ref(false)
const phoneConfirmed = ref(false)
const isProcessing = ref(false)
const transferResult = ref(null)

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

// 환율 정보 객체 (KRW 기준으로 정리)
const exchangeRates = ref({
  // KRW 기준 환율 (직접 거래)
  'KRW-USD': 0.000773,    // KRW → USD (매도율/송금율)
  'USD-KRW': 1293.33,     // USD → KRW (매수율/수취율)
  'KRW-EUR': 0.000709,    // KRW → EUR  
  'EUR-KRW': 1410.25,     // EUR → KRW
  'KRW-JPY': 0.1118,      // KRW → JPY
  'JPY-KRW': 8.95,        // JPY → KRW
})

// 계산된 속성: 보낼 수 있는 통화 (잔액이 있는 통화만)
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
  if (currentStep.value < 6) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
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

// 교차 환율 여부 확인 (외화간 거래)
const isCrossExchange = () => {
  if (!fromCurrency.value || !toCurrency.value) return false
  if (fromCurrency.value === toCurrency.value) return false
  return fromCurrency.value !== 'KRW' && toCurrency.value !== 'KRW'
}

// 거래 타입 확인  
const getTransferType = () => {
  if (fromCurrency.value === toCurrency.value) return 'DIRECT'
  if (fromCurrency.value === 'KRW' || toCurrency.value === 'KRW') return 'EXCHANGE'
  return 'CROSS_EXCHANGE'
}

// 거래 타입 설명
const getTransferTypeDescription = () => {
  const type = getTransferType()
  switch (type) {
    case 'DIRECT': return '직접 송금'
    case 'EXCHANGE': return '환전 송금'
    case 'CROSS_EXCHANGE': return '교차 환전 (KRW 경유)'
    default: return '송금'
  }
}

// 1단계 환율 (외화 → KRW) - 교차 환전 시
const getStep1Rate = () => {
  if (!isCrossExchange()) return '1.0000'
  const key = `${fromCurrency.value}-KRW`
  return exchangeRates.value[key] ? exchangeRates.value[key].toFixed(4) : '0.0000'
}

// 2단계 환율 (KRW → 외화) - 교차 환전 시
const getStep2Rate = () => {
  if (!isCrossExchange()) return '1.0000'
  const key = `KRW-${toCurrency.value}`
  return exchangeRates.value[key] ? exchangeRates.value[key].toFixed(4) : '0.0000'
}

// 최종 환율 계산 (한국 외환 규정 준수)
const getFinalExchangeRate = () => {
  if (fromCurrency.value === toCurrency.value) return '1.0000'
  
  // 직접 거래 (KRW 포함)
  if (fromCurrency.value === 'KRW' || toCurrency.value === 'KRW') {
    const key = `${fromCurrency.value}-${toCurrency.value}`
    return exchangeRates.value[key] ? exchangeRates.value[key].toFixed(4) : '1.0000'
  }
  
  // 교차 거래 (외화 → KRW → 외화)
  const step1Rate = parseFloat(getStep1Rate()) // 외화 → KRW
  const step2Rate = parseFloat(getStep2Rate()) // KRW → 외화
  const finalRate = step1Rate * step2Rate
  return finalRate.toFixed(6)
}

// 환율 조회 함수 (호환성 유지)
const getExchangeRate = (from, to) => {
  return getFinalExchangeRate()
}

// 받을 금액 계산
const calculateReceiveAmount = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  const rate = parseFloat(getFinalExchangeRate())
  return (amount * rate).toFixed(2)
}

// 수수료 계산 (교차 거래 시 높은 수수료)
const calculateFee = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  
  if (fromCurrency.value === toCurrency.value) {
    return '0.00' // 같은 통화
  } else if (fromCurrency.value === 'KRW' || toCurrency.value === 'KRW') {
    // 직접 거래: 0.1%
    return (amount * 0.001).toFixed(2)
  } else {
    // 교차 거래: 0.2% (2번 거래)
    return (amount * 0.002).toFixed(2)
  }
}

// 수수료 설명
const getFeeDescription = () => {
  const type = getTransferType()
  switch (type) {
    case 'DIRECT': return '(무료)'
    case 'EXCHANGE': return '(0.1%)'
    case 'CROSS_EXCHANGE': return '(0.2%, 교차거래)'
    default: return ''
  }
}

// 총 차감 금액 계산
const calculateTotal = () => {
  if (!sendAmount.value) return '0'
  const amount = parseFloat(sendAmount.value)
  const fee = parseFloat(calculateFee())
  return (amount + fee).toFixed(2)
}

// 비밀번호 확인 및 송금 실행
const executeTransfer = async () => {
  if (!transactionPassword.value || transactionPassword.value.length !== 4) {
    alert('4자리 거래 비밀번호를 입력해주세요.')
    return
  }

  isProcessing.value = true

  try {
    const transferData = {
      recipientPhone: recipientPhone.value,
      recipientName: recipientName.value,
      fromCurrencyCode: fromCurrency.value,
      toCurrencyCode: toCurrency.value,
      sendAmount: parseFloat(sendAmount.value),
      transactionPassword: transactionPassword.value,
    }

    // 실제 API 호출로 교체해야 함
    const response = await simulateTransferAPI(transferData)
    
    if (response.success) {
      transferResult.value = response.data
      nextStep() // 6단계(완료 페이지)로 이동
    } else {
      alert('송금에 실패했습니다: ' + response.message)
    }
  } catch (error) {
    alert('송금 중 오류가 발생했습니다.')
    console.error(error)
  } finally {
    isProcessing.value = false
  }
}

// API 호출 시뮬레이션 함수 (실제 구현 시 제거)
const simulateTransferAPI = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          transactionId: 'TX' + Date.now(),
          status: 'COMPLETED',
          transferTime: new Date().toISOString(),
          message: '송금이 완료되었습니다.'
        }
      })
    }, 2000) // 2초 지연으로 로딩 시뮬레이션
  })
}

// 새로 시작하기
const startNewTransfer = () => {
  currentStep.value = 1
  fromCurrency.value = ''
  toCurrency.value = ''
  recipientName.value = ''
  recipientPhone.value = ''
  sendAmount.value = ''
  transactionPassword.value = ''
  nameConfirmed.value = false
  phoneConfirmed.value = false
  transferResult.value = null
}
</script>

<style scoped>
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

.step-container.step-1, .step-container.step-complete {
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

/* 잔액 섹션 */
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

/* 통화 섹션 */
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

/* 시작 화면 */
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

/* 폼 스타일 */
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

/* 애니메이션 */
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

/* 금액 입력 */
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

.conversion-row.cross-info {
  background: rgba(255, 152, 0, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ffab00;
  margin-bottom: 1.5rem;
  color: #f57c00;
  font-weight: 600;
}

/* 비밀번호 입력 스타일 */
.password-container {
  max-width: 800px;
  margin: 0 auto;
}

.transfer-summary {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid #e9ecef;
}

.transfer-summary h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.4rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.summary-item.total {
  border-top: 2px solid #dee2e6;
  border-bottom: none;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.summary-item .label {
  color: #6c757d;
  font-weight: 500;
}

.summary-item .value {
  color: #333;
  font-weight: 600;
}

.password-input-section {
  text-align: center;
}

.password-input-container {
  margin: 1.5rem 0;
}

.password-input {
  width: 300px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 2rem;
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  transition: border-color 0.2s;
}

.password-input:focus {
  outline: none;
  border-color: #20c997;
}

.password-hint {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* 완료 페이지 스타일 */
.completion-container {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin: 0 auto 2rem;
}

.completion-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3rem;
}

.completion-details {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.completion-message {
  margin: 2rem 0;
  color: #6c757d;
  line-height: 1.6;
}

.completion-buttons {
  display: flex;
  gap: 1rem;
}

/* 버튼 스타일 */
.continue-btn, .execute-btn {
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

.continue-btn:hover, .execute-btn:hover {
  background: #17a085;
  transform: translateY(-2px);
}

.continue-btn:disabled, .execute-btn:disabled {
  background: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.execute-btn {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  font-size: 1.4rem;
  padding: 1.8rem 2rem;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: #20c997;
  color: white;
}

.secondary-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.primary-btn:hover, .secondary-btn:hover {
  transform: translateY(-1px);
}

/* 반응형 */
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
  
  .recipient-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .completion-buttons {
    flex-direction: column;
  }
  
  .password-input {
    width: 250px;
    font-size: 1.5rem;
  }
}
</style>
