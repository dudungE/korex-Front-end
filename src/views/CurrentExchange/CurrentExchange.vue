<template>
  <div class="forex-system">
    <HeaderBar />
    <div class="content-wrap">
      <aside class="sidebar">
        <h2>외환</h2>
        <ul class="menu">
          <li @click="$router.push('/forex')">환율/외화예금 금리</li>
          <li class="active">환전지갑</li>
          <li>외화송금</li>
          <li>외화계좌이체</li>
          <li>외환매매 예약서비스</li>
          <li>외화예금</li>
          <li>송금클럽</li>
        </ul>
        <div class="customer-center">
          <h3>고객센터</h3>
          <p>1588-1111<br/>1599-1111</p>
        </div>
      </aside>
      
      <main class="main-content">
        <h1>환전하기</h1>
        
        <div class="exchange-main">
          <div class="exchange-form">
            <p class="form-subtitle">환전할 통화 선택 및 금액을 입력하세요</p>
            
            <div class="tab-buttons">
              <button class="tab-btn active">원화</button>
              <button class="tab-btn">외화</button>
            </div>
            
            <div class="form-content">
              <div class="currency-select">
                <select v-model="selectedCurrency" class="currency-dropdown">
                  <option value="USD">🇺🇸 미국 USD</option>
                  <option value="EUR">🇪🇺 유럽연합 EUR</option>
                  <option value="JPY">🇯🇵 일본 JPY</option>
                  <option value="CNY">🇨🇳 중국 CNY</option>
                </select>
              </div>
              
              <div class="amount-input-section">
                <input 
                  type="number" 
                  v-model="inputAmount" 
                  class="amount-input" 
                  placeholder="1000"
                />
                <button @click="calculate" class="calculate-btn">계산</button>
              </div>
              
              <div class="rate-info">
                <span class="rate-label">우대율 90%</span>
                <a href="#" class="exchange-complete">환전완료</a>
              </div>
            </div>
            
            <div class="result-section" v-if="showResult">
              <div class="result-row">
                <span class="result-label">결제금액(원)</span>
                <span class="result-value highlight">{{ formatNumber(calculatedAmount) }} 원</span>
              </div>
              
              <div class="result-details">
                <div class="detail-item">
                  <span class="detail-label">적용환율</span>
                  <span class="detail-value">{{ formatNumber(exchangeRate) }}원</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">우대율</span>
                  <span class="detail-value">90%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chart-section">
            <div class="chart-header">
              <h3>환율 차트</h3>
              <span class="chart-period">{{ formatNumber(exchangeRate) }}원</span>
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
  </div>
</template>

<script>
export default {
  name: 'CurrentExchange',
  data() {
    return {
      selectedCurrency: 'USD',
      inputAmount: '',
      exchangeRate: 1393.33,
      calculatedAmount: 0,
      showResult: false,
      rates: {
        USD: 1393.33,
        EUR: 1617.94,
        JPY: 937.77,
        CNY: 193.76
      }
    }
  },
  methods: {
    calculate() {
      if (this.inputAmount) {
        const rate = this.rates[this.selectedCurrency] || this.exchangeRate;
        this.calculatedAmount = this.inputAmount * rate * 0.9; // 우대율 90% 적용
        this.exchangeRate = rate;
        this.showResult = true;
      }
    },
    formatNumber(num) {
      return new Intl.NumberFormat('ko-KR').format(num);
    },
    getToday() {
      const d = new Date();
      return d.toISOString().slice(0, 10);
    },
    getCurrentTime() {
      const d = new Date();
      return d.getFullYear() + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일 ' + d.getHours() + '시' + d.getMinutes() + '분' + d.getSeconds() + '초';
    }
  }
}
</script>

<style scoped>
/* 기존 레이아웃 스타일 유지 */
.forex-system {
  font-family: 'Noto Sans KR', Arial, sans-serif;
  background: #fafbfc;
  min-height: 100vh;
  width: 100vw;
  min-width: 0;
}

.content-wrap {
  display: flex;
  width: 100%;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  padding: 32px 16px 16px 32px;
}

.sidebar h2 {
  color: #009490;
  font-size: 1.5rem;
  margin-bottom: 24px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.menu li {
  padding: 10px 0 10px 8px;
  cursor: pointer;
  color: #333;
  border-left: 3px solid transparent;
  transition: 0.2s;
}

.menu li.active, .menu li:hover {
  color: #009490;
  border-left: 3px solid #009490;
  background: #f2f8f7;
}

.customer-center {
  margin-top: 40px;
  background: #f2f8f7;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.customer-center h3 {
  margin: 0 0 8px 0;
  color: #009490;
  font-size: 1.1rem;
}

.customer-center p {
  margin: 0;
  font-size: 1.2rem;
  color: #222;
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

/* 환전하기 폼 스타일 */
.exchange-main {
  display: flex;
  gap: 40px;
}

.exchange-form {
  flex: 1;
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

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  background: #f2f8f7;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  color: #009490;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.tab-btn.active, .tab-btn:hover {
  background: #009490;
  color: #fff;
}

.form-content {
  margin-bottom: 32px;
}

.currency-select {
  margin-bottom: 20px;
}

.currency-dropdown {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
}

.amount-input-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.amount-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: right;
}

.calculate-btn {
  background: #009490;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.calculate-btn:hover {
  background: #007c7a;
}

.rate-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rate-label {
  color: #666;
  font-size: 0.9rem;
}

.exchange-complete {
  color: #009490;
  text-decoration: none;
  font-weight: 500;
}

.exchange-complete:hover {
  text-decoration: underline;
}

.result-section {
  border-top: 2px solid #009490;
  padding-top: 24px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-label {
  color: #333;
  font-weight: 500;
}

.result-value.highlight {
  color: #009490;
  font-size: 1.5rem;
  font-weight: bold;
}

.result-details {
  display: flex;
  gap: 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.chart-section {
  width: 300px;
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

.chart-line::before {
  content: '';
  position: absolute;
  right: 0;
  top: -20px;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(0, 148, 144, 0.3) 0%, transparent 70%);
  border-radius: 50%;
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
