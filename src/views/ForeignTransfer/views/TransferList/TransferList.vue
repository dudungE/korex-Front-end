<template>
  <div class="foreign-transfer-page">
    <!-- 전체 카드 박스: 제목 + 조회 + 테이블 -->
    <div class="transfer-card">

      <!-- 제목 + 조회 -->
      <div class="card-header">
        <h1 class="page-title">송금 거래 내역</h1>
        <div class="filter-period">
          <input type="date" v-model="startDate" />
          <span>~</span>
          <input type="date" v-model="endDate" />
          <button @click="fetchTransfers">조회</button>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="table-wrapper">
        <table class="transfer-table">
          <thead>
          <tr>
            <th>이름</th>
            <th>통화</th>
            <th>은행</th>
            <th>계좌번호</th>
            <th>연락처</th>
            <th>이메일</th>
            <th>금액</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="transfer in transfers" :key="transfer.id">
            <td>{{ transfer.recipientName }}</td>
            <td>{{ transfer.currency }}</td>
            <td>{{ transfer.senderBank }}</td>
            <td>{{ transfer.senderAccount }}</td>
            <td>{{ transfer.recipientPhone }}</td>
            <td>{{ transfer.recipientEmail }}</td>
            <td>{{ formatAmount(transfer.amount) }}</td>
            <td :class="statusClass(transfer.status)">{{ transferStatus(transfer.status) }}</td>
            <td>
              <button class="detail-btn" @click="viewDetail(transfer.id)">상세</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- 상세 모달 -->
    <TransferDetail
        v-if="selectedTransferId"
        :transferId="selectedTransferId"
        @close="selectedTransferId = null"
    />
  </div>
</template>

<script>
import TransferDetail from '@/views/ForeignTransfer/components/TransferList/TransferDetail.vue'

export default {
  components: { TransferDetail },
  data() {
    return {
      transfers: [
        { id: 1, recipientName: "홍길동", currency: "USD", senderBank: "KOREX BANK", senderAccount: "123-456-7890", recipientPhone: "+1 1234-5678", recipientEmail: "hong@naver.com", recipientAddress: "United States of America", amount: 1500000, status: "REQUESTED", memo: "생활비 송금" },
        { id: 2, recipientName: "홍길순", currency: "EUR", senderBank: "KOREX BANK", senderAccount: "987-654-3210", recipientPhone: "+44 8765-4321", recipientEmail: "kim@gmail.com", recipientAddress: "United Kingdom", amount: 2000000, status: "APPROVED", memo: "여행 경비" },
        { id: 3, recipientName: "김철수", currency: "JPY", senderBank: "KOREX BANK", senderAccount: "111-222-3333", recipientPhone: "+81 1111-2222", recipientEmail: "lee@gmail.com", recipientAddress: "Japan", amount: 500000, status: "REJECTED", memo: "사업비" }
      ],
      startDate: "",
      endDate: "",
      selectedTransferId: null,
    };
  },
  methods: {
    fetchTransfers() { console.log("기간별 조회:", this.startDate, this.endDate); },
    viewDetail(id) { this.selectedTransferId = id; },
    transferStatus(status) {
      switch(status){
        case "REQUESTED": return "요청 완료";
        case "REJECTED": return "반려";
        case "APPROVED": return "승인";
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
  }
};
</script>

<style scoped>
/* 전체 카드 */
.transfer-card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
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
}

/* 조회 영역 */
.filter-period {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
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

/* 테이블 wrapper */
.table-wrapper {
  overflow-x: auto; /* 화면보다 넓으면 가로 스크롤 */
  border-radius: 10px; /* 옵션: 필요하면 남김 */
  border: none; /* 흰색 박스 테두리 제거 */
  padding: 0; /* 패딩 제거 */
  background-color: transparent; /* 배경 제거 */
  box-shadow: none; /* 그림자 제거 */
}

/* 테이블 스타일 */
.transfer-table {
  width: 100%;
  border-collapse: collapse; /* 내부 선만 표시 */
  border: none;              /* 외곽선 제거 */
  table-layout: auto;
  min-width: 850px;
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

/* 상태별 색상 */
.requested { color: #d97706; font-weight: 500;}
.rejected { color: #dc2626; font-weight: 500; }
.approved { color: #2e8b57; font-weight: 500; }

/* 모바일 */
@media (max-width: 768px) {
  .page-title { font-size: 24px; margin-bottom: 20px }
  .filter-period { flex-wrap: wrap; justify-content: center }
  .filter-period input { width: 130px; }
  .table-wrapper { padding: 10px 0; }
  .transfer-table { min-width: unset; font-size: 13px; }
  .detail-btn { padding: 3px 6px; font-size: 12px; }
}
</style>
