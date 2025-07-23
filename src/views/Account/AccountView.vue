<template>
<!-- 메인 콘텐츠 -->
      <div class="main-content">
        <h2 class="page-title">계좌 조회</h2>
        
        <div class="dashboard-grid">
          <!-- 주거래통장 카드 -->
          <div class="main-account-card">
            <div class="account-header">
              <div class="account-date">{{ currentDate }}</div>
              <div class="bank-logo">🏦</div>
            </div>
            <div class="account-number">{{ mainAccount.accountNumber }}</div>
            <div class="account-info">
              <div class="account-holder">{{ mainAccount.holderName }}</div>
              <div class="account-bank">{{ mainAccount.bankName }}</div>
            </div>
          </div>

          <!-- 총 보유 금액 -->
          <div class="total-balance-card">
            <div class="balance-header">
              <span class="balance-title">총 보유 금액</span>
              <select class="period-selector" v-model="selectedPeriod">
                <option value="monthly">월별</option>
                <option value="weekly">주별</option>
                <option value="daily">일별</option>
              </select>
            </div>
            <div class="total-amount">{{ formatAmount(totalBalance) }}</div>
            <div class="balance-chart">
              <div class="chart-line">
                <svg width="100%" height="80" viewBox="0 0 300 80">
                  <polyline
                    :points="chartPoints"
                    fill="none"
                    stroke="#20c997"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <circle
                    v-for="(point, index) in chartData"
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="#20c997"
                  />
                </svg>
              </div>
              <div class="chart-labels">
                <span>5월</span>
                <span>6월</span>
                <span>7월</span>
                <span>8월</span>
                <span>9월</span>
                <span>10월</span>
              </div>
            </div>
          </div>

          <!-- 통화별 지갑 (수입 섹션 자리에 배치) -->
          <div class="currency-wallets-section">
            <div class="section-header">
              <h3>통화별 지갑</h3>
              <button class="more-btn">더보기</button>
            </div>
            <div class="wallet-grid">
              <div 
                v-for="wallet in currencyWallets" 
                :key="wallet.currency"
                class="wallet-card"
              >
                <div class="wallet-header">
                  <div class="currency-flag">{{ wallet.flag }}</div>
                  <div class="currency-name">{{ wallet.name }}</div>
                </div>
                <div class="wallet-balance">
                  {{ formatCurrencyAmount(wallet.balance, wallet.currency) }}
                </div>
                <div class="wallet-krw">
                  ≈ {{ formatAmount(convertToKRW(wallet.balance, wallet.rate)) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 거래 내역 -->
          <div class="transaction-history">
            <div class="section-header">
              <h3>최근 거래 내역</h3>
              <select class="sort-selector" v-model="sortBy">
                <option value="date">날짜순</option>
                <option value="amount">금액순</option>
              </select>
            </div>
            <div class="transaction-list">
              <div 
                v-for="transaction in sortedTransactions" 
                :key="transaction.id"
                class="transaction-item"
              >
                <div class="transaction-icon" :class="transaction.type">
                  {{ getTransactionIcon(transaction.category) }}
                </div>
                <div class="transaction-info">
                  <div class="transaction-desc">{{ transaction.description }}</div>
                  <div class="transaction-date">{{ transaction.date }}</div>
                </div>
                <div class="transaction-amount" :class="transaction.type">
                  {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatAmount(transaction.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'AccountDashboard',
  setup() {
    const currentDate = '연동 계좌'
    
    const selectedPeriod = ref('monthly')
    const sortBy = ref('date')

    // 주거래통장 정보
    const mainAccount = ref({
      accountNumber: '100-111-123456',
      holderName: '김씨',
      bankName: '국민은행'
    })

    // 총 보유 금액
    const totalBalance = ref(25847500)

    // 차트 데이터
    const chartData = ref([
      { x: 0, y: 60 },
      { x: 60, y: 45 },
      { x: 120, y: 35 },
      { x: 180, y: 50 },
      { x: 240, y: 25 },
      { x: 300, y: 40 }
    ])

    const chartPoints = computed(() => {
      return chartData.value.map(point => `${point.x},${point.y}`).join(' ')
    })

    // 거래 내역
    const transactions = ref([
      {
        id: 1,
        type: 'expense',
        category: 'salary',
        description: 'KRW -> JPY 환전',
        date: '07월 22일 2024',
        amount: 89000
      },
      {
        id: 2,
        type: 'income',
        category: 'salary',
        description: '원화 충전',
        date: '07월 20일 2024',
        amount: 3200000
      },
      {
        id: 3,
        type: 'expense',
        category: 'salary',
        description: 'USD -> KRW',
        date: '07월 19일 2024',
        amount: 50000
      },
      {
        id: 4,
        type: 'expense',
        category: 'salary',
        description: 'KRW -> KRW 송금',
        date: '07월 19일 2024',
        amount: 100000
      }
    ])

    // 통화별 지갑
    const currencyWallets = ref([
      {
        currency: 'KRW',
        name: '원화',
        flag: '🇰🇷',
        balance: 12547000,
        rate: 1
      },
      {
        currency: 'JPY',
        name: '엔화',
        flag: '🇯🇵',
        balance: 850000,
        rate: 8.95
      },
      {
        currency: 'USD',
        name: '달러',
        flag: '🇺🇸',
        balance: 8420.50,
        rate: 1293.33
      },
      {
        currency: 'EUR',
        name: '유로',
        flag: '🇪🇺',
        balance: 3250.80,
        rate: 1410.25
      }
    ])

    // 정렬된 거래 내역
    const sortedTransactions = computed(() => {
      const sorted = [...transactions.value]
      if (sortBy.value === 'date') {
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
      } else {
        return sorted.sort((a, b) => b.amount - a.amount)
      }
    })

    // 헬퍼 함수들
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('ko-KR').format(amount) + '원'
    }

    const formatCurrencyAmount = (amount, currency) => {
      return new Intl.NumberFormat('ko-KR').format(amount) + ' ' + currency
    }

    const convertToKRW = (amount, rate) => {
      return Math.floor(amount * rate)
    }

    const getTransactionIcon = (category) => {
      const icons = {
        shopping: '🛍️',
        salary: '💰',
        food: '🍽️',
        transport: '🚇',
        investment: '📈'
      }
      return icons[category] || '💳'
    }

    return {
      currentDate,
      selectedPeriod,
      sortBy,
      mainAccount,
      totalBalance,
      chartData,
      chartPoints,
      transactions,
      currencyWallets,
      sortedTransactions,
      formatAmount,
      formatCurrencyAmount,
      convertToKRW,
      getTransactionIcon
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 0 2rem;
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

.user-info {
  display: flex;
  gap: 1rem;
}

.user-info span {
  color: #6c757d;
  cursor: pointer;
  font-size: 0.9rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 4rem;
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
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* 주거래통장 카드 */
.main-account-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.account-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.bank-logo {
  font-size: 2rem;
}

.account-number {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-holder {
  font-weight: 600;
}

.account-bank {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 총 보유 금액 카드 */
.total-balance-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.balance-title {
  font-weight: 600;
  color: #6c757d;
}

.period-selector {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}

.total-amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #20c997;
  margin-bottom: 1.5rem;
}

.balance-chart {
  width: 100%;
}

.chart-line svg {
  width: 100%;
  height: 80px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

/* 통화별 지갑 섹션 (수입 섹션 자리) */
.currency-wallets-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.more-btn, .sort-selector {
  background: none;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  color: #20c997;
  cursor: pointer;
}

.wallet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.wallet-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: transform 0.2s;
}

.wallet-card:hover {
  transform: translateY(-1px);
}

.wallet-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.currency-flag {
  font-size: 1.8rem;
}

.currency-name {
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.wallet-balance {
  flex: 1;
  font-size: 1.1rem;
  font-weight: bold;
  color: #20c997;
}

.wallet-krw {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

/* 거래 내역 */
.transaction-history {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
}

.transaction-icon {
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: white;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.transaction-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.transaction-amount {
  font-weight: 600;
}

.transaction-amount.expense {
  color: #dc3545;
}

.transaction-amount.income {
  color: #20c997;
}

/* 반응형 */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .wallet-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 2rem;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .wallet-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1600px) {
  .container {
    max-width: 1000px;
    padding: 3rem 6rem;
  }
}
</style>