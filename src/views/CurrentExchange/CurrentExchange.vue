<template>
  <div class="forex-system">
    <main class="main-content">
      <h1>환전하기</h1>

      <div class="exchange-main">
        <div class="exchange-form">
          <p class="form-subtitle">환전할 통화 선택 및 금액을 입력하세요</p>

          <!-- 잔액 로딩 상태 -->
          <div v-if="balancesLoading" class="balance-loading">
            <div class="loading-spinner"></div>
            <p>잔액 정보를 가져오는 중...</p>
          </div>

          <!-- From Section -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">From</span>
              <div class="balance-info">
                Balance: {{ getBalanceAmount(fromCurrency) }}
                <button class="max-btn" @click="setMaxAmount" :disabled="balancesLoading">Max</button>
              </div>
            </div>

            <div class="currency-input-row">
              <select v-model="fromCurrency" class="currency-dropdown" @change="onCurrencyChange">
                <option value="KRW">🇰🇷 한국 KRW</option>
                <option value="USD">🇺🇸 미국 USD</option>
                <option value="JPY">🇯🇵 일본 JPY</option>
                <option value="EUR">🇪🇺 유럽연합 EUR</option>
                <option value="GBP">🇬🇧 영국 GBP</option>
                <option value="AUD">🇦🇺 오스트레일리아 AUD</option>
                <option value="CAD">🇨🇦 캐나다 CAD</option>
                <option value="CHF">🇨🇭 스위스 CHF</option>
                <option value="CNY">🇨🇳 중국 CNY</option>
              </select>


              <input type="text" v-model="displayAmount" class="amount-input" placeholder="0" @input="onAmountInput"
                :disabled="balancesLoading" />
            </div>
          </div>

          <!-- Exchange Icon -->
          <div class="exchange-icon-container">
            <div class="exchange-icon" @click="swapCurrencies" :class="{ disabled: balancesLoading }">
              ↕
            </div>
          </div>

          <!-- To Section -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">To</span>
            </div>

            <div class="currency-input-row">
              <select v-model="toCurrency" class="currency-dropdown" @change="onCurrencyChange"
                :disabled="fromCurrency !== 'KRW' || balancesLoading">
                <template v-if="fromCurrency === 'KRW'">
                  <option value="USD">🇺🇸 미국 USD</option>
                  <option value="JPY">🇯🇵 일본 JPY</option>
                  <option value="EUR">🇪🇺 유럽연합 EUR</option>
                  <option value="GBP">🇬🇧 영국 GBP</option>
                  <option value="AUD">🇦🇺 오스트레일리아 AUD</option>
                  <option value="CAD">🇨🇦 캐나다 CAD</option>
                  <option value="CHF">🇨🇭 스위스 CHF</option>
                  <option value="CNY">🇨🇳 중국 CNY</option>
                </template>
                <template v-else>
                  <option value="KRW">🇰🇷 한국 KRW</option>
                </template>
              </select>


              <input type="text" :value="formatNumber(simulationResult?.toAmount || 0)" class="amount-input"
                placeholder="0" readonly />
            </div>
          </div>

          <!-- 환전 정보 Section -->
          <div class="exchange-info-section" v-if="simulationResult && inputAmount && inputAmount > 0">
            <div class="exchange-info-header">
              <span class="info-label">환전 정보</span>
            </div>

            <div class="fee-details">
              <div class="fee-row">
                <span class="fee-label">환율</span>
                <span class="fee-value">{{ simulationResult.exchangeRate?.toFixed(4) || '0.0000' }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">수수료(0.005%)</span>
                <span class="fee-value">{{ formatNumber(simulationResult.fee || 0) }} {{ fromCurrency }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">총 차감 금액</span>
                <span class="fee-value">{{ formatNumber(simulationResult.totalDeductedAmount || 0) }} {{ fromCurrency
                }}</span>
              </div>
              <div class="fee-row total-row">
                <span class="fee-label">실제 받을 금액</span>
                <span class="fee-value total-amount">{{ formatNumber(simulationResult.toAmount || 0) }} {{ toCurrency
                }}</span>
              </div>
            </div>

            <div v-if="simulationResult.rateUpdateTime" class="rate-update-time">
              <small>환율 업데이트: {{ simulationResult.rateUpdateTime }}</small>
            </div>
          </div>

          <!-- 로딩 및 에러 표시 -->
          <div v-if="loading" class="loading-message">
            환전 정보를 계산하고 있습니다...
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- 환전하기 버튼 -->
          <button class="exchange-btn" :disabled="!canExecuteExchange" @click="executeExchange">
            {{ getButtonText() }}
          </button>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h3>환율 차트</h3>
            <span class="chart-period" v-if="!chartLoading && chartRates.length > 0">
              {{ formatNumber(simulationResult?.exchangeRate || 0) }}
            </span>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="chartLoading" class="chart-loading">
            <div class="loading-spinner"></div>
            <p>차트 로딩 중...</p>
          </div>

          <!-- 실제 차트 컴포넌트 -->
          <div v-else-if="chartRates.length > 0" class="chart-container">
            <ExchangeRateChart :rates="chartRates" :currencies="getChartCurrencies()" :height="150" />
          </div>

          <!-- 차트 데이터가 없을 때 -->
          <div v-else class="no-chart-data">
            <p>해당 통화의 환율 차트 데이터가 없습니다.</p>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import ExchangeRateChart from '@/components/chart/ExchangeRateChart.vue'

// ==================== 반응형 상태 ====================
const fromCurrency = ref('KRW')
const toCurrency = ref('USD')
const inputAmount = ref('')
const displayAmount = ref('')
const simulationResult = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 차트 관련 상태
const chartRates = ref([])
const chartLoading = ref(false)

// 잔액 정보 - 서버에서 실제로 가져올 데이터
const balances = reactive({
  KRW: 0,
  USD: 0,
  JPY: 0,
  EUR: 0,
  GBP: 0,
  AUD: 0,
  CAD: 0,
  CHF: 0,
  CNY: 0
})


// 원본 잔액 데이터 (서버 응답 그대로 저장)
const balanceData = reactive({})

// 잔액 로딩 상태
const balancesLoading = ref(false)

// 디바운스를 위한 타이머
let simulationTimer = null

// ==================== 인증 관련 ====================

// JWT 토큰 가져오기
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
}

// API 요청 헤더 생성
const getApiHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// ==================== 잔액 관련 함수 ====================

/**
 * 서버에서 모든 잔액 조회
 */
const fetchBalances = async () => {
  balancesLoading.value = true
  errorMessage.value = ''

  try {
    console.log('잔액 조회 시작...')

    const response = await fetch('/api/balance', {
      method: 'GET',
      headers: getApiHeaders()
    })

    const data = await response.json()
    console.log('잔액 API 응답:', data)

    if (response.ok && data.success) {
      // 원본 데이터 저장
      Object.assign(balanceData, data.balances)

      // 숫자형 잔액으로 변환하여 reactive 객체에 저장
      Object.keys(data.balances).forEach(currency => {
        if (balances.hasOwnProperty(currency)) {
          // amount 필드는 이미 포맷된 문자열 (예: "1,000,000.00")
          const amountStr = data.balances[currency].amount
          const numericAmount = parseFloat(amountStr.replace(/,/g, '')) || 0
          balances[currency] = numericAmount
        }
      })

      console.log('잔액 업데이트 완료:', balances)
    } else {
      console.error('잔액 조회 실패:', data)
      errorMessage.value = data.message || '잔액을 불러올 수 없습니다.'

      // 인증 오류 처리
      if (response.status === 401) {
        errorMessage.value = '로그인이 만료되었습니다. 다시 로그인해 주세요.'
      }
    }
  } catch (error) {
    console.error('잔액 조회 API 오류:', error)
    errorMessage.value = '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    balancesLoading.value = false
  }
}

/**
 * 환전 완료 후 잔액 업데이트
 */
const updateBalances = async () => {
  console.log('환전 완료 후 잔액 업데이트 시작...')
  await fetchBalances()
}

/**
 * 메모리에서 통화별 잔액 조회 (포맷된 형태로 반환)
 */
const getBalanceAmount = (currency) => {
  if (balancesLoading.value) return '로딩 중...'
  return formatNumber(balances[currency] || 0)
}

// ==================== Computed Properties ====================

const canExecuteExchange = computed(() => {
  return simulationResult.value &&
    inputAmount.value &&
    parseFloat(inputAmount.value) > 0 &&
    !isAmountExceedsBalance.value &&
    !loading.value &&
    !balancesLoading.value
})

const isAmountExceedsBalance = computed(() => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    return false
  }
  return parseFloat(inputAmount.value) > balances[fromCurrency.value]
})

