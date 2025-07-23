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
        <a @click="goToAccount()" style="cursor: pointer">환율 조회</a>
        <a href="#">환전</a>
        <a href="#">송금</a>
        <a href="#">환율 조회</a>
        <a href="#">금융상품</a>
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
      showChatbotBubble: true
    }
  },
  methods: {
    goToAccount() {
      router.push('/Account')
    }
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