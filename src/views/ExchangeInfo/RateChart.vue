<template>
    <div class="forex-system">
      <HeaderBar />
      <div class="content-wrap">
        <main class="main-content">
          <h1>환율 차트</h1>
  
          <!-- ✅ 공통 탭 컴포넌트 사용 -->
          <TabNav current="rateChart" />
  
          <!-- ✅ 차트 컴포넌트 -->
          <ExchangeRateChart :rates="ratesToShow" />
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import ExchangeRateChart from '@/components/chart/ExchangeRateChart.vue';
  import TabNav from '@/components/common/TabNav.vue';

  
  export default {
    components: {
      ExchangeRateChart,
      TabNav,
   
    },
    data() {
      return {
        exampleRates: [
          { date: '2025-07-20', usd: 1310, eur: 1470, jpy: 9.3, cny: 191 },
          { date: '2025-07-21', usd: 1312, eur: 1464, jpy: 9.28, cny: 192 },
          { date: '2025-07-22', usd: 1305, eur: 1460, jpy: 9.2, cny: 190 },
          { date: '2025-07-23', usd: 1320, eur: 1475, jpy: 9.35, cny: 193 },
          { date: '2025-07-24', usd: 1315, eur: 1468, jpy: 9.3, cny: 192 },
        ],
        ratesFromApi: [],
        isApiLoaded: false,
      };
    },
    computed: {
      ratesToShow() {
        return this.isApiLoaded && this.ratesFromApi.length > 0
          ? this.ratesFromApi
          : this.exampleRates;
      }
    },
    mounted() {
      this.fetchRates();
    },
    methods: {
      async fetchRates() {
        try {
          const response = await fetch('/api/exchange/history'); // ← 실제 API로 교체
          const data = await response.json();
          this.ratesFromApi = data;
          this.isApiLoaded = true;
        } catch (error) {
          console.error("API에서 환율 데이터를 불러오지 못했습니다:", error);
        }
      }
    }
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
  </style>
  