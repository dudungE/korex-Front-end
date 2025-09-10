<template>
  <div class="foreign-transfer-page">
    <!-- 전체 카드 박스: 제목 + 조회 + 테이블 -->
    <div class="transfer-card">

      <!-- 제목 + 조회 -->
      <div class="card-header">
        <h1 class="page-title">친구송금 거래 내역</h1>
        <div class="filter-period">
          <select v-model="selectedCurrency" @change="onCurrencyChange" class="currency-filter">
            <option value="KRW">🇰🇷 원화 (KRW)</option>
            <option value="USD">🇺🇸 달러 (USD)</option>
            <option value="EUR">🇪🇺 유로 (EUR)</option>
            <option value="JPY">🇯🇵 엔화 (JPY)</option>
            <option value="GBP">🇬🇧 파운드 (GBP)</option>
            <option value="AUD">🇦🇺 호주달러 (AUD)</option>
            <option value="CAD">🇨🇦 캐나다달러 (CAD)</option>
            <option value="CHF">🇨🇭 스위스프랑 (CHF)</option>
            <option value="CNY">🇨🇳 위안화 (CNY)</option>
          </select>

          <input type="date" v-model="startDate" />
          <span>~</span>
          <input type="date" v-model="endDate" />
          <button @click="fetchTransfers">조회</button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <p>데이터를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">다시 시도</button>
      </div>

      <!-- 테이블 -->
      <div v-else class="table-wrapper">
        <table class="transfer-table">
          <thead>
            <tr>
              <th>거래타입</th>
              <th>상대방</th>
              <th>통화</th>
              <th>금액</th>
              <th>거래일시</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction.id">
              <td :class="getTransactionTypeClass(transaction)">
                {{ getTransactionTypeText(transaction) }}
              </td>
              <td>{{ getCounterparty(transaction) }}</td>
              <td>{{ selectedCurrency }}</td>
              <td :class="getTransactionTypeClass(transaction)">
                {{ getTransactionAmountDisplay(transaction) }}
              </td>
              <td>{{ formatDateTime(transaction.createdAt) }}</td>
              <td>
                <button class="detail-btn" @click="viewDetail(transaction)">상세</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 데이터가 없는 경우 -->
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <p>해당 기간에 친구송금 거래내역이 없습니다.</p>
        </div>
      </div>

    </div>

    <!-- 상세 모달 -->
    <div v-if="selectedTransaction" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">✖</button>
        <h2>{{ getModalTitle(selectedTransaction) }}</h2>
        <div class="detail-list">
          <!-- 거래 종류 -->
          <div><strong>거래 종류:</strong> 친구송금</div>

          <!-- 송금인/수취인 정보 -->
          <div v-if="selectedTransaction.fromUserName">
            <strong>송금인:</strong> {{ selectedTransaction.fromUserName }}
          </div>
          <div v-if="selectedTransaction.toUserName">
            <strong>수취인:</strong> {{ selectedTransaction.toUserName }}
          </div>

          <!-- 통화 정보 -->
          <div><strong>통화:</strong> {{ selectedCurrency }}</div>

          <!-- 송금 금액 -->
          <div><strong>거래 금액:</strong> {{ getTransactionAmountDisplay(selectedTransaction) }}</div>

          <!-- 원화 환산 (외화인 경우) -->
          <div v-if="selectedCurrency !== 'KRW'">
            <strong>원화 환산:</strong> {{ getTransactionAmountKRW(selectedTransaction) }}
          </div>

          <!-- 거래 일시 -->
          <div><strong>거래 일시:</strong> {{ formatDateTime(selectedTransaction.createdAt) }}</div>

          <!-- 거래 ID -->
          <div><strong>거래 ID:</strong> {{ selectedTransaction.id }}</div>

          <!-- 연락처 정보 (있는 경우) -->
          <div v-if="getRecipientPhone(selectedTransaction)">
            <strong>연락처:</strong> {{ getRecipientPhone(selectedTransaction) }}
          </div>

          <!-- 메모/사유 (있는 경우) -->
          <div v-if="selectedTransaction.memo">
            <strong>거래 사유:</strong> {{ selectedTransaction.memo }}
          </div>
          <div v-else>
            <strong>거래 사유:</strong> -
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FriendTransferHistory',
  setup() {
    const router = useRouter()

    // 기본 설정
    const currentUserId = ref(localStorage.getItem('userId') || 1)

    // 반응형 데이터
    const loading = ref(true)
    const error = ref(null)
    const selectedCurrency = ref('KRW')
    const exchangeRate = ref(1)
    const allTransactions = ref([])
    const startDate = ref('')
    const endDate = ref('')
    const selectedTransaction = ref(null)

    // 통화 정보 매핑
    const currencyInfo = {
      'KRW': { name: '원화', flag: '🇰🇷' },
      'USD': { name: '달러', flag: '🇺🇸' },
      'EUR': { name: '유로', flag: '🇪🇺' },
      'JPY': { name: '엔화', flag: '🇯🇵' }
    }

    // 필터링된 거래 목록
    const filteredTransactions = computed(() => {
      let filtered = [...allTransactions.value]

      // 1. 친구송금만 필터링
      filtered = filtered.filter(transaction => {
        return transaction.transactionType === 'TRANSFER'
      })

      // 2. 선택된 통화와 관련된 거래만 필터링
      filtered = filtered.filter(transaction => {
        return transaction.fromCurrencyCode === selectedCurrency.value ||
          transaction.toCurrencyCode === selectedCurrency.value
      })

      // 3. 기간 필터링
      if (startDate.value && endDate.value) {
        const start = new Date(startDate.value)
        const end = new Date(endDate.value)
        end.setHours(23, 59, 59, 999) // 종료일의 마지막 시간까지 포함

        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt)
          return transactionDate >= start && transactionDate <= end
        })
      }

      // 4. 날짜순 정렬 (최신순)
      filtered.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      return filtered
    })

    // 데이터 로드
    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        await Promise.all([loadTransactions(), loadExchangeRate()])
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        error.value = '데이터를 불러오는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    // 거래내역 조회
    const loadTransactions = async () => {
      try {
        const response = await fetch(
          `http://ko-forex.shop/api/transaction/history/${currentUserId.value}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data) {
          if (data.success && Array.isArray(data.transactions)) {
            allTransactions.value = data.transactions
          } else if (Array.isArray(data.transactions)) {
            allTransactions.value = data.transactions
          } else if (Array.isArray(data)) {
            allTransactions.value = data
          } else {
            allTransactions.value = []
          }
        } else {
          allTransactions.value = []
        }
      } catch (error) {
        console.error('거래 내역 로드 실패:', error)
        allTransactions.value = []
      }
    }

    // 환율 조회
    const loadExchangeRate = async () => {
      if (selectedCurrency.value === 'KRW') {
        exchangeRate.value = 1
        return
      }

      try {
        const response = await fetch(`http://ko-forex.shop/api/exchange/realtime/${selectedCurrency.value}`)
        const rateData = await response.json()

        if (rateData && rateData.length > 0 && rateData[0].base_rate) {
          const baseRateStr = rateData[0].base_rate
          const cleanRate = baseRateStr.replace(/,/g, '')
          let rate = parseFloat(cleanRate)

          if (selectedCurrency.value === 'JPY') {
            rate = rate / 100
          }

          exchangeRate.value = rate
        } else {
          exchangeRate.value = selectedCurrency.value === 'JPY' ? 9.4 : 1300
        }
      } catch (error) {
        console.error('환율 조회 실패:', error)
        exchangeRate.value = selectedCurrency.value === 'JPY' ? 9.4 : 1300
      }
    }

    // 이벤트 핸들러
    const onCurrencyChange = async () => {
      await loadExchangeRate()
    }

    const fetchTransfers = () => {
      console.log('기간별 조회:', startDate.value, endDate.value, selectedCurrency.value)
      // 필터링은 computed에서 자동으로 처리됨
    }

    const viewDetail = (transaction) => {
      selectedTransaction.value = transaction
    }

    const closeModal = () => {
      selectedTransaction.value = null
    }

    // 헬퍼 함수들
    const getTransactionTypeClass = (transaction) => {
      const isIncome = transaction.toUserId === parseInt(currentUserId.value)
      return isIncome ? 'income' : 'expense'
    }

    const getTransactionTypeText = (transaction) => {
      const isIncome = transaction.toUserId === parseInt(currentUserId.value)
      return isIncome ? '수신' : '송금'
    }

    const getCounterparty = (transaction) => {
      const isIncome = transaction.toUserId === parseInt(currentUserId.value)
      return isIncome ? transaction.fromUserName : transaction.toUserName
    }

    const getTransactionAmount = (transaction) => {
      const isIncome = transaction.toUserId === parseInt(currentUserId.value)
      return isIncome ? transaction.receiveAmount : (transaction.sendAmount || transaction.totalDeductedAmount)
    }

    const getTransactionAmountDisplay = (transaction) => {
      const amount = getTransactionAmount(transaction)
      const isIncome = getTransactionTypeClass(transaction) === 'income'
      const sign = isIncome ? '+' : '-'
      return `${sign}${formatCurrencyAmount(amount, selectedCurrency.value)}`
    }

    const getTransactionAmountKRW = (transaction) => {
      const isIncome = getTransactionTypeClass(transaction) === 'income'
      const amount = getTransactionAmount(transaction)
      const krwAmount = convertToKRW(amount, exchangeRate.value)
      const sign = isIncome ? '+' : '-'
      return `${sign}${formatAmount(krwAmount)}`
    }

    const getModalTitle = (transaction) => {
      const isIncome = getTransactionTypeClass(transaction) === 'income'
      return isIncome ? '친구송금 수신 상세 정보' : '친구송금 상세 정보'
    }

    const getRecipientPhone = (transaction) => {
      return transaction.recipientPhone || transaction.phone || transaction.phoneNumber || null
    }

    const formatAmount = (amount) => {
      if (!amount && amount !== 0) return '0원'
      return new Intl.NumberFormat('ko-KR').format(Math.floor(amount)) + '원'
    }

    const formatCurrencyAmount = (amount, currencyCode) => {
      if (!amount && amount !== 0) return `0 ${currencyCode}`
      const cleanAmount = parseFloat(amount.toString().replace(/,/g, ''))

      if (currencyCode === 'KRW') {
        return new Intl.NumberFormat('ko-KR').format(Math.floor(cleanAmount)) + '원'
      }
      return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(cleanAmount) + ' ' + currencyCode
    }

    const convertToKRW = (amount, rate) => {
      const cleanAmount = parseFloat(amount.toString().replace(/,/g, ''))
      return Math.floor(cleanAmount * rate)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 컴포넌트 마운트
    onMounted(() => {
      loadData()

      // 기본 날짜 설정 (최근 1개월)
      const today = new Date()
      const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

      startDate.value = oneMonthAgo.toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
    })

    return {
      // 반응형 데이터
      loading,
      error,
      selectedCurrency,
      exchangeRate,
      allTransactions,
      filteredTransactions,
      startDate,
      endDate,
      selectedTransaction,

      // 메서드
      onCurrencyChange,
      fetchTransfers,
      viewDetail,
      closeModal,
      loadData,

      // 헬퍼 함수
      getTransactionTypeClass,
      getTransactionTypeText,
      getCounterparty,
      getTransactionAmountDisplay,
      getTransactionAmountKRW,
      getModalTitle,
      getRecipientPhone,
      formatDateTime
    }
  }
}
</script>