// ==================== 입력 처리 함수 ====================

const onAmountInput = (event) => {
  let rawValue = event.target.value
  let numericValue = rawValue.replace(/[^0-9.]/g, '')

  // 소수점 2개 이상 방지
  const dotCount = (numericValue.match(/\./g) || []).length
  if (dotCount > 1) {
    numericValue = numericValue.substring(0, numericValue.lastIndexOf('.'))
  }

  // 소수점 이하 2자리 제한
  if (numericValue.includes('.')) {
    const parts = numericValue.split('.')
    if (parts[1] && parts[1].length > 2) {
      numericValue = parts[0] + '.' + parts[1].substring(0, 2)
    }
  }

  inputAmount.value = numericValue

  if (numericValue) {
    displayAmount.value = formatWithCommas(numericValue)
  } else {
    displayAmount.value = ''
  }

  // 디바운스를 사용한 시뮬레이션 호출
  debouncedSimulation()
}

const debouncedSimulation = () => {
  if (simulationTimer) {
    clearTimeout(simulationTimer)
  }

  simulationTimer = setTimeout(() => {
    simulateExchange()
  }, 300)
}

const onCurrencyChange = () => {
  // FROM이 KRW가 아니면 TO를 KRW로 자동 설정
  if (fromCurrency.value !== 'KRW') {
    toCurrency.value = 'KRW'
  } else if (toCurrency.value === fromCurrency.value) {
    toCurrency.value = 'USD'
  }

  simulateExchange()
  fetchChartData()
}

