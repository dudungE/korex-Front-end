<template>
  <div class="forex-alert-page">
    <h1 class="page-title">환율 알림 서비스</h1>

    <section class="alert-form">
      <label>
        <span>통화 선택</span>
        <select v-model="newAlert.currency">
          <option disabled value="">선택하세요</option>
          <option v-for="c in currencies" :key="c.code" :value="c.code">
            {{ c.label }}
          </option>
        </select>
      </label>

      <label>
        <span>목표 환율</span>
        <input type="number" v-model.number="newAlert.targetRate" placeholder="예: 1300" min="0" step="0.01" />
      </label>

      <label>
        <span>알림 조건</span>
        <select v-model="newAlert.type">
          <option value="ABOVE">이상(≥)</option>
          <option value="BELOW">이하(≤)</option>
        </select>
      </label>

      <button class="hana-btn" @click="addAlert">알림 등록</button>
    </section>

    <section class="alert-list" v-if="alerts.length">
      <h2>등록된 환율 알림</h2>
      <table>
        <thead>
          <tr>
            <th>통화</th>
            <th>목표 환율</th>
            <th>조건</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(alert, idx) in alerts" :key="idx">
            <td>{{ getCurrencyLabel(alert.currency) }}</td>
            <td>{{ alert.targetRate }}</td>
            <td>{{ alert.type === 'ABOVE' ? '이상(≥)' : '이하(≤)' }}</td>
            <td><button class="delete-btn" @click="removeAlert(idx)">삭제</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="no-alerts">
      등록된 알림이 없습니다.
    </section>
  </div>
</template>

<script>
export default {
  name: "ForexAlertPage",
  data() {
    return {
      currencies: [
        { code: "USD", label: "미국 달러 (USD)" },
        { code: "EUR", label: "유로 (EUR)" },
        { code: "JPY", label: "일본 엔 (JPY)" },
        { code: "CNY", label: "중국 위안 (CNY)" },
        { code: "KRW", label: "대한민국 원 (KRW)" },
      ],
      newAlert: {
        currency: "",
        targetRate: null,
        type: "ABOVE",
      },
      alerts: [],
    };
  },
  methods: {
    addAlert() {
      if (!this.newAlert.currency) {
        alert("통화를 선택해 주세요.");
        return;
      }
      if (this.newAlert.targetRate === null || this.newAlert.targetRate <= 0) {
        alert("유효한 목표 환율을 입력해 주세요.");
        return;
      }
      this.alerts.push({ ...this.newAlert });
      this.resetForm();
    },
    removeAlert(index) {
      this.alerts.splice(index, 1);
    },
    resetForm() {
      this.newAlert = {
        currency: "",
        targetRate: null,
        type: "ABOVE",
      };
    },
    getCurrencyLabel(code) {
      const cur = this.currencies.find((c) => c.code === code);
      return cur ? cur.label : code;
    },
  },
};
</script>

<style scoped>
.forex-alert-page {
  max-width: 460px;
  margin: 30px auto;
  background: #fff;
  border-radius: 18px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 132, 133, 0.12), 0 2px 6px rgba(0, 40, 70, 0.07);
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  color: #222;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #008485;
  text-align: center;
  margin-bottom: 28px;
}

.alert-form label {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  font-weight: 600;
  color: #008485;
}

.alert-form select,
.alert-form input {
  padding: 8px 10px;
  font-size: 1em;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  margin-top: 6px;
  outline: none;
  transition: box-shadow 0.2s ease;
}

.alert-form select:focus,
.alert-form input:focus {
  border-color: #008485;
  box-shadow: 0 0 6px #45c8b2a9;
}

.hana-btn {
  width: 100%;
  padding: 14px 0;
  background: linear-gradient(90deg, #008485 60%, #00aba0 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.12em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 132, 133, 0.35);
  transition: background 0.3s ease;
  user-select: none;
}

.hana-btn:hover {
  background: linear-gradient(90deg, #00aba0 10%, #008485 90%);
}

.alert-list {
  margin-top: 32px;
}

.alert-list h2 {
  color: #005750;
  font-weight: 700;
  margin-bottom: 18px;
  border-bottom: 2px solid #008485;
  padding-bottom: 8px;
  text-align: center;
}

.alert-list table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-weight: 500;
}

.alert-list th,
.alert-list td {
  padding: 12px 8px;
  border-bottom: 1px solid #e1eae8;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease;
}

.delete-btn:hover {
  background: #d32f2f;
}

.no-alerts {
  text-align: center;
  color: #666;
  padding: 40px 0;
  font-style: italic;
  font-weight: 500;
}
</style>
