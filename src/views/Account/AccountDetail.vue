<template>
<!-- 메인 콘텐츠 -->
      <div class="main-content">
        <!-- 통화 정보 헤더 -->
        <div class="wallet-header-section">
          <button class="back-btn" @click="goBack">←</button>
          <div class="wallet-info">
            <div class="currency-display">
              <span class="currency-flag">{{ walletInfo.flag }}</span>
              <h2 class="currency-title">{{ walletInfo.name }} 지갑</h2>
            </div>
            <div class="balance-display">
              <div class="current-balance">
                {{ formatCurrencyAmount(walletInfo.balance, currency) }}
              </div>
              <div class="krw-balance">
                ≈ {{ formatAmount(convertToKRW(walletInfo.balance, walletInfo.rate)) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 요약 통계 -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">이번 달 수입</div>
            <div class="summary-value income">
              +{{ formatCurrencyAmount(monthlyStats.income, currency) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">이번 달 지출</div>
            <div class="summary-value expense">
              -{{ formatCurrencyAmount(monthlyStats.expense, currency) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">거래 횟수</div>
            <div class="summary-value">{{ monthlyStats.count }}회</div>
          </div>
        </div>

        <!-- 필터 및 정렬 -->
        <div class="filter-section">
          <div class="filter-options">
            <select v-model="selectedPeriod" class="filter-select">
              <option value="all">전체 기간</option>
              <option value="month">최근 1개월</option>
              <option value="week">최근 1주일</option>
            </select>
            <select v-model="selectedType" class="filter-select">
              <option value="all">모든 거래</option>
              <option value="income">입금</option>
              <option value="expense">출금</option>
            </select>
          </div>
          <select v-model="sortBy" class="sort-select">
            <option value="date">날짜순</option>
            <option value="amount">금액순</option>
          </select>
        </div>

        <!-- 거래 내역 리스트 -->
        <div class="transactions-container">
          <h3>거래 내역</h3>
          <div class="transaction-list">
            <div 
              v-for="transaction in filteredTransactions" 
              :key="transaction.id"
              class="transaction-item"
              @click="showTransactionDetail(transaction)"
            >
              <div class="transaction-icon" :class="transaction.type">
                {{ getTransactionIcon(transaction.category) }}
              </div>
              <div class="transaction-info">
                <div class="transaction-desc">{{ transaction.description }}</div>
                <div class="transaction-details">
                  <span class="transaction-date">{{ transaction.date }}</span>
                  <span class="transaction-method">{{ transaction.method }}</span>
                </div>
              </div>
              <div class="transaction-amount" :class="transaction.type">
                {{ transaction.type === 'expense' ? '-' : '+' }}
                {{ formatCurrencyAmount(transaction.amount, currency) }}
              </div>
            </div>
          </div>

          <!-- 더보기 버튼 -->
          <button v-if="hasMoreTransactions" class="load-more-btn" @click="loadMoreTransactions">
            더 많은 거래 내역 보기
          </button>
        </div>
      </div>

    <!-- 거래 상세 모달 -->
    <div v-if="selectedTransaction" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>거래 상세</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">거래 종류</span>
            <span class="detail-value">{{ selectedTransaction.type === 'income' ? '입금' : '출금' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">금액</span>
            <span class="detail-value" :class="selectedTransaction.type">
              {{ selectedTransaction.type === 'expense' ? '-' : '+' }}
              {{ formatCurrencyAmount(selectedTransaction.amount, currency) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">거래일시</span>
            <span class="detail-value">{{ selectedTransaction.date }} {{ selectedTransaction.time }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">거래 방법</span>
            <span class="detail-value">{{ selectedTransaction.method }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">거래 ID</span>
            <span class="detail-value">{{ selectedTransaction.transactionId }}</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'WalletDetail',
  props: {
    currency: {
      type: String,
      required: false, // 바로 앞 단에서 ROUTER로 값을 들고 들어올 때 TRUE 여야지 요청이 되고 그 값을 들고 들어와서 데이터를 보여 줄 수 있음. 
      default : 'USD' // 지금 프론트 하드코딩으로만 하고 있기 때문에 default를 통해서 요청은 받지않고 고정값으로 들어오게 함. 
    }
  },
  setup(props) {
    const router = useRouter()
    
    const selectedPeriod = ref('all')
    const selectedType = ref('all')
    const sortBy = ref('date')
    const selectedTransaction = ref(null)
    const hasMoreTransactions = ref(true)

    // 통화별 지갑 정보
    const walletInfo = ref({})
    
    // 월간 통계
    const monthlyStats = ref({
      income: 0,
      expense: 0,
      count: 0
    })

    // 거래 내역 데이터
    const transactions = ref([])

    // 통화별 지갑 데이터 매핑
    const currencyData = {
      'KRW': {
        name: '원화',
        flag: '🇰🇷',
        balance: 12547000,
        rate: 1,
        transactions: [
          {
            id: 1,
            type: 'income',
            category: 'salary',
            description: '급여 입금',
            date: '2024-07-20',
            time: '09:00:00',
            amount: 3200000,
            method: '계좌이체',
            transactionId: 'KRW202407200001'
          },
          {
            id: 2,
            type: 'expense',
            category: 'shopping',
            description: '온라인 쇼핑',
            date: '2024-07-19',
            time: '14:30:00',
            amount: 89000,
            method: '카드결제',
            transactionId: 'KRW202407190002'
          }
        ]
      },
      'USD': {
        name: '달러',
        flag: '🇺🇸',
        balance: 8420.50,
        rate: 1293.33,
        transactions: [
          {
            id: 3,
            type: 'income',
            category: 'exchange',
            description: '환전 입금',
            date: '2024-07-18',
            time: '11:15:00',
            amount: 2000.00,
            method: '환전',
            transactionId: 'USD202407180001'
          },
          {
            id: 4,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2024-07-17',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          },
          {
            id: 7,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2024-04-14',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          },
          {
            id: 4,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2024-03-15',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          },
          {
            id: 4,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2025-02-15',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          },
          {
            id: 4,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2024-06-16',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          },
          {
            id: 4,
            type: 'expense',
            category: 'transfer',
            description: '해외송금',
            date: '2024-07-17',
            time: '16:45:00',
            amount: 500.00,
            method: 'SWIFT',
            transactionId: 'USD202407170002'
          }
        ]
      },
      'EUR': {
        name: '유로',
        flag: '🇪🇺',
        balance: 3250.80,
        rate: 1410.25,
        transactions: [
          {
            id: 5,
            type: 'income',
            category: 'exchange',
            description: '환전 입금',
            date: '2024-07-16',
            time: '10:30:00',
            amount: 1000.00,
            method: '환전',
            transactionId: 'EUR202407160001'
          }
        ]
      },
      'JPY': {
        name: '엔화',
        flag: '🇯🇵',
        balance: 850000,
        rate: 8.95,
        transactions: [
          {
            id: 6,
            type: 'expense',
            category: 'travel',
            description: '일본 여행 지출',
            date: '2024-07-15',
            time: '18:20:00',
            amount: 50000,
            method: '카드결제',
            transactionId: 'JPY202407150001'
          }
        ]
      }
    }

    // 필터링된 거래 내역
    const filteredTransactions = computed(() => {
      let filtered = [...transactions.value]
      
      // 기간 필터
      if (selectedPeriod.value !== 'all') {
        const now = new Date()
        const filterDate = new Date()
        
        if (selectedPeriod.value === 'week') {
          filterDate.setDate(now.getDate() - 7)
        } else if (selectedPeriod.value === 'month') {
          filterDate.setMonth(now.getMonth() - 1)
        }
        
        filtered = filtered.filter(t => new Date(t.date) >= filterDate)
      }
      
      // 타입 필터
      if (selectedType.value !== 'all') {
        filtered = filtered.filter(t => t.type === selectedType.value)
      }
      
      // 정렬
      if (sortBy.value === 'date') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      } else if (sortBy.value === 'amount') {
        filtered.sort((a, b) => b.amount - a.amount)
      }
      
      return filtered
    })

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      loadWalletData()
    })

    const loadWalletData = () => {
      const data = currencyData[props.currency]
      if (data) {
        walletInfo.value = data
        transactions.value = data.transactions
        calculateMonthlyStats()
      }
    }

    const calculateMonthlyStats = () => {
      const now = new Date()
      const thisMonth = transactions.value.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear()
      })
      
      monthlyStats.value = {
        income: thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        count: thisMonth.length
      }
    }

    const goBack = () => {
      router.push('/account')
    }

    const showTransactionDetail = (transaction) => {
      selectedTransaction.value = transaction
    }

    const closeModal = () => {
      selectedTransaction.value = null
    }

    const loadMoreTransactions = () => {
      // 추가 거래 내역 로드 로직
      hasMoreTransactions.value = false
    }

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
        salary: '💰',
        shopping: '🛍️',
        exchange: '💱',
        transfer: '📤',
        travel: '✈️',
        food: '🍽️'
      }
      return icons[category] || '💳'
    }

    return {
      selectedPeriod,
      selectedType,
      sortBy,
      selectedTransaction,
      hasMoreTransactions,
      walletInfo,
      monthlyStats,
      transactions,
      filteredTransactions,
      goBack,
      showTransactionDetail,
      closeModal,
      loadMoreTransactions,
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
  margin-left: 15rem;
  margin-right : 15rem;
}

/* 지갑 헤더 섹션 */
.wallet-header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
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

.wallet-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.currency-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.currency-flag {
  font-size: 3rem;
}

.currency-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.balance-display {
  text-align: right;
}

.current-balance {
  font-size: 2rem;
  font-weight: bold;
  color: #20c997;
}

.krw-balance {
  color: #6c757d;
  margin-top: 0.25rem;
}

/* 요약 카드 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  text-align: center;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-label {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.summary-value.income {
  color: #20c997;
}

.summary-value.expense {
  color: #dc3545;
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.filter-select, .sort-select {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus, .sort-select:focus {
  outline: none;
  border-color: #20c997;
}

/* 거래 내역 컨테이너 */
.transactions-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e9ecef;
}

.transactions-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.transaction-item:hover {
  background: #e9ecef;
  border-color: #20c997;
  transform: translateY(-1px);
}

.transaction-icon {
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.transaction-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.transaction-date {
  position: relative;
}

.transaction-date::after {
  content: '•';
  margin: 0 0.5rem;
  color: #dee2e6;
}

.transaction-method {
  color: #20c997;
  font-weight: 500;
}

.transaction-amount {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: right;
  min-width: 120px;
}

.transaction-amount.expense {
  color: #dc3545;
}

.transaction-amount.income {
  color: #20c997;
}

.load-more-btn {
  width: 100%;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #20c997;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;
  font-weight: 500;
}

.load-more-btn:hover {
  background: #e9ecef;
  border-color: #20c997;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  color: #333;
  text-align: right;
}

.detail-value.income {
  color: #20c997;
}

.detail-value.expense {
  color: #dc3545;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
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
  
  .wallet-header-section {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .wallet-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .currency-display {
    justify-content: center;
  }
  
  .balance-display {
    text-align: center;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-options {
    justify-content: space-between;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .transaction-amount {
    align-self: flex-end;
    text-align: right;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

@media (min-width: 1600px) {
  .container {
    max-width: 1000px;
    padding: 3rem 6rem;
  }
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #20c997;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #17a085;
}

/* 로딩 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.transaction-item {
  animation: fadeIn 0.3s ease-out;
}

/* 포커스 스타일 */
.transaction-item:focus {
  outline: 2px solid #20c997;
  outline-offset: 2px;
}

/* 비어있는 상태 스타일 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.empty-state-subtext {
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
