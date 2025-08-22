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
                type="text" 
                v-model="displayAmount" 
                class="amount-input" 
                placeholder="0" 
                @input="onAmountInput" 
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
              <select 
                v-model="toCurrency" 
                class="currency-dropdown" 
                @change="calculateExchange"
                :disabled="fromCurrency !== 'KRW'"
              >
                <!-- FROM이 KRW인 경우: 모든 통화 선택 가능 -->
                <template v-if="fromCurrency === 'KRW'">
                  <option value="USD">🇺🇸 미국 USD</option>
                  <option value="JPY">🇯🇵 일본 JPY</option>
                  <option value="EUR">🇪🇺 유럽연합 EUR</option>
                </template>

                <!-- FROM이 KRW가 아닌 경우: KRW만 선택 가능 -->
                <template v-else>
                  <option value="KRW">🇰🇷 한국 KRW</option>
                </template>
              </select>

              <input 
                type="text" 
                :value="formatNumber(convertedAmount)" 
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
                <span class="fee-label">수수료 (0.5%)</span>
                <span class="fee-value">{{ formatNumber(calculateFee()) }} {{ fromCurrency }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">우대율</span>
                <span class="fee-value highlight">90%</span>
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
            @click="executeExchange"
          >
            {{ isAmountExceedsBalance ? '잔액 부족' : '환전하기' }}
          </button>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h3>환율 차트</h3>
            <span class="chart-period" v-if="!chartLoading && chartRates.length > 0">
              {{ formatNumber(currentExchangeRate) }}
            </span>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="chartLoading" class="chart-loading">
            <div class="loading-spinner"></div>
            <p>차트 로딩 중...</p>
          </div>

          <!-- 실제 차트 컴포넌트 -->
          <div v-else-if="chartRates.length > 0" class="chart-container">
            <ExchangeRateChart 
              :rates="chartRates" 
              :currencies="getChartCurrencies()"
              :height="200"
            />
          </div>

          <!-- 차트 데이터가 없을 때 -->
          <div v-else class="no-chart-data">
            <p>해당 통화의 환율 차트 데이터가 없습니다.</p>
          </div>

          <!-- 날짜 정보 -->
          <div class="chart-dates" v-if="chartRates.length > 0">
            <span>{{ chartRates[0]?.date }}</span>
            <span>{{ chartRates[Math.floor(chartRates.length/2)]?.date }}</span>
            <span>{{ chartRates[chartRates.length-1]?.date }}</span>
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

// 반응형 상태
const fromCurrency = ref('KRW')
const toCurrency = ref('USD')
const inputAmount = ref('')
const displayAmount = ref('')
const convertedAmount = ref(0)
const currentExchangeRate = ref(0)
const finalAmount = ref(0)

// 차트 관련 상태
const chartRates = ref([])
const chartLoading = ref(false)

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

// Computed
const isAmountExceedsBalance = computed(() => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    return false
  }
  return parseFloat(inputAmount.value) > balances[fromCurrency.value]
})

// Watchers
watch(fromCurrency, (newValue) => {
  // FROM이 KRW가 아니면 TO를 KRW로 자동 설정
  if (newValue !== 'KRW') {
    toCurrency.value = 'KRW'
  }
  calculateExchange()
  fetchChartData()
})

watch(toCurrency, () => {
  calculateExchange()
  fetchChartData()
})

// Methods
const onAmountInput = (event) => {
  let rawValue = event.target.value

  // 콤마 제거하여 순수 숫자만 추출
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

  // 실제 계산용 값 저장
  inputAmount.value = numericValue

  // 포맷팅하여 화면에 표시
  if (numericValue) {
    displayAmount.value = formatWithCommas(numericValue)
  } else {
    displayAmount.value = ''
  }

  calculateExchange()
}

const formatWithCommas = (value) => {
  if (!value) return ''

  const parts = value.toString().split('.')
  // 정수 부분에 콤마 추가
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 소수점 이하는 최대 2자리까지만
  if (parts[1]) {
    parts[1] = parts[1].substring(0, 2)
  }

  return parts.join('.')
}

