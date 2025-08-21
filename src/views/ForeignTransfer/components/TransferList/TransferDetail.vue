<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✖</button>
      <h2>송금 상세 정보</h2>
      <div v-if="transfer" class="detail-list">
        <div><strong>이름:</strong> {{ transfer.recipientName }}</div>
        <div><strong>통화:</strong> {{ transfer.currency }}</div>
        <div><strong>은행명:</strong> {{ transfer.senderBank }}</div>
        <div><strong>계좌:</strong> {{ transfer.senderAccount }}</div>
        <div><strong>연락처:</strong> {{ transfer.recipientPhone }}</div>
        <div><strong>이메일:</strong> {{ transfer.recipientEmail }}</div>
        <div><strong>주소:</strong> {{ transfer.recipientAddress }}</div>
        <div><strong>송금 금액:</strong> {{ formatAmount(transfer.amount) }}</div>
        <div>
          <strong>거래 상태:</strong>
          <span :class="statusClass(transfer.status)">{{ transferStatus(transfer.status) }}</span>
        </div>
        <div><strong>송금 사유:</strong> {{ transfer.memo || "-" }}</div>
      </div>
      <div v-else class="loading-text">로딩 중...</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["transferId"],
  data() {
    return {
      transfersTemp: [
        { id: 1, recipientName: "홍길동", currency: "USD", senderBank: "KOREX BANK", senderAccount: "123-456-7890", recipientPhone: "+1 1234-5678", recipientEmail: "hong@naver.com", recipientAddress: "United States of America", amount: 1500000, status: "REQUESTED", memo: "생활비 송금" },
        { id: 2, recipientName: "홍길순", currency: "EUR", senderBank: "KOREX BANK", senderAccount: "987-654-3210", recipientPhone: "+44 8765-4321", recipientEmail: "kim@gmail.com", recipientAddress: "United Kingdom", amount: 2000000, status: "APPROVED", memo: "여행 경비" },
        { id: 3, recipientName: "김철수", currency: "JPY", senderBank: "KOREX BANK", senderAccount: "111-222-3333", recipientPhone: "+81 1111-2222", recipientEmail: "lee@gmail.com", recipientAddress: "Japan", amount: 500000, status: "REJECTED", memo: "사업비" }
      ],
      transfer: null
    };
  },
  methods: {
    fetchTransferDetail() {
      this.transfer = this.transfersTemp.find(t => t.id === this.transferId);
    },
    transferStatus(status) {
      switch(status){
        case "REQUESTED": return " 요청 완료";
        case "REJECTED": return " 반려";
        case "APPROVED": return " 승인";
        default: return "-";
      }
    },
    statusClass(status) {
      return {
        requested: status === "REQUESTED",
        rejected: status === "REJECTED",
        approved: status === "APPROVED"
      };
    },
    formatAmount(amount) { return amount.toLocaleString() + "원"; }
  },
  watch: {
    transferId: { immediate: true, handler() { if(this.transferId) this.fetchTransferDetail(); } }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 600px; /* 축소 */
  padding: 24px; /* 축소 */
  border-radius: 12px;
  position: relative;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  font-size: 15px; /* 축소 */
}

.close-btn {
  position: absolute;
  top: 12px; right: 12px; /* 축소 */
  border: none;
  background: transparent;
  font-size: 18px; /* 축소 */
  cursor: pointer;
  color: #6b7280;
}
.close-btn:hover { color: #111827; }

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 축소 */
  margin-top: 16px;
}

.loading-text {
  text-align: center;
  color: #6b7280;
}

/* 상태별 색상 */
.requested { color: #00908C; font-weight: 500; } /* 포인트 색상 */
.rejected { color: #dc2626; font-weight: 500; }
.approved { color: #16a34a; font-weight: 500; }

/* 강조 색상 통일 가능 */
h2 { color: #00908C; font-size: 20px; margin-bottom: 16px; }
strong { color: #111827; }
</style>