<style scoped>
/* 전체 카드 */
.transfer-card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 25px;
}

/* 카드 안 제목 + 조회 */
.card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header .page-title {
  margin: 0;
  color: #008681;
  font-size: 28px;
  font-weight: 700;
}

.foreign-transfer-page {
  max-width: 950px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #333;
  min-height: 80vh;
}

/* 조회 영역 */
.filter-period {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.currency-filter {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: white;
  cursor: pointer;
}

.filter-period input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.filter-period button {
  padding: 6px 14px;
  background-color: #009b99;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.2s;
}

.filter-period button:hover {
  background-color: #008681;
}

/* 로딩/에러 상태 */
.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.retry-btn {
  padding: 6px 14px;
  background-color: #009b99;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

/* 테이블 wrapper */
.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: none;
  padding: 0;
  background-color: transparent;
  box-shadow: none;
}

/* 테이블 스타일 */
.transfer-table {
  width: 100%;
  border-collapse: collapse;
  border: none;
  table-layout: auto;
  min-width: 700px;
  margin: 0 auto;
}

.transfer-table th {
  padding: 8px;
  background-color: #E6F5F4;
  color: #008681;
  font-weight: 600;
  text-align: center;
  white-space: normal;
  word-break: break-word;
}

.transfer-table td {
  padding: 8px;
  background-color: #F9FEFD;
  text-align: center;
  font-size: 14px;
  white-space: normal;
  word-break: break-word;
  vertical-align: middle;
}

/* 상세 버튼 */
.detail-btn {
  padding: 4px 10px;
  color: #3d9970;
  background: transparent;
  border: 1px solid #3d9970;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: 0.2s;
}

.detail-btn:hover {
  background-color: #009b99;
  color: white;
}

/* 거래타입별 색상 */
.income {
  color: #2e8b57;
  font-weight: 500;
}

.expense {
  color: #dc2626;
  font-weight: 500;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
}

/* ================ 해외송금과 동일한 모달 스타일 ================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  padding: 24px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-size: 15px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #111827;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

/* 강조 색상 통일 */
h2 {
  color: #00908C;
  font-size: 20px;
  margin-bottom: 16px;
}

strong {
  color: #111827;
}

/* 모바일 */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
    margin-bottom: 20px
  }

  .filter-period {
    flex-wrap: wrap;
    justify-content: center
  }

  .filter-period input {
    width: 130px;
  }

  .currency-filter {
    width: 150px;
  }

  .table-wrapper {
    padding: 10px 0;
  }

  .transfer-table {
    min-width: unset;
    font-size: 13px;
  }

  .detail-btn {
    padding: 3px 6px;
    font-size: 12px;
  }
}
</style>