// ==================== 환전 관련 함수 ====================

// 환전 시뮬레이션 API 호출
const simulateExchange = async () => {
  if (!inputAmount.value || parseFloat(inputAmount.value) <= 0) {
    simulationResult.value = null
    errorMessage.value = ''
    return
  }

  if (fromCurrency.value === toCurrency.value) {
    simulationResult.value = null
    errorMessage.value = '동일한 통화는 환전할 수 없습니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/exchange/simulate', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        fromCurrency: fromCurrency.value,
        toCurrency: toCurrency.value,
        amount: parseFloat(inputAmount.value)
      })
    })

    const data = await response.json()
    console.log("환전 시뮬 : ", data)

    if (response.ok && data.success) {
      simulationResult.value = data
    } else {
      errorMessage.value = data.message || '환전 시뮬레이션 중 오류가 발생했습니다.'
      simulationResult.value = null
    }
  } catch (error) {
    console.error('환전 시뮬레이션 오류:', error)
    errorMessage.value = '서버 연결에 실패했습니다.'
    simulationResult.value = null
  } finally {
    loading.value = false
  }
}

// 환전 실행 API 호출
const executeExchange = async () => {
  if (!canExecuteExchange.value) {
    return
  }

  const token = getAuthToken()
  if (!token) {
    errorMessage.value = '로그인이 필요합니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/exchange/execute', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        fromCurrency: fromCurrency.value,
        toCurrency: toCurrency.value,
        amount: parseFloat(inputAmount.value)
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // 성공 처리
      alert(`환전이 완료되었습니다!\n거래번호: ${data.transactionId}`)

      // 잔액 업데이트 (서버에서 최신 잔액 가져오기)
      await updateBalances()

      // 입력 필드 초기화
      resetForm()
    } else {
      errorMessage.value = data.message || '환전 실행 중 오류가 발생했습니다.'
    }
  } catch (error) {
    console.error('환전 실행 오류:', error)
    if (error.name === 'AuthException') {
      errorMessage.value = '인증에 실패했습니다. 다시 로그인해 주세요.'
    } else {
      errorMessage.value = '서버 연결에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// ==================== 유틸리티 함수 ====================

// 폼 초기화
const resetForm = () => {
  inputAmount.value = ''
  displayAmount.value = ''
  simulationResult.value = null
  errorMessage.value = ''
}

const formatWithCommas = (value) => {
  if (!value) return ''

  const parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (parts[1]) {
    parts[1] = parts[1].substring(0, 2)
  }

  return parts.join('.')
}

const swapCurrencies = () => {
  if (balancesLoading.value) return

  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp

  resetForm()
  simulateExchange()
}

const setMaxAmount = () => {
  if (balancesLoading.value) return

  const maxValue = balances[fromCurrency.value].toString()
  inputAmount.value = maxValue
  displayAmount.value = formatWithCommas(maxValue)
  simulateExchange()
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

// const formatDateTime = (dateTime) => {
//   if (!dateTime) return ''
//   console.log(dateTime)
//   try {
//     return new Date(dateTime).toLocaleString('ko-KR')
//   } catch (error) {
//     return dateTime
//   }
// }

const getButtonText = () => {
  if (loading.value || balancesLoading.value) return '처리 중...'
  if (balancesLoading.value) return '잔액 로딩 중...'
  if (isAmountExceedsBalance.value) return '잔액 부족'
  if (!inputAmount.value || parseFloat(inputAmount.value) <= 0) return '금액을 입력하세요'
  if (!simulationResult.value) return '환전 정보 확인 중'
  return '환전하기'
}

// ==================== 차트 관련 함수 ====================

// 차트 데이터 가져오기
const fetchChartData = async () => {
  if (fromCurrency.value === toCurrency.value) {
    chartRates.value = []
    return
  }

  chartLoading.value = true
  try {
    let targetCurrency = fromCurrency.value === 'KRW' ? toCurrency.value : fromCurrency.value
    const response = await fetch(`/api/exchange/by-currency/${targetCurrency}`)

    if (response.ok) {
      const data = await response.json()
      chartRates.value = data.map(rate => ({
        date: formatDate(rate.baseDate),
        [targetCurrency]: parseRateValue(rate.baseRate)
      })).filter(item => item[targetCurrency] !== null)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    } else {
      console.error('차트 데이터 조회 실패:', response.status)
      chartRates.value = []
    }
  } catch (error) {
    console.error('차트 데이터 조회 오류:', error)
    chartRates.value = []
  } finally {
    chartLoading.value = false
  }
}

const parseRateValue = (rate) => {
  if (rate === undefined || rate === null) return null
  const rateValue = typeof rate === 'string'
    ? parseFloat(rate.replace(/,/g, ''))
    : parseFloat(rate)
  return isNaN(rateValue) ? null : rateValue
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0')
  } catch (error) {
    console.error('날짜 변환 오류:', error, dateStr)
    return ''
  }
}

const getChartCurrencies = () => {
  if (fromCurrency.value === 'KRW') {
    return [toCurrency.value]
  } else if (toCurrency.value === 'KRW') {
    return [fromCurrency.value]
  }
  return []
}

const getToday = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const getCurrentTime = () => {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초`
}

// ==================== Watchers ====================

watch(fromCurrency, onCurrencyChange)
watch(toCurrency, onCurrencyChange)

// ==================== 컴포넌트 라이프사이클 ====================

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  console.log('환전 컴포넌트 마운트 시작')

  // 잔액과 차트 데이터를 병렬로 가져오기
  await Promise.all([
    fetchBalances(),
    fetchChartData()
  ])

  console.log('환전 컴포넌트 초기화 완료')
})
</script>

<style scoped>
/* 기존 스타일에 추가 */
.balance-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-bottom: 20px;
  background: #f0f8f7;
  border-radius: 8px;
  gap: 12px;
}

.loading-message {
  text-align: center;
  color: #009490;
  padding: 16px;
  background: #f0f8f7;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 0.9rem;
}

.error-message {
  text-align: center;
  color: #dc3545;
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 0.9rem;
}

.rate-update-time {
  margin-top: 12px;
  text-align: center;
  color: #666;
}

.rate-update-time small {
  font-size: 0.8rem;
}

.exchange-icon.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.exchange-icon.disabled:hover {
  border-color: #e9ecef;
  color: inherit;
}

/* 기존 스타일 유지 */
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

.max-btn:hover:not(:disabled) {
  background: #007c7a;
}

.max-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.currency-input-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.currency-dropdown:disabled {
  background: #f8f9fa;
  color: #666;
  cursor: not-allowed;
}

.currency-dropdown {
  flex: 2;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  transition: all 0.2s ease;
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

.amount-input:read-only,
.amount-input:disabled {
  background: #f8f9fa;
  color: #666;
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input[type=number] {
  -moz-appearance: textfield;
}

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

.exchange-icon:hover:not(.disabled) {
  border-color: #009490;
  color: #009490;
}

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

.fee-value.total-amount {
  color: #009490;
  font-size: 1.1rem;
  font-weight: 700;
}

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

.chart-section {
  flex: 4;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  /* position: relative; */
  z-index: 1;
  /* contain: layout style; 레이아웃 격리 */
  min-height: 300px;
  /* 최소 높이 보장 */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 16px; */
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

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.chart-loading .loading-spinner,
.balance-loading .loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #009490;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.chart-container {
  flex: 1;
}

.no-chart-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
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

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }

  .exchange-main {
    flex-direction: column;
    gap: 20px;
  }

  .exchange-form,
  .chart-section {
    flex: none;
  }
}
</style>
