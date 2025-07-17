<template>
  <div class="forex-trading-app">
    <!-- 헤더 -->
    <header class="header">
      <div class="container">
        <h1 class="logo">ForexTrade</h1>
        <nav class="nav">
          <button class="nav-btn active">거래</button>
          <button class="nav-btn">차트</button>
          <button class="nav-btn">포트폴리오</button>
        </nav>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <div class="container">
        <!-- 환율 정보 카드 -->
        <div class="exchange-rates">
          <h2>주요 환율</h2>
          <div class="rate-cards">
            <div 
              v-for="pair in currencyPairs" 
              :key="pair.symbol"
              class="rate-card"
              :class="{ 'up': pair.change > 0, 'down': pair.change < 0 }"
            >
              <div class="pair-name">{{ pair.symbol }}</div>
              <div class="rate">{{ pair.rate.toFixed(4) }}</div>
              <div class="change">
                {{ pair.change > 0 ? '+' : '' }}{{ pair.change.toFixed(4) }}
                ({{ (pair.changePercent * 100).toFixed(2) }}%)
              </div>
            </div>
          </div>
        </div>

        <!-- 거래 섹션 -->
        <div class="trading-section">
          <div class="trade-form">
            <h3>거래 주문</h3>
            
            <div class="form-group">
              <label>통화쌍</label>
              <select v-model="selectedPair" class="form-control">
                <option v-for="pair in currencyPairs" :key="pair.symbol" :value="pair.symbol">
                  {{ pair.symbol }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>거래 유형</label>
              <div class="trade-type-buttons">
                <button 
                  @click="tradeType = 'buy'"
                  :class="{ active: tradeType === 'buy' }"
                  class="btn btn-buy"
                >
                  매수
                </button>
                <button 
                  @click="tradeType = 'sell'"
                  :class="{ active: tradeType === 'sell' }"
                  class="btn btn-sell"
                >
                  매도
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>거래량</label>
              <input 
                v-model.number="amount" 
                type="number" 
                class="form-control"
                placeholder="거래량 입력"
                min="0"
                step="0.01"
              >
            </div>

            <div class="form-group">
              <label>주문 가격</label>
              <input 
                v-model.number="price" 
                type="number" 
                class="form-control"
                placeholder="주문 가격"
                step="0.0001"
              >
            </div>

            <button @click="submitOrder" class="btn btn-primary btn-submit">
              주문 실행
            </button>
          </div>

          <!-- 주문 내역 -->
          <div class="order-history">
            <h3>최근 주문</h3>
            <div class="order-list">
              <div 
                v-for="order in orders" 
                :key="order.id"
                class="order-item"
              >
                <div class="order-info">
                  <span class="order-pair">{{ order.pair }}</span>
                  <span class="order-type" :class="order.type">{{ order.type === 'buy' ? '매수' : '매도' }}</span>
                </div>
                <div class="order-details">
                  <span>{{ order.amount }} @ {{ order.price.toFixed(4) }}</span>
                  <span class="order-time">{{ formatTime(order.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'ForexTradingApp',
  setup() {
    // 반응형 데이터
    const currencyPairs = ref([
      { symbol: 'EUR/USD', rate: 1.0850, change: 0.0025, changePercent: 0.0023 },
      { symbol: 'GBP/USD', rate: 1.2750, change: -0.0015, changePercent: -0.0012 },
      { symbol: 'USD/JPY', rate: 149.25, change: 0.85, changePercent: 0.0057 },
      { symbol: 'USD/KRW', rate: 1285.50, change: -2.30, changePercent: -0.0018 }
    ])

    const selectedPair = ref('EUR/USD')
    const tradeType = ref('buy')
    const amount = ref(1.0)
    const price = ref(1.0850)
    const orders = ref([])

    // 주문 실행
    const submitOrder = () => {
      if (!amount.value || !price.value) {
        alert('거래량과 가격을 입력해주세요.')
        return
      }

      const newOrder = {
        id: Date.now(),
        pair: selectedPair.value,
        type: tradeType.value,
        amount: amount.value,
        price: price.value,
        timestamp: new Date()
      }

      orders.value.unshift(newOrder)
      
      // 주문 후 폼 초기화
      amount.value = 1.0
      
      alert(`주문이 실행되었습니다!\n${selectedPair.value} ${tradeType.value === 'buy' ? '매수' : '매도'} ${amount.value} @ ${price.value}`)
    }

    // 시간 포맷팅
    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    // 환율 업데이트 시뮬레이션
    const updateRates = () => {
      currencyPairs.value.forEach(pair => {
        const change = (Math.random() - 0.5) * 0.01
        pair.rate += change
        pair.change = change
        pair.changePercent = change / pair.rate
      })
    }

    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      // 5초마다 환율 업데이트
      setInterval(updateRates, 5000)
    })

    return {
      currencyPairs,
      selectedPair,
      tradeType,
      amount,
      price,
      orders,
      submitOrder,
      formatTime
    }
  }
}
</script>

<style scoped>
.forex-trading-app {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Arial', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 헤더 */
.header {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-btn:hover,
.nav-btn.active {
  background-color: #34495e;
}

/* 메인 콘텐츠 */
.main-content {
  padding: 2rem 0;
}

/* 환율 정보 */
.exchange-rates {
  margin-bottom: 2rem;
}

.exchange-rates h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.rate-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.rate-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.rate-card:hover {
  transform: translateY(-2px);
}

.rate-card.up {
  border-left: 4px solid #27ae60;
}

.rate-card.down {
  border-left: 4px solid #e74c3c;
}

.pair-name {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.rate {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.change {
  font-size: 0.8rem;
}

.up .change {
  color: #27ae60;
}

.down .change {
  color: #e74c3c;
}

/* 거래 섹션 */
.trading-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.trade-form,
.order-history {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.trade-form h3,
.order-history h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.trade-type-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-buy {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-buy.active {
  background: #27ae60;
  color: white;
}

.btn-sell {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-sell.active {
  background: #e74c3c;
  color: white;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-submit {
  width: 100%;
  margin-top: 1rem;
}

/* 주문 내역 */
.order-list {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.order-item:last-child {
  border-bottom: none;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-pair {
  font-weight: 500;
  color: #2c3e50;
}

.order-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.order-type.buy {
  background: #d5f4e6;
  color: #27ae60;
}

.order-type.sell {
  background: #fdf2f2;
  color: #e74c3c;
}

.order-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.order-time {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* 반응형 */
@media (max-width: 768px) {
  .trading-section {
    grid-template-columns: 1fr;
  }
  
  .rate-cards {
    grid-template-columns: 1fr;
  }
  
  .trade-type-buttons {
    flex-direction: column;
  }
}
</style>