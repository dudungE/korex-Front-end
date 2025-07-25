<template>
  <header class="header-bar">
    <div class="header-top">
      <nav class="header-links">
        <a href="#">기업뱅킹</a>
        <a href="#">하나카드</a>
        <a href="#">은행소개</a>
        <a href="#">채용안내</a>
      </nav>
      <div class="header-actions">
        <a href="#">로그인</a>
        <a href="#">인증센터</a>
        <span class="lang">Language ▼</span>
      </div>
    </div>
    <div class="header-main">
      <router-link to="/">
        <img src="@/assets/korex1.png" alt="KOSA FOREX" class="logo" />
      </router-link>
      
      <nav class="main-menu">


        <div class="dropdown" @mouseenter="rateMenu=true" @mouseleave="rateMenu=false">
          <a @click="goToAccount()" class="dropdown-toggle" style="cursor: pointer">환율조회</a>
          <ul class="dropdown-menu" v-show="rateMenu">
            <li class="section-title" @click="goToAccount()">일별환율조회</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">환율그래프</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율알림')">환율알림</li>
          </ul>

        </div>
        <div class="dropdown" @mouseenter="exchangeMenu=true" @mouseleave="exchangeMenu=false">
          <a @click="alert('준비중인 기능입니다: 환율그래프')" class="dropdown-toggle" style="cursor: pointer">환전</a>
          <ul class="dropdown-menu" v-show="exchangeMenu">
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">환전</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">환전목록조회</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율알림')">예약환전</li>
          </ul>
        </div>

      
        <div class="dropdown" @mouseenter="friendMenu=true" @mouseleave="friendMenu=false">
          <a @click="alert('준비중인 기능입니다: 환율그래프')" class="dropdown-toggle" style="cursor: pointer">친구송금</a>
          <ul class="dropdown-menu" v-show="friendMenu">
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">친구송금</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">친구송금</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율알림')">친구송금</li>
          </ul>
        </div>

        <div class="dropdown" @mouseenter="foreignMenu=true" @mouseleave="foreignMenu=false">
          <a @click="goToOverseasRemittance" class="dropdown-toggle" style="cursor: pointer">해외송금</a>
          <ul class="dropdown-menu" v-show="foreignMenu">
            <li class="section-title" @click="goToOverseasRemittance">해외송금</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">해외송금</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율알림')">해외송금</li>
          </ul>
        </div>

        <div class="dropdown" @mouseenter="accountMenu=true" @mouseleave="accountMenu=false">
          <a @click="alert('준비중인 기능입니다: 환율그래프')" class="dropdown-toggle" style="cursor: pointer">계좌조회</a>
          <ul class="dropdown-menu" v-show="accountMenu">
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">계좌조회</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율그래프')">계좌조회</li>
            <li class="section-title" @click="alert('준비중인 기능입니다: 환율알림')">계좌조회</li>
          </ul>
        </div>
        


      </nav>

      <div class="header-icons">
        <span class="icon chat" title="챗봇">💬</span>
        <span class="icon search" title="검색">🔍</span>
        <span class="icon menu" title="메뉴">☰</span>
      </div>
      <div v-if="showChatbotBubble" class="chatbot-bubble">
        KOSA 챗봇에게 물어보세요~
        <button class="close-btn" @click="showChatbotBubble = false" aria-label="닫기">×</button>
      </div>
    </div>
  </header>
</template>

<script>
import router from '../router/index';

export default {
  name: 'HeaderBar',
  data() {
    return {
      showChatbotBubble: true,
      rateMenu: false,
      exchangeMenu: false,
      friendMenu: false,
      foreignMenu: false,
      accountMenu: false
    };
  },
  methods: {
    goToAccount() {
      router.push('/Account')
    },
    goToOverseasRemittance() {
      router.push('/OverseasRemittance')
    },

  }
};
</script>

<style scoped>
.header-bar {
  background: #fff;
  border-bottom: 2px solid #009490;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 48px 0 48px;
  font-size: 0.8rem;
  color: #444;
}
.header-links a {
  margin-right: 18px;
  color: #444;
  text-decoration: none;
}
.header-links a:last-child {
  margin-right: 0;
}
.header-actions a {
  margin-left: 18px;
  color: #444;
  text-decoration: none;
}
.header-actions .lang {
  margin-left: 18px;
  color: #444;
  cursor: pointer;
}
.header-main {
  display: flex;
  align-items: center;
  padding: 10px 48px 10px 48px;
  position: relative;
}
.logo {
  height: 50px;
  margin-right: 48px;
}
.main-menu {
  display: flex;
  gap: 48px;
  flex: 1;
}
.main-menu a {
  color: #444;
  font-size: 1.3rem;
  text-decoration: none;
  font-weight: 400;
  letter-spacing: 0.01em;
}
.main-menu a:hover {
  color: #009490;
}
/* 드롭다운 스타일 */

.dropdown {
  position: relative;
  /* display: inline-block; */
  /* padding-top: 20px; */
  /* padding-bottom: 20px; */
  display: flex;
  align-items: center;
  height: 100%; /* 추가: 메뉴 높이 채우기 */
  cursor: pointer;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  height: 100%; /* 추가: 내부 <a> 높이 채우기 */
  padding: 20px 0; /* 필요 시 제거 가능 */
}


.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  /* min-width 조정 및 부모에 딱 붙도록 */
  margin: 0;
  padding: 6px 0;
  background: #fff;
  border: 1px solid #009490;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 50;
}

.section-title {
  font-weight: 500;
  color: #000000;
  padding: 8px 14px;
}
.dropdown-menu { list-style: none; }
.dropdown-menu li { padding: 8px 12px; font-size: 0.95rem; cursor: pointer; white-space: nowrap; list-style: none; }
.dropdown-menu li:hover { background: #f8f8f8; }

.header-icons {
  display: flex;
  gap: 18px;
  font-size: 1.5rem;
  margin-left: 24px;
}
.header-icons .icon {
  cursor: pointer;
}
.chatbot-bubble {
  position: absolute;
  right: 0;
  top: 60px;
  background: #fff;
  border: 1.5px solid #009490;
  border-radius: 24px;
  padding: 6px 18px;
  color: #009490;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}
 .close-btn {
   background: none;
   border: none;
   color: #009490;
   font-size: 1.2rem;
   margin-left: 8px;
   cursor: pointer;
   padding: 0 4px;
   line-height: 1;
 }
</style> 