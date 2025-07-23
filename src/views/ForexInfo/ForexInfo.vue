<template>
    <div class="forex-system">
      <HeaderBar />
      <div class="content-wrap">
        <main class="main-content">
          <h1>환율 조회</h1>
          <nav class="tabs">
            <button class="active">현재환율</button>
            <button>평균환율</button>
            <button>환율변동</button>
            <button>환율차트</button>
            <button>비교시환율</button>
            <button>환율변동성</button>
            <button>통화간상관계수</button>
            <button>Domestic Rate</button>
          </nav>
          <section class="search-box">
            <form @submit.prevent="onSearch">
              <label>
                통화선택
                <select v-model="currency">
                  <option value="">선택 하세요</option>
                  <option value="USD">USD - 미국 달러</option>
                  <option value="EUR">EUR - 유로</option>
                  <option value="JPY">JPY - 일본 엔</option>
                  <option value="CNY">CNY - 중국 위안</option>
                </select>
              </label>
              <label>
                일자선택
                <input type="date" v-model="date" />
              </label>
              <button type="submit">조회</button>
            </form>
          </section>
          <section class="result-box" v-if="showResult">
            <h2>환율 결과</h2>
            <p>통화: {{ currency }}</p>
            <p>일자: {{ date }}</p>
            <p>환율: <strong>{{ rate }}</strong> KRW</p>
          </section>
          <footer class="footer-info">
            <span>기준일: {{ date }}</span>
            <span>조회시각: {{ currentTime }}</span>
          </footer>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ForexTradingSystem',
    data() {
      return {
        currency: '',
        date: this.getToday(),
        rate: '-',
        showResult: false,
        currentTime: this.getCurrentTime(),
      };
    },
    methods: {
      getToday() {
        const d = new Date();
        return d.toISOString().slice(0, 10);
      },
      getCurrentTime() {
        const d = new Date();
        return d.getFullYear() + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일 ' + d.getHours() + '시' + d.getMinutes() + '분' + d.getSeconds() + '초';
      },
      onSearch() {
        // 목업 환율 데이터
        const rates = { USD: 1380.5, EUR: 1500.2, JPY: 9.8, CNY: 190.1 };
        this.rate = rates[this.currency] || '-';
        this.showResult = !!this.currency;
        this.currentTime = this.getCurrentTime();
      },
    },
  };
  </script>
  
  <style scoped>
  .forex-system {
    font-family: 'Noto Sans KR', Arial, sans-serif;
    background: #fafbfc;
    min-height: 100vh;
    width: 100vw;
    min-width: 0;
  }
  .content-wrap {
    width: 100%;
  }
  .main-content {
    width: 100%;
    padding: 40px 48px;
  }
  .main-content h1 {
    font-size: 2rem;
    margin-bottom: 24px;
    color: #222;
  }
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
  }
  .tabs button {
    background: #f2f8f7;
    border: none;
    padding: 10px 18px;
    border-radius: 20px;
    color: #009490;
    font-weight: 500;
    cursor: pointer;
    transition: 0.2s;
  }
  .tabs button.active, .tabs button:hover {
    background: #009490;
    color: #fff;
  }
  .search-box {
    background: #fff;
    padding: 24px 32px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(219, 17, 17, 0.03);
    margin-bottom: 32px;
    color: #222;
  }
  .search-box form {
    display: flex;
    gap: 24px;
    align-items: flex-end;
  }
  .search-box label {
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    color: #222;
  }
  .search-box select, .search-box input[type="date"] {
    margin-top: 6px;
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    background: #fff;
    color: #222;
    font-family: inherit;
    outline: none;
    box-shadow: none;
  }
  .search-box button {
    background: #fff;
    color: #009490;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;
    border: 1.5px solid #009490;
    font-weight: 600;
  }
  .search-box button:hover {
    background: #e0f7f4;
    color: #007c7a;
  }
  .result-box {
    background: #f2f8f7;
    padding: 24px 32px;
    border-radius: 12px;
    margin-bottom: 24px;
    color: #222;
  }
  .result-box h2 {
    margin: 0 0 12px 0;
    color: #1565c0;
    background: none;
    font-weight: bold;
  }
  .result-box p {
    margin: 4px 0;
    font-size: 1.1rem;
    background: #fff;
    color: #222;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 8px;
  }
  .result-box strong {
    color: #1565c0;
    font-weight: bold;
  }
  .footer-info {
    display: flex;
    gap: 32px;
    color: #888;
    font-size: 0.95rem;
    margin-top: 32px;
  }
  </style>