<template>
  <div class="main-content">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>오류가 발생했습니다</h3>
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">다시 시도</button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <template v-else>
      <!-- 통화 정보 헤더 -->
      <div class="wallet-header-section">
        <button class="back-btn" @click="goBack">←</button>
        <div class="wallet-info">
          <div class="currency-display">
            <span class="currency-flag">{{ getCurrencyFlag(currency) }}</span>
            <h2 class="currency-title">{{ getCurrencyName(currency) }} 지갑</h2>
          </div>
          <div class="balance-display">
            <div class="current-balance">
              {{ formatCurrencyAmount(currentBalance, currency) }}
            </div>
            <div class="krw-balance" v-if="currency !== 'KRW'">
              ≈ {{ formatAmount(convertToKRW(currentBalance, exchangeRate)) }}
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
          <select v-model="selectedPeriod" class="filter-select" @change="applyFilters">
            <option value="all">전체 기간</option>
            <option value="month">최근 1개월</option>
            <option value="week">최근 1주일</option>
          </select>
          <select v-model="selectedType" class="filter-select" @change="applyFilters">
            <option value="all">모든 거래</option>
            <option value="income">입금</option>
            <option value="expense">출금</option>
          </select>
        </div>
        <select v-model="sortBy" class="sort-select" @change="applyFilters">
          <option value="date">날짜순</option>
          <option value="amount">금액순</option>
        </select>
      </div>

      <!-- 거래 내역 리스트 -->
      <div class="transactions-container">
        <h3>거래 내역</h3>
        
        <!-- 거래 내역이 없는 경우 -->
        <div v-if="transactions.length === 0" class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">거래 내역이 없습니다</div>
          <div class="empty-state-subtext">첫 거래를 시작해보세요!</div>
        </div>

        <!-- 거래 내역 목록 -->
        <div v-else class="transaction-list">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="transaction-item"
            @click="showTransactionDetail(transaction)"
          >
            <div class="transaction-icon" :class="getTransactionTypeClass(transaction)">
              {{ getTransactionIcon(transaction) }}
            </div>
            <div class="transaction-info">
              <div class="transaction-desc">{{ getTransactionDescription(transaction) }}</div>
              <div class="transaction-details">
                <span class="transaction-date">{{ formatDate(transaction.createdAt) }}</span>
                <span class="transaction-method">{{ getTransactionMethod(transaction) }}</span>
              </div>
            </div>
            <div class="transaction-amount" :class="getTransactionTypeClass(transaction)">
              {{ getTransactionAmountDisplay(transaction) }}
            </div>
          </div>
        </div>
      </div>
    </template>
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
          <span class="detail-value">{{ getTransactionTypeText(selectedTransaction) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">금액</span>
          <span class="detail-value" :class="getTransactionTypeClass(selectedTransaction)">
            {{ getTransactionAmountDisplay(selectedTransaction) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">거래일시</span>
          <span class="detail-value">{{ formatDateTime(selectedTransaction.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">거래 방법</span>
          <span class="detail-value">{{ getTransactionMethod(selectedTransaction) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">거래 ID</span>
          <span class="detail-value">{{ selectedTransaction.id }}</span>
        </div>
        <div class="detail-row" v-if="selectedTransaction.fromUserName">
          <span class="detail-label">송금인</span>
          <span class="detail-value">{{ selectedTransaction.fromUserName }}</span>
        </div>
        <div class="detail-row" v-if="selectedTransaction.toUserName">
          <span class="detail-label">수취인</span>
          <span class="detail-value">{{ selectedTransaction.toUserName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'WalletDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 기본 설정
    const currentUserId = ref(1) // 실제로는 로그인 상태에서 가져와야 함
    
    // 반응형 데이터
    const loading = ref(true)
    const error = ref(null)
    const currency = ref(route.params.currency || 'USD')
    const currentBalance = ref(0)
    const exchangeRate = ref(1)
    const monthlyStats = ref({
      income: 0,
      expense: 0,
      count: 0
    })
    const transactions = ref([])
    
    // 필터 및 정렬
    const selectedPeriod = ref('all')
    const selectedType = ref('all')
    const sortBy = ref('date')
    const selectedTransaction = ref(null)

    // 통화 정보 매핑
    const currencyInfo = {
      'KRW': { name: '원화', flag: '🇰🇷' },
      'USD': { name: '달러', flag: '🇺🇸' },
      'EUR': { name: '유로', flag: '🇪🇺' },
      'JPY': { name: '엔화', flag: '🇯🇵' }
    }

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(async () => {
      await loadData()
    })

    // 필터 변경 감지
    watch([selectedPeriod, selectedType, sortBy], () => {
      applyFilters()
    })

    // 데이터 로드
    const loadData = async () => {
      try {
        loading.value = true
        error.value = null

        // 잔액 조회
        await loadBalance()
        
        // 거래 내역 조회
        await loadTransactions()
        
        // 월간 통계 조회
        await loadMonthlyStats()

      } catch (err) {
        console.error('데이터 로드 실패:', err)
        error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    // 잔액 조회
    const loadBalance = async () => {
      const response = await fetch(`http://localhost:8080/api/balance/${currentUserId.value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // 배열 형태 응답인 경우
        const currencyBalance = data.find(b => b.currencyCode === currency.value)
        if (currencyBalance) {
          currentBalance.value = currencyBalance.availableAmount || 0
          exchangeRate.value = currencyBalance.exchangeRate || 1
        }
      } else {
        throw new Error(data.message || '잔액 조회 실패')
      }
    }

    // 거래 내역 조회
    const loadTransactions = async () => {
      const params = new URLSearchParams({
        currencyCode: currency.value,
        period: selectedPeriod.value,
        type: selectedType.value,
        sortBy: sortBy.value
      })

      const response = await fetch(
        `http://localhost:8080/api/transaction/history/${currentUserId.value}?${params}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        transactions.value = data.transactions || []
      } else {
        throw new Error(data.message || '거래 내역 조회 실패')
      }
    }

    // 월간 통계 조회
    const loadMonthlyStats = async () => {
      const response = await fetch(
        `http://localhost:8080/api/transaction/monthly-stats/${currentUserId.value}?currencyCode=${currency.value}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        monthlyStats.value = data.stats || { income: 0, expense: 0, count: 0 }
      } else {
        throw new Error(data.message || '월간 통계 조회 실패')
      }
    }

    // 필터 적용
    const applyFilters = async () => {
      try {
        await loadTransactions()
      } catch (err) {
        console.error('필터 적용 실패:', err)
      }
    }

    // 뒤로가기
    const goBack = () => {
      router.push('/account')
    }

    // 거래 상세 보기
    const showTransactionDetail = (transaction) => {
      selectedTransaction.value = transaction
    }

    // 모달 닫기
    const closeModal = () => {
      selectedTransaction.value = null
    }

    // 헬퍼 함수들
    const getCurrencyName = (code) => {
      return currencyInfo[code]?.name || code
    }

    const getCurrencyFlag = (code) => {
      return currencyInfo[code]?.flag || '💱'
    }

    const formatAmount = (amount) => {
      if (!amount && amount !== 0) return '0원'
      return new Intl.NumberFormat('ko-KR').format(amount) + '원'
    }

    const formatCurrencyAmount = (amount, currencyCode) => {
      if (!amount && amount !== 0) return `0 ${currencyCode}`
      return new Intl.NumberFormat('ko-KR').format(amount) + ' ' + currencyCode
    }

    const convertToKRW = (amount, rate) => {
      return Math.floor(amount * rate)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const getTransactionDescription = (transaction) => {
      if (transaction.transactionType === 'TRANSFER') {
        return transaction.fromUserId === currentUserId.value 
          ? `${transaction.toUserName}님에게 송금` 
          : `${transaction.fromUserName}님으로부터 수신`
      } else if (transaction.transactionType === 'EXCHANGE') {
        return '환전'
      }
      return '거래'
    }

    const getTransactionMethod = (transaction) => {
      switch (transaction.transactionType) {
        case 'TRANSFER':
          return '친구송금'
        case 'EXCHANGE':
          return '환전'
        default:
          return '기타'
      }
    }

    const getTransactionTypeClass = (transaction) => {
      return transaction.toUserId === currentUserId.value ? 'income' : 'expense'
    }

    const getTransactionTypeText = (transaction) => {
      return transaction.toUserId === currentUserId.value ? '입금' : '출금'
    }

    const getTransactionAmountDisplay = (transaction) => {
      const isIncome = transaction.toUserId === currentUserId.value
      const amount = isIncome ? transaction.receiveAmount : transaction.sendAmount
      const sign = isIncome ? '+' : '-'
      return `${sign}${formatCurrencyAmount(amount, currency.value)}`
    }

    const getTransactionIcon = (transaction) => {
      switch (transaction.transactionType) {
        case 'TRANSFER':
          return transaction.toUserId === currentUserId.value ? '📥' : '📤'
        case 'EXCHANGE':
          return '💱'
        default:
          return '💳'
      }
    }

    return {
      // 반응형 데이터
      loading,
      error,
      currency,
      currentBalance,
      exchangeRate,
      monthlyStats,
      transactions,
      selectedPeriod,
      selectedType,
      sortBy,
      selectedTransaction,
      currentUserId,
      
      // 메서드
      loadData,
      applyFilters,
      goBack,
      showTransactionDetail,
      closeModal,
      
      // 헬퍼 함수
      getCurrencyName,
      getCurrencyFlag,
      formatAmount,
      formatCurrencyAmount,
      convertToKRW,
      formatDate,
      formatDateTime,
      getTransactionDescription,
      getTransactionMethod,
      getTransactionTypeClass,
      getTransactionTypeText,
      getTransactionAmountDisplay,
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

.main-content {
  flex: 1;
  padding: 3rem 2rem;
  margin-left: 15rem;
  margin-right: 15rem;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  margin: 2rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #20c997;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 상태 */
.error-container {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  margin: 2rem 0;
  border: 1px solid #e9ecef;
}

.error-message {
  text-align: center;
  color: #dc3545;
}

.error-message h3 {
  margin-bottom: 1rem;
  color: #dc3545;
}

.error-message p {
  margin-bottom: 1.5rem;
  color: #6c757d;
}

.retry-btn {
  background: #20c997;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #17a085;
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

/* 비어있는 상태 */
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
  .main-content {
    margin-left: 2rem;
    margin-right: 2rem;
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
</style>