const calculateExchange = () => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    convertedAmount.value = 0
    finalAmount.value = 0
    currentExchangeRate.value = 0
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
    }
  }

  currentExchangeRate.value = rate
  convertedAmount.value = convertedValue

  // 수수료와 우대율 적용
  const fee = calculateFee()
  const afterFee = convertedValue - (fee * rate)
  finalAmount.value = afterFee * 0.9 // 90% 우대율 적용
}

const calculateFee = () => {
  return parseFloat(inputAmount.value) * 0.005 // 0.5% 수수료
}

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  
  // 금액 초기화
  inputAmount.value = ''
  displayAmount.value = ''
  calculateExchange()
}

const getBalanceAmount = (currency) => {
  return formatNumber(balances[currency])
}

const setMaxAmount = () => {
  const maxValue = balances[fromCurrency.value].toString()
  inputAmount.value = maxValue
  displayAmount.value = formatWithCommas(maxValue)
  calculateExchange()
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

// 차트 데이터 가져오기
const fetchChartData = async () => {
  // KRW ↔ KRW는 차트가 의미없으므로 제외
  if (fromCurrency.value === toCurrency.value) {
    chartRates.value = []
    return
  }

  chartLoading.value = true
  try {
    // 환전과 관련된 통화들의 데이터 가져오기
    let targetCurrency

    if (fromCurrency.value === 'KRW') {
      targetCurrency = toCurrency.value
    } else if (toCurrency.value === 'KRW') {
      targetCurrency = fromCurrency.value
    } else {
      // 둘 다 외화인 경우는 현재 로직상 불가능하지만 대비
      targetCurrency = toCurrency.value
    }

    const response = await fetch(`/api/exchange/by-currency/${targetCurrency}`)
    
    if (response.ok) {
      const data = await response.json()
      
      // 차트 컴포넌트에 맞는 데이터 형태로 변환
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

// 환율 값 파싱
const parseRateValue = (rate) => {
  if (rate === undefined || rate === null) return null
  const rateValue = typeof rate === 'string' 
    ? parseFloat(rate.replace(/,/g, ''))
    : parseFloat(rate)
  return isNaN(rateValue) ? null : rateValue
}

// 날짜 포맷팅
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

// 차트에 표시할 통화 목록  
const getChartCurrencies = () => {
  if (fromCurrency.value === 'KRW') {
    return [toCurrency.value]
  } else if (toCurrency.value === 'KRW') {
    return [fromCurrency.value]
  }
  return []
}

// 환전 실행
const executeExchange = () => {
  if (!inputAmount.value || inputAmount.value <= 0 || isAmountExceedsBalance.value) {
    return
  }
  
  // 여기에 실제 환전 API 호출 로직 추가
  console.log('환전 실행:', {
    from: fromCurrency.value,
    to: toCurrency.value,
    amount: inputAmount.value,
    rate: currentExchangeRate.value,
    finalAmount: finalAmount.value
  })
  
  // 환전 완료 후 잔액 업데이트 (예시)
  balances[fromCurrency.value] -= parseFloat(inputAmount.value)
  balances[toCurrency.value] += finalAmount.value
  
  // 입력 필드 초기화
  inputAmount.value = ''
  displayAmount.value = ''
  calculateExchange()
  
  alert('환전이 완료되었습니다!')
}

const getToday = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const getCurrentTime = () => {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초`
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  calculateExchange()
  fetchChartData()
})
</script>

<style scoped>
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

.currency-dropdown:disabled {
  background: #f8f9fa;
  color: #666;
  cursor: not-allowed;
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

/* 차트 로딩 스타일 */
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.chart-loading .loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #009490;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 차트 컨테이너 */
.chart-container {
  height: 200px;
  margin-bottom: 12px;
}

/* 데이터 없음 상태 */
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
  
  .exchange-form, .chart-section {
    flex: none;
  }
}
</style>
