<template>
  <div class="home-system">
    <div class="mainpage-wrap">
      <div class="mainpage-top">
        <div class="carousel-area">
          <div class="carousel-label">이벤트</div>
          <div class="carousel-title">알람이 울리는 순간<br>돈기운이 터진다!</div>
          <div class="carousel-desc">놀이터랑 친구하고<br>도나와라 머니클락 굿즈 받기</div>
          <button class="carousel-btn">자세히보기</button>
        </div>
      </div>
      <div class="mainpage-icon-menu">
        <button class="icon-menu-btn" @click="onFeatureClick('rate-lookup')"><img src="@/assets/환율버튼.png" alt="환율조회" class="icon-img" /><span>환율조회</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('openbank')"><img src="@/assets/환전버튼.png" alt="환전" class="icon-img" /><span>환전</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('cert')"><img src="@/assets/친구송금버튼.png" alt="친구송금" class="icon-img" /><span>친구송금</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('ForeignTransfer')"><img src="@/assets/해외송금버튼.png" alt="해외송금" class="icon-img" /><span>해외송금</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('quick')"><img src="@/assets/계좌조회버튼.png" alt="계좌 조회" class="icon-img" /><span>계좌조회</span></button>
      </div>
      
             <!-- 환율 정보와 뉴스 섹션 -->
       <div class="exchange-news-container">
         <!-- 환율 정보 섹션 -->
         <div class="exchange-rate-section">
           <div class="section-header">
             <h2>환율 정보</h2>
             <div class="last-update">
             </div>
           </div>
           
           <div class="forex-rate-container">
             <div class="forex-rate-list">
                            <div
                    v-for="item in processedForexRates"
                    :key="item.currency_code"
                    class="rate-row"
                >
                  <span class="flag" aria-hidden="true">{{ item.flag }}</span>
                  <span class="pair">{{ item.pair }}</span>
                  <span class="rate">{{ formatRate(item.base_rate) }}</span>
                </div>
             </div>
           </div>
         </div>
         
         <!-- 환율 뉴스 섹션 -->
         <div class="exchange-news-section">
           <div class="section-header">
             <h2>환율 뉴스</h2>
             <div class="last-update">
             </div>
           </div>
           
           <div class="news-container">
             <div class="news-list">
               <div
                   v-for="news in exchangeNews"
                   :key="news.link"
                   class="news-item"
                   @click="openNewsLink(news.link)"
               >
                 <div class="news-title">{{ news.title }}</div>
                                   <div class="news-time">{{ formatNewsTime(news.date) }}</div>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      forexRates: {},
      lastUpdateTime: '',
      exchangeNews: [],
      newsUpdateTime: '',
      loading: false,
      error: null
    };
  },
  computed: {
    processedForexRates() {
      const rates = [];
      const currencyFlags = {
        'USD': '🇺🇸', 'JPY': '🇯🇵', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'CHF': '🇨🇭',
        'CAD': '🇨🇦', 'AUD': '🇦🇺', 'NZD': '🇳🇿', 'HKD': '🇭🇰', 'CNY': '🇨🇳',
        'SEK': '🇸🇪', 'DKK': '🇩🇰', 'NOK': '🇳🇴', 'THB': '🇹🇭', 'SGD': '🇸🇬'
      };
      
             Object.keys(this.forexRates).forEach(currencyCode => {
         const currencyData = this.forexRates[currencyCode];
         if (currencyData && currencyData.currency_code) {
           rates.push({
             currency_code: currencyCode,
             pair: `${currencyCode}/KRW`,
             flag: currencyFlags[currencyCode] || '💱',
             base_rate: currencyData.base_rate,
             crawl_time: currencyData.crawl_time
           });
         }
       });
      
             // 원하는 순서대로 정렬
       const order = ['USD', 'JPY', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'NZD', 'HKD', 'CNY', 'SEK', 'DKK', 'NOK', 'THB', 'SGD'];
       return rates.sort((a, b) => {
         const aIndex = order.indexOf(a.currency_code);
         const bIndex = order.indexOf(b.currency_code);
         return aIndex - bIndex;
       });
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchExchangeRates(),
      this.fetchExchangeNews()
    ]);
    // 1분마다 환율 데이터 업데이트
    setInterval(this.fetchExchangeRates, 60 * 1000);
    // 5분마다 뉴스 데이터 업데이트
    setInterval(this.fetchExchangeNews, 5 * 60 * 1000);
  },
  methods: {
    async fetchExchangeRates() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch('/api/exchange/main-page-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.forexRates = data;
        
                 // 첫 번째 통화의 최신 데이터에서 시간 가져오기
         const firstCurrency = Object.keys(data)[0];
         if (data[firstCurrency] && data[firstCurrency].crawl_time) {
           this.lastUpdateTime = data[firstCurrency].crawl_time;
         }
        
      } catch (error) {
        console.error('환율 데이터를 가져오는 중 오류 발생:', error);
        this.error = '환율 데이터를 불러올 수 없습니다.';
      } finally {
        this.loading = false;
      }
    },
    
         formatRate(rate) {
       if (!rate) return '-';
       return rate.toString();
     },
     
     async fetchExchangeNews() {
       try {
         const response = await fetch('/api/exchange/news');
         if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
         }
         
         const data = await response.json();
         this.exchangeNews = data;
         
         if (data.length > 0) {
           this.newsUpdateTime = data[0].crawl_time;
         }
         
       } catch (error) {
         console.error('환율 뉴스를 가져오는 중 오류 발생:', error);
       }
     },
     
     formatNewsTime(timeString) {
       if (!timeString) return '';
       const date = new Date(timeString);
       return date.toLocaleString('ko-KR', {
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit'
       });
     },
     
     openNewsLink(link) {
       window.open(link, '_blank');
     },
    
    
    
    goForex() {
      window.location.href = '/rate-lookup';
    },
    
    onFeatureClick(feature) {
      if (feature === 'rate-lookup') {
        this.$router.push('/rate-lookup');
      }
      else if (feature === 'ForeignTransfer') {
        this.$router.push('/ForeignTransfer')
      }
      else {
        alert('준비중인 기능입니다: ' + feature);
      }
    },
    
    goAccount(){
      window.location.href = '#/Account';
    }
  },
};
</script>

