<template>
  <div class="forex-system">
    <div class="content-wrap">
      <header class="header-wrap">
        <div class="center-content">
          <h1 class="page-title">환율 계산기</h1>
          <nav class="tabs">
            <button class="active">외화 환전</button>
            <button>외화 송금</button>
            <button>환율변동</button>
          </nav>
        </div>
      </header>

      <div class="exchange-card">
        <div class="header">
        
        </div>
        <div class="form-section">
          <label>
            <span>송금 통화</span>
            <select v-model="fromCurrency">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.label }}
              </option>
            </select>
          </label>
          <label>
            <span>수취 통화</span>
            <select v-model="toCurrency" :disabled="toCurrencyDisabled">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.label }}
              </option>
            </select>
          </label>
          <label>
            <span>금액</span>
            <input type="number" v-model.number="amount" min="0" placeholder="금액 입력" />
          </label>
          <button class="exchange-btn" @click="calculate">환전하기</button>
        </div>
        <div v-if="result !== null" class="result-section">
          <svg width="28" height="28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#008485" />
            <path d="M8 14h12m-6-6v12" stroke="#fff" stroke-width="2" />
          </svg>
          <span>{{ amount }} {{ fromCurrency }} → <b>{{ result }}</b> {{ toCurrency }}</span>
        </div>
        <div v-if="rateInfo" class="rate-info">
          <small>적용 환율: <strong>{{ rateInfo }}</strong></small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HanaExchangeCalculator",
  data() {
    return {
      currencies: [
        { code: "KRW", label: "대한민국 원(KRW)" },
        { code: "USD", label: "미국 달러(USD)" },
        { code: "JPY", label: "일본 엔(JPY)" },
        { code: "EUR", label: "유럽 유로(EUR)" },
        { code: "CNY", label: "중국 위안(CNY)" },
      ],
      fromCurrency: "KRW",
      toCurrency: "USD",
      amount: null,
      result: null,
      rateInfo: null,
      exchangeRates: {
        "KRW-USD": 0.00075,
        "USD-KRW": 1325.0,
        "KRW-JPY": 0.108,
        "JPY-KRW": 9.26,
        "KRW-EUR": 0.00068,
        "EUR-KRW": 1460.0,
        "KRW-CNY": 0.0052,
        "CNY-KRW": 192.5,
      },
    };
  },
  computed: {
    toCurrencyDisabled() {
      return false;
    },
  },
  methods: {
    calculate() {
      if (!this.fromCurrency || !this.toCurrency || !this.amount) {
        alert("모든 값을 입력해 주세요");
        return;
      }
      const key = `${this.fromCurrency}-${this.toCurrency}`;
      const rate = this.exchangeRates[key];
      if (!rate) {
        this.result = null;
        this.rateInfo = "해당 환율 정보를 찾을 수 없습니다";
        return;
      }
      const calc = (this.amount * rate).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
      this.result = calc;
      this.rateInfo = `1 ${this.fromCurrency} = ${rate} ${this.toCurrency}`;
    },
  },
};
</script>

<style scoped>
.forex-system {
  font-family: "Noto Sans KR", Arial, sans-serif;
  background: #fafbfc;
  min-height: 100vh;
  width: 100vw;
  min-width: 0;
}
.content-wrap {
  width: 100%;
  max-width: 720px; /* 중간 정도 넓게 */
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* 1) 제목과 탭 메뉴를 중앙 정렬 및 세로 배치 */
.header-wrap {
  display: flex; /* Flexbox 유지 */
  justify-content: center; /* 가운데 정렬 */
  align-items: center; /* 수직 가운데 정렬 (필요시) */
  margin-bottom: 32px;
  width: 100%; /* 너비를 100%로 설정하여 justify-content가 작동하도록 */
}

/* 추가된 .center-content 클래스를 이용하여 제목과 탭을 감싸고 중앙 정렬 */
.center-content {
  display: flex;
  flex-direction: column; /* 세로로 배치 */
  align-items: center; /* 자식 요소들을 가운데 정렬 */
  width: 100%; /* 부모의 너비를 따르도록 설정 */
}


.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 16px 0; /* 제목 아래 여백 추가 */
}

/* 2) 탭 스타일 (기존 유지 + 버튼 확대, 높이 맞춤) */
.tabs {
  display: flex;
  gap: 8px;
  /* 가운데 정렬을 위해 justify-content 추가 (tabs 자체를 중앙에 놓기 위해) */
  justify-content: center;
}

.tabs button {
  background: #f2f8f7;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  color: #009490;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  height: 40px;
  line-height: 1.2;
  min-width: 90px;
  text-align: center;
}

.tabs button.active,
.tabs button:hover {
  background: #009490;
  color: #fff;
}

/* 3) 환전 카드 */
.exchange-card {
  max-width: 430px;
  margin: 0 auto;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 132, 133, 0.1),
    0 2px 4px rgba(0, 40, 70, 0.05);
  background: #fff;
  padding: 30px 32px 22px 32px;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.hana-logo {
  width: 36px;
  height: 36px;
}
.form-section label {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  font-weight: 500;
}
.form-section select,
.form-section input {
  padding: 8px 10px;
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  font-size: 1em;
  margin-top: 5px;
  outline: none;
  transition: box-shadow 0.2s;
}
.form-section select:focus,
.form-section input:focus {
  border-color: #008485;
  box-shadow: 0 0 0 2px #45c8b2a9;
}

/* 4) 환전하기 버튼 스타일 - 너비 자동, 탭 버튼과 조화 */
/* 하나은행 버튼 스타일 */
.exchange-btn {
  padding: 12px 32px;
  background: linear-gradient(90deg, #008485 60%, #00aba0 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 132, 133, 0.3);
  transition: background 0.3s ease;
  display: inline-block;
  width: auto;
  text-align: center;
  min-width: 140px;
}

.exchange-btn:hover {
  background: linear-gradient(90deg, #00aba0 10%, #008485 90%);
}

/* 5) 결과 영역 */
.result-section {
  background: #f7faf9;
  border: 1px solid #c6e9e0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.06em;
  color: #008485;
  font-weight: 500;
  justify-content: center;
}
.rate-info {
  margin-top: 7px;
  color: #888;
  font-size: 0.95em;
  text-align: center;
}
</style>