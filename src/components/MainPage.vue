<template>
  <div class="home-system">
    <HeaderBar />
    <div class="mainpage-wrap">
      <div class="mainpage-top">
        <div class="carousel-area">
          <div class="carousel-label">이벤트</div>
          <div class="carousel-title">알람이 울리는 순간<br>돈기운이 터진다!</div>
          <div class="carousel-desc">놀이터랑 친구하고<br>도나와라 머니클락 굿즈 받기</div>
          <button class="carousel-btn">자세히보기</button>
        </div>
        <!-- 추가 슬라이드 필요시 여기에 -->
        
      </div>


      <div class="mainpage-icon-menu">
    
        <button class="icon-menu-btn" @click="onFeatureClick('forex')"><img src="@/assets/환율버튼.png" alt="환율조회" class="icon-img" /><span>환율조회</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('openbank')"><img src="@/assets/환전버튼.png" alt="환전" class="icon-img" /><span>환전</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('cert')"><img src="@/assets/친구송금버튼.png" alt="친구송금" class="icon-img" /><span>친구송금</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('cert')"><img src="@/assets/해외송금버튼.png" alt="해외송금" class="icon-img" /><span>해외송금</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('quick')"><img src="@/assets/계좌조회버튼.png" alt="계좌 조회" class="icon-img" /><span>계좌조회</span></button>
  
      </div>

      <!-- 환율 정보 리스트 -->
      <div class="forex-rate-list">
        <div
          v-for="item in forexRates"
          :key="item.pair"
          class="rate-row"
          :class="item.change > 0 ? 'up' : 'down'"
        >
          <span class="flag" aria-hidden="true">{{ item.flag }}</span>
          <span class="pair">{{ item.pair }}</span>
          <span class="rate">{{ item.rate.toLocaleString() }}</span>
          <span class="change">
            <span v-if="item.change > 0">▲</span>
            <span v-else>▼</span>
            {{ item.change }} ({{ item.percent }}%)
          </span>
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
      forexRates: [
        { flag: '🇺🇸', pair: 'USD/KRW', rate: 1380.10, change: -2.90, percent: -0.21 },
        { flag: '🇯🇵', pair: 'JPY/KRW', rate: 939.42, change: -5.12, percent: -0.54 },
        { flag: '🇪🇺', pair: 'EUR/KRW', rate: 1619.82, change: -0.23, percent: -0.01 },
        { flag: '🇬🇧', pair: 'GBP/KRW', rate: 1865.90, change: 0.09, percent: 0.00 }
      ]
    };
  },
  methods: {
    goForex() {
      window.location.href = '/forex';
    },
    onFeatureClick(feature) {
      if (feature === 'forex') {
        this.$router.push('/forex');
      } else {
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
  width: 100vw;
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
  margin: 40px auto 0 auto;
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

/* 환율 리스트 */
.forex-rate-list {
  margin-top: 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.rate-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 140px;
  align-items: center;
  padding: 14px 20px;
  font-size: 1.05rem;
  font-weight: 600;
}
.rate-row + .rate-row {
  border-top: 1px solid #f0f0f0;
}
.rate-row.up .change {
  color: #d60000;
}
.rate-row.down .change {
  color: #0066d6;
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
}
.change {
  text-align: right;
  font-variant-numeric: tabular-nums;
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


  .bottom-menu-item {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 16px;
  }
  .bottom-menu-item:last-child {
    border-bottom: none;
  }
}
</style> 