<style scoped>
.home-system {
  font-family: 'Noto Sans KR', Arial, sans-serif;
  background: #f4f8fb;
  min-height: 100vh;
  width: 100%;
  min-width: 0;
}

.mainpage-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px 24px;
}

.mainpage-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;
}

.carousel-area {
  flex: 1;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(217, 18, 18, 0.06);
  padding: 40px 36px 36px 36px;
  min-width: 340px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.carousel-label {
  display: inline-block;
  background: #f4f8fb;
  color: #222;
  font-size: 1rem;
  border-radius: 8px;
  padding: 4px 16px;
  margin-bottom: 18px;
}

.carousel-title {
  font-size: 2.1rem;
  font-weight: bold;
  color: #111;
  margin-bottom: 18px;
  line-height: 1.3;
}

.carousel-desc {
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.carousel-btn {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.carousel-btn:hover {
  background: #009490;
}

.service-btn {
  width: 120px;
  height: 80px;
  border-radius: 16px;
  font-size: 1.3rem;
  font-weight: bold;
  border: none;
  background: #e0f7f4;
  color: #009490;
  box-shadow: 0 2px 8px rgba(0,148,144,0.08);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.service-btn.active, .service-btn:hover {
  background: #009490;
  color: #fff;
}

.mainpage-icon-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin: 50px auto 40px auto;
  max-width: 700px;
  justify-items: center;
}

.icon-menu-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 110px;
  border-radius: 16px;
  border: none;
  background: #e0f7f4;
  color: #009490;
  box-shadow: 0 2px 8px rgba(0,148,144,0.08);
  font-size: 1.08rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.icon-menu-btn .icon-img {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
}

.icon-menu-btn .icon {
  font-size: 2.1rem;
  margin-bottom: 10px;
}

.icon-menu-btn:hover {
  background: #009490;
  color: #fff;
}

/* 환율 정보와 뉴스 컨테이너 */
.exchange-news-container {
  margin-top: 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 환율 정보 섹션 스타일 */
.exchange-rate-section {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.section-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #111;
}

.last-update {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.forex-rate-container {
  max-height: 400px;
  overflow-y: auto;
}

.forex-rate-list {
  background: #fff;
}

.rate-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  align-items: center;
  padding: 16px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.rate-row:hover {
  background-color: #f8f9fa;
}

.rate-row + .rate-row {
  border-top: 1px solid #f0f0f0;
}



.flag {
  font-size: 1.7rem;
  margin-right: 8px;
  color: #111;
}

.pair {
  font-weight: 700;
  color: #111;
}

.rate {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}



/* 스크롤바 스타일링 */
.forex-rate-container::-webkit-scrollbar {
  width: 8px;
}

.forex-rate-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.forex-rate-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.forex-rate-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 환율 뉴스 섹션 스타일 */
.exchange-news-section {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.news-container {
  max-height: 400px;
  overflow-y: auto;
}

.news-list {
  background: #fff;
}

.news-item {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.news-item:hover {
  background-color: #f8f9fa;
}

.news-item:last-child {
  border-bottom: none;
}

.news-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-time {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

/* 뉴스 스크롤바 스타일링 */
.news-container::-webkit-scrollbar {
  width: 8px;
}

.news-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.news-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.news-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.bottom-menu-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  padding: 0 12px;
}

.bottom-menu-item:last-child {
  border-right: none;
}

.bottom-menu-item .title {
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.bottom-menu-item .desc {
  color: #888;
  font-size: 1rem;
}

@media (max-width: 900px) {
  .mainpage-top {
    flex-direction: column;
    gap: 18px;
  }
  
  .exchange-news-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .rate-row {
    grid-template-columns: 60px 1fr 100px;
    padding: 14px 16px;
    font-size: 0.95rem;
  }
  
  .section-header {
    padding: 20px 20px 12px 20px;
  }
  
  .section-header h2 {
    font-size: 1.2rem;
  }
  
  .bottom-menu-item {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 16px;
  }
  
  .bottom-menu-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 600px) {
  .exchange-news-container {
    gap: 12px;
  }
  
  .rate-row {
    grid-template-columns: 50px 1fr 80px;
    padding: 12px 12px;
    font-size: 0.9rem;
  }
  
  .flag {
    font-size: 1.4rem;
  }
  
  .section-header {
    padding: 16px 16px 10px 16px;
  }
  
  .news-item {
    padding: 12px 16px;
  }
  
  .news-title {
    font-size: 0.9rem;
  }
}
</style> 