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

      <div class="mainpage-service-btns">
            <button class="service-btn active">계좌</button>
            <button class="service-btn">환전</button>
          </div>

      <div class="mainpage-icon-menu">
    
        <button class="icon-menu-btn" @click="onFeatureClick('forex')"><span class="icon">💱</span><span>환율 조회</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('openbank')"><span class="icon">🏦</span><span>외화 송금</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('cert')"><span class="icon">🔐</span><span>인증센터</span></button>
        <button class="icon-menu-btn" @click="onFeatureClick('quick')"><span class="icon">⚡</span><span>빠른조회</span></button>
  
      </div>
      <div class="mainpage-bottom-menu">
        <div class="bottom-menu-item"><div class="title">예적금</div><div class="desc">부자되는 알짜정보</div></div>
        <div class="bottom-menu-item"><div class="title">펀드</div><div class="desc">한 눈에 보는 펀드랭킹</div></div>
        <div class="bottom-menu-item"><div class="title">환전지갑</div><div class="desc">알뜰하게 환전하기</div></div>
        <div class="bottom-menu-item"><div class="title">퇴직연금</div><div class="desc">든든한 노후를 위해</div></div>
        <div class="bottom-menu-item"><div class="title">대출</div><div class="desc">3분이면 한도조회 OK!</div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
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
  margin-top: 32px;
  gap: 32px;
}
.carousel-area {
  flex: 1;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
.mainpage-service-btns {
  display: flex;
  flex-direction: row;
  gap: 18px;
  margin-top: 32px;
  justify-content: flex-start;
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
  background: #fff;
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 24px 0 16px 0;
  width: 120px;
  height: 110px;
  font-size: 1.08rem;
  color: #222;
  font-weight: 500;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
}
.icon-menu-btn .icon {
  font-size: 2.1rem;
  margin-bottom: 10px;
}
.icon-menu-btn:hover {
  background: #e0f7f4;
  color: #009490;
  box-shadow: 0 4px 16px rgba(0, 148, 144, 0.13);
}
.mainpage-bottom-menu {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: #f5f7fa;
  border-radius: 18px;
  margin-top: 48px;
  padding: 32px 24px;
  gap: 12px;
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
  .mainpage-service-btns {
    flex-direction: row;
    margin-left: 0;
    margin-top: 18px;
    gap: 12px;
    justify-content: center;
  }
  .mainpage-bottom-menu {
    flex-direction: column;
    gap: 18px;
    padding: 24px 8px;
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