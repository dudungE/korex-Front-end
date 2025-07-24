<template>
  <div class="forex-system">
    <main class="main-content">
      <h1>예약 환전</h1>

      <div class="exchange-main">
        <div class="exchange-form">
          <p class="form-subtitle">예약 환전할 통화 선택 및 조건을 입력하세요</p>

          <!-- From Section (KRW 고정) -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">From</span>
              <div class="balance-info">
                Balance: {{ getBalanceAmount('KRW') }}
                <button class="max-btn" @click="setMaxAmount">Max</button>
              </div>
            </div>

            <div class="currency-input-row">
              <select class="currency-dropdown" disabled>
                <option value="KRW">🇰🇷 한국 KRW</option>
              </select>

              <input type="number" v-model="inputAmount" class="amount-input" placeholder="0"
                @input="calculateExchange" />
            </div>
          </div>

          <!-- Exchange Icon -->
          <div class="exchange-icon-container">
            <div class="exchange-icon-disabled">
              ↓
            </div>
          </div>

          <!-- To Section -->
          <div class="currency-section">
            <div class="section-header">
              <span class="section-label">To</span>
            </div>

            <div class="currency-input-row">
              <select v-model="toCurrency" class="currency-dropdown" @change="calculateExchange">
                <option value="USD">🇺🇸 미국 USD</option>
                <option value="JPY">🇯🇵 일본 JPY</option>
                <option value="EUR">🇪🇺 유럽연합 EUR</option>
              </select>

              <input type="number" :value="convertedAmount" class="amount-input" placeholder="0" readonly />
            </div>
          </div>

          <!-- 예약 조건 설정 Section -->
          <div class="reservation-condition-section">
            <div class="condition-header">
              <span class="condition-label">예약 조건 설정</span>
            </div>

            <!-- 목표 환율 설정 -->
            <div class="condition-row">
              <label class="condition-title">목표 환율</label>
              <div class="target-rate-input">
                <input type="number" v-model="targetRate" class="rate-input" 
                  :placeholder="currentExchangeRate.toFixed(4)" step="0.0001" />
                <span class="rate-label">{{ toCurrency }}/KRW</span>
              </div>
            </div>

            <!-- 예약 기간 설정 -->
            <div class="condition-row">
              <label class="condition-title">예약 기간</label>
              <div class="date-input-group">
                <input type="date" v-model="reservationStartDate" class="date-input" />
                <span class="date-separator">~</span>
                <input type="date" v-model="reservationEndDate" class="date-input" />
              </div>
            </div>
          </div>

          <!-- 예약 정보 Section -->
          <div class="exchange-info-section" v-if="inputAmount && inputAmount > 0 && targetRate">
            <div class="exchange-info-header">
              <span class="info-label">예약 환전 정보</span>
            </div>

            <div class="fee-details">
              <div class="fee-row">
                <span class="fee-label">현재 환율</span>
                <span class="fee-value">{{ currentExchangeRate.toFixed(4) }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">목표 환율</span>
                <span class="fee-value highlight">{{ parseFloat(targetRate).toFixed(4) }}</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">예상 수수료 (0.3%)</span>
                <span class="fee-value">{{ formatNumber(calculateReservationFee()) }} KRW</span>
              </div>
              <div class="fee-row">
                <span class="fee-label">예약 기간</span>
                <span class="fee-value">{{ formatDateRange() }}</span>
              </div>
              <div class="fee-row total-row">
                <span class="fee-label">목표 달성 시 받을 금액</span>
                <span class="fee-value total-amount">{{ formatNumber(expectedAmount) }} {{ toCurrency }}</span>
              </div>
            </div>
          </div>

          <!-- 예약 환전 신청 버튼 -->
          <button class="exchange-btn" :disabled="!isReservationValid" @click="createReservation">
            {{ getButtonText() }}
          </button>
        </div>

        <!-- 예약 환전 현황 -->
        <div class="reservation-status-section">
          <div class="status-header">
            <h3>나의 예약 환전 현황</h3>
            <span class="total-reserved">예약 중인 금액: {{ formatNumber(getTotalReservedAmount()) }} KRW</span>
          </div>

          <div class="reservation-list">
            <div v-if="reservations.length === 0" class="no-reservations">
              예약된 환전이 없습니다.
            </div>
            
            <div class="reservation-item" v-for="reservation in reservations" :key="reservation.id">
              <div class="reservation-header">
                <span class="reservation-pair">KRW → {{ reservation.toCurrency }}</span>
                <span class="reservation-status" :class="reservation.status">
                  {{ getStatusText(reservation.status) }}
                </span>
              </div>
              
              <div class="reservation-details">
                <div class="detail-row">
                  <span class="detail-label">예약 금액</span>
                  <span class="detail-value">{{ formatNumber(reservation.amount) }} KRW</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">목표 환율</span>
                  <span class="detail-value">{{ reservation.targetRate.toFixed(4) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">예약 기간</span>
                  <span class="detail-value">{{ reservation.startDate }} ~ {{ reservation.endDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">예상 수령액</span>
                  <span class="detail-value highlight">
                    {{ formatNumber(reservation.expectedAmount) }} {{ reservation.toCurrency }}
                  </span>
                </div>
              </div>

              <div class="reservation-actions" v-if="reservation.status === 'waiting'">
                <button class="cancel-btn" @click="cancelReservation(reservation.id)">
                  예약 취소
                </button>
              </div>

              <div class="reservation-date">
                <span>예약일: {{ reservation.createdAt }}</span>
              </div>
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
</template>

<script>
export default {
  name: 'ReservationExchange',
  data() {
    return {
      fromCurrency: 'KRW', // 고정
      toCurrency: 'USD',
      inputAmount: '',
      convertedAmount: 0,
      currentExchangeRate: 0,
      targetRate: '',
      reservationStartDate: '',
      reservationEndDate: '',
      conditionType: 'reach',
      expectedAmount: 0,

      // 환율 정보 (KRW 기준)
      rates: {
        USD: 1393.33,
        JPY: 9.38,
        EUR: 1617.94
      },

      // 잔액 정보
      balances: {
        KRW: 1000000,
        USD: 500,
        JPY: 50000,
        EUR: 300
      },

      // 예약된 금액 (KRW 기준)
      reservedAmount: 200000, // 이미 예약된 금액

      // 예약 환전 내역
      reservations: [
        {
          id: 1,
          fromCurrency: 'KRW',
          toCurrency: 'USD',
          amount: 100000,
          targetRate: 1400.00,
          expectedAmount: 71.43,
          status: 'waiting',
          createdAt: '2025-07-20',
          startDate: '2025-07-20',
          endDate: '2025-08-20',
          conditionType: 'reach'
        },
        {
          id: 2,
          fromCurrency: 'KRW',
          toCurrency: 'USD',
          amount: 100000,
          targetRate: 1350.00,
          expectedAmount: 74.07,
          status: 'waiting',
          createdAt: '2025-07-18',
          startDate: '2025-07-18',
          endDate: '2025-08-18',
          conditionType: 'better'
        }
      ]
    }
  },

  computed: {
    isAmountExceedsBalance() {
      if (!this.inputAmount || this.inputAmount <= 0) {
        return false;
      }
      const availableBalance = this.balances.KRW - this.reservedAmount;
      return parseFloat(this.inputAmount) > availableBalance;
    },

    isReservationValid() {
      return this.inputAmount && 
             this.inputAmount > 0 && 
             this.targetRate && 
             this.reservationStartDate && 
             this.reservationEndDate &&
             !this.isAmountExceedsBalance &&
             new Date(this.reservationEndDate) >= new Date(this.reservationStartDate);
    }
  },

  mounted() {
    this.calculateExchange();
    this.setDefaultDates();
    this.updateReservedAmount();
  },

  methods: {
    calculateExchange() {
      if (!this.inputAmount || this.inputAmount <= 0) {
        this.convertedAmount = 0;
        this.currentExchangeRate = 0;
        this.expectedAmount = 0;
        return;
      }

      // KRW에서 다른 통화로 환전 (고정)
      const rate = this.rates[this.toCurrency];
      const convertedValue = parseFloat(this.inputAmount) / this.rates[this.toCurrency];

      this.currentExchangeRate = rate;
      this.convertedAmount = convertedValue;

      // 목표 환율로 예상 금액 계산
      if (this.targetRate) {
        this.calculateExpectedAmount();
      }
    },

    calculateExpectedAmount() {
      if (!this.targetRate || !this.inputAmount) {
        this.expectedAmount = 0;
        return;
      }

      const targetValue = parseFloat(this.inputAmount) / parseFloat(this.targetRate);
      const fee = this.calculateReservationFee();
      const feeInTargetCurrency = fee / parseFloat(this.targetRate);
      this.expectedAmount = targetValue - feeInTargetCurrency;
    },

    calculateReservationFee() {
      return parseFloat(this.inputAmount) * 0.003; // 0.3% 수수료
    },

    getBalanceAmount(currency) {
      if (currency === 'KRW') {
        const availableBalance = this.balances.KRW - this.reservedAmount;
        return this.formatNumber(availableBalance);
      }
      return this.formatNumber(this.balances[currency]);
    },

    setMaxAmount() {
      const availableBalance = this.balances.KRW - this.reservedAmount;
      this.inputAmount = availableBalance;
      this.calculateExchange();
    },

    setDefaultDates() {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      this.reservationStartDate = today.toISOString().slice(0, 10);
      this.reservationEndDate = nextMonth.toISOString().slice(0, 10);
    },

    formatDateRange() {
      if (!this.reservationStartDate || !this.reservationEndDate) return '';
      return `${this.reservationStartDate} ~ ${this.reservationEndDate}`;
    },

    createReservation() {
      const reservationAmount = parseFloat(this.inputAmount);
      const expectedAmount = parseFloat(this.inputAmount) / parseFloat(this.targetRate) - (this.calculateReservationFee() / parseFloat(this.targetRate));

      const newReservation = {
        id: Date.now(),
        fromCurrency: 'KRW',
        toCurrency: this.toCurrency,
        amount: reservationAmount,
        targetRate: parseFloat(this.targetRate),
        expectedAmount: expectedAmount,
        status: 'waiting',
        createdAt: new Date().toISOString().slice(0, 10),
        startDate: this.reservationStartDate,
        endDate: this.reservationEndDate,
        conditionType: this.conditionType
      };

      this.reservations.unshift(newReservation);
      
      // 예약된 금액을 잔액에서 차감
      this.reservedAmount += reservationAmount;
      
      alert('예약 환전이 신청되었습니다.');
      
      // 폼 초기화
      this.inputAmount = '';
      this.targetRate = '';
      this.calculateExchange();
    },

    cancelReservation(reservationId) {
      const reservationIndex = this.reservations.findIndex(r => r.id === reservationId);
      if (reservationIndex === -1) return;

      const reservation = this.reservations[reservationIndex];
      
      if (confirm(`${this.formatNumber(reservation.amount)} KRW 예약 환전을 취소하시겠습니까?`)) {
        // 예약된 금액을 잔액에 다시 추가
        this.reservedAmount -= reservation.amount;
        
        // 예약 내역에서 제거
        this.reservations.splice(reservationIndex, 1);
        
        alert('예약 환전이 취소되었습니다.');
      }
    },

    getTotalReservedAmount() {
      return this.reservations
        .filter(r => r.status === 'waiting')
        .reduce((total, r) => total + r.amount, 0);
    },

    updateReservedAmount() {
      this.reservedAmount = this.getTotalReservedAmount();
    },

    getButtonText() {
      if (!this.inputAmount) return '금액을 입력하세요';
      if (this.isAmountExceedsBalance) return '사용 가능한 잔액 부족';
      if (!this.targetRate) return '목표 환율을 입력하세요';
      if (!this.reservationStartDate || !this.reservationEndDate) return '예약 기간을 설정하세요';
      if (new Date(this.reservationEndDate) < new Date(this.reservationStartDate)) return '올바른 기간을 설정하세요';
      return '예약 환전 신청';
    },

    getStatusText(status) {
      const statusMap = {
        waiting: '대기중',
        completed: '완료',
        cancelled: '취소',
        expired: '만료'
      };
      return statusMap[status] || status;
    },

    formatNumber(num) {
      if (!num) return '0';
      return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num);
    },

    getToday() {
      const d = new Date();
      return d.toISOString().slice(0, 10);
    },

    getCurrentTime() {
      const d = new Date();
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초`;
    }
  },

  watch: {
    targetRate() {
      this.calculateExpectedAmount();
    },
    
    reservations: {
      handler() {
        this.updateReservedAmount();
      },
      deep: true
    }
  }
}
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

.currency-dropdown:disabled {
  background: #f8f9fa;
  color: #666;
  cursor: not-allowed;
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

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input[type=number] {
  -moz-appearance: textfield;
}

/* Exchange Icon */
.exchange-icon-container {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.exchange-icon-disabled {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #999;
}

/* 예약 조건 설정 Section */
.reservation-condition-section {
  margin: 24px 0;
  padding: 20px;
  background: #fff8f0;
  border-radius: 12px;
  border: 1px solid #f0b75c;
}

.condition-header {
  margin-bottom: 16px;
}

.condition-label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.condition-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.condition-title {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 80px;
}

.target-rate-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 120px;
  text-align: right;
}

.rate-label {
  color: #666;
  font-size: 0.9rem;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.date-separator {
  color: #666;
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
  color: #f0b75c;
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

/* 예약 환전 현황 Section */
.reservation-status-section {
  flex: 4;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.status-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.status-header h3 {
  color: #009490;
  font-size: 1.2rem;
  margin: 0;
}

.total-reserved {
  color: #f0b75c;
  font-weight: 600;
  font-size: 0.9rem;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-reservations {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 0.9rem;
}

.reservation-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reservation-pair {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.reservation-status {
  font-weight: 500;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.reservation-status.waiting {
  color: #f0b75c;
  background: #fff8f0;
}

.reservation-status.completed {
  color: #009490;
  background: #f0f8f7;
}

.reservation-status.cancelled {
  color: #dc3545;
  background: #fdf2f2;
}

.reservation-status.expired {
  color: #999;
  background: #f8f9fa;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
  font-size: 0.85rem;
}

.detail-value {
  color: #333;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-value.highlight {
  color: #009490;
  font-weight: 600;
}

.reservation-actions {
  margin-bottom: 8px;
}

.cancel-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.cancel-btn:hover {
  background: #c82333;
}

.reservation-date {
  text-align: right;
  color: #999;
  font-size: 0.8rem;
  border-top: 1px solid #e9ecef;
  padding-top: 8px;
}

.footer-info {
  display: flex;
  gap: 32px;
  color: #888;
  font-size: 0.95rem;
  margin-top: 32px;
}
</style>
