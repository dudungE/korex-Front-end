<template>
  <div class="recipient-page">
    <div class="recipient-card">
      <!-- 제목 + 추가 버튼 -->
      <div class="card-header">
        <h1>수취인 목록</h1>
        <div class="list-actions">
          <button @click="goToCreate" class="icon-btn">
            <span class="material-icons">add</span>
          </button>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="table-wrapper">
        <table class="recipient-table">
          <thead>
          <tr>
            <th>이름</th>
            <th>통화</th>
            <th>은행명</th>
            <th>계좌번호</th>
            <th>연락처</th>
            <th>이메일</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="recipient in recipients" :key="recipient.recipientId">
            <td>{{ recipient.name }}</td>
            <td>{{ recipient.selectedCurrency }}</td>
            <td>{{ recipient.bankName }}</td>
            <td>{{ recipient.accountNumber }}</td>
            <td>{{ recipient.phoneNumber }}</td>
            <td>{{ recipient.email }}</td>
            <td class="action-buttons">
              <button @click="editRecipient(recipient.recipientId)" class="icon-btn">
                <span class="material-icons">edit</span>
              </button>
              <button @click="deleteRecipient(recipient.recipientId)" class="icon-btn danger">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="recipient-page">
    <div class="recipient-card">
      <!-- 제목 + 추가 버튼 -->
      <div class="card-header">
        <h1>수취인 목록</h1>
        <div class="list-actions">
          <button @click="goToCreate" class="icon-btn">
            <span class="material-icons">add</span>
          </button>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="table-wrapper">
        <table class="recipient-table">
          <thead>
          <tr>
            <th>이름</th>
            <th>통화</th>
            <th>은행명</th>
            <th>계좌번호</th>
            <th>연락처</th>
            <th>이메일</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="recipient in recipients" :key="recipient.recipientId">
            <td>{{ recipient.name }}</td>
            <td>{{ recipient.currency }}</td>
            <td>{{ recipient.bankName }}</td>
            <td>{{ recipient.accountNumber }}</td>
            <td>{{ recipient.phoneNumber }}</td>
            <td>{{ recipient.email }}</td>
            <td class="action-buttons">
              <button @click="editRecipient(recipient.recipientId)" class="icon-btn">
                <span class="material-icons">edit</span>
              </button>
              <button @click="deleteRecipient(recipient.recipientId)" class="icon-btn danger">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      recipients: [],
    };
  },
  created() {
    this.fetchRecipients();
  },
  methods: {
    async fetchRecipients() {
      try {
        const token = localStorage.getItem("accessToken");

        // 토큰 없으면 로그인 페이지로 이동
        if (!token) {
          alert("로그인이 필요합니다.");
          this.$router.push("/login");
          return;
        }

        const res = await axios.get("/api/ForeignTransfer/recipients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.recipients = res.data; // currencyName 포함 그대로 사용
        console.log("수취인 목록:", this.recipients);
      } catch (err) {
        console.error("📥 Axios 응답 오류:", err.response || err);
        // 401 발생 시 로그인 페이지로 이동
        if (err.response && err.response.status === 401) {
          alert("세션이 만료되었거나 인증에 실패했습니다. 다시 로그인해주세요.");
          this.$router.push("/login");
        }
      }
    },
    goToCreate() {
      this.$router.push("/recipients/post");
    },
    editRecipient(id) {
      this.$router.push(`/recipients/edit/${id}`);
    },
    async deleteRecipient(id) {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          this.$router.push("/login");
          return;
        }
        await axios.delete(`/api/ForeignTransfer/recipients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.recipients = this.recipients.filter((r) => r.recipientId !== id);
      } catch (err) {
        console.error("수취인 삭제 실패:", err.response || err);
      }
    },
  },
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.recipient-page { max-width: 950px; margin: 2rem auto; padding: 1rem; font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #333; }

.recipient-card { background-color: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }

.card-header { padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.card-header h1 { margin: 0; color: #008681; font-size: 28px; font-weight: 700; }
.list-actions { display: flex; justify-content: flex-end; }

.table-wrapper { overflow-x: auto; border-radius: 10px; border: none; padding: 0; background-color: transparent; box-shadow: none; }

.recipient-table { width: 100%; border-collapse: collapse; border: none; table-layout: auto; min-width: 850px; margin: 0 auto; }
.recipient-table th { padding: 8px; background-color: #E6F5F4; color: #008681; font-weight: 600; text-align: center; word-break: break-word; }
.recipient-table td { padding: 8px; background-color: #F9FEFD; text-align: center; font-size: 14px; word-break: break-word; vertical-align: middle; }

/* 액션 버튼 가로 폭 줄이기 */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  width: 60px;
}

/* 심플 아이콘 버튼 */
.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  color: #008681;
}
.icon-btn:hover { color: #2e8b57; }
.icon-btn.danger { color: #dc2626; }
.icon-btn.danger:hover { color: #b91c1c; }

.material-icons { font-size: 20px; }

/* 모바일 대응 */
@media (max-width: 768px) {
  .card-header h1 { font-size: 24px; }
  .recipient-table { min-width: unset; font-size: 13px; }
  .icon-btn { padding: 3px; font-size: 18px; }
  .action-buttons { width: 50px; gap: 0.2rem; }
}
</style>


<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.recipient-page { max-width: 950px; margin: 2rem auto; padding: 1rem; font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #333; }

.recipient-card { background-color: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }

.card-header { padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.card-header h1 { margin: 0; color: #008681; font-size: 28px; font-weight: 700; }
.list-actions { display: flex; justify-content: flex-end; }

.table-wrapper { overflow-x: auto; border-radius: 10px; border: none; padding: 0; background-color: transparent; box-shadow: none; }

.recipient-table { width: 100%; border-collapse: collapse; border: none; table-layout: auto; min-width: 850px; margin: 0 auto; }
.recipient-table th { padding: 8px; background-color: #E6F5F4; color: #008681; font-weight: 600; text-align: center; word-break: break-word; }
.recipient-table td { padding: 8px; background-color: #F9FEFD; text-align: center; font-size: 14px; word-break: break-word; vertical-align: middle; }

/* 액션 버튼 가로 폭 줄이기 */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  width: 60px;
}

/* 심플 아이콘 버튼 */
.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  color: #008681;
}
.icon-btn:hover { color: #2e8b57; }
.icon-btn.danger { color: #dc2626; }
.icon-btn.danger:hover { color: #b91c1c; }

.material-icons { font-size: 20px; }

/* 모바일 대응 */
@media (max-width: 768px) {
  .card-header h1 { font-size: 24px; }
  .recipient-table { min-width: unset; font-size: 13px; }
  .icon-btn { padding: 3px; font-size: 18px; }
  .action-buttons { width: 50px; gap: 0.2rem; }
}
</style>
