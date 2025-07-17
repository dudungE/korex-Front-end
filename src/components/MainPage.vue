<template>
  <div class="home-system">
    <HeaderBar />
    <div class="home-content">
      <h1>환영합니다!</h1>
      <p class="subtitle">하나은행 외환 서비스 메인페이지입니다.</p>
      <button class="go-forex" @click="goForex">외환 서비스 바로가기</button>
    </div>
  </div>
</template>

<script>
import HeaderBar from './HeaderBar.vue';
export default {
  name: 'Home',
  components: { HeaderBar },
  methods: {
    goForex() {
      // 실제 라우터가 있다면 router.push 사용, 없으면 location.href
      window.location.href = '/forex';
    },
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
.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
}
.home-content h1 {
  font-size: 3rem;
  color: #009490;
  margin-bottom: 16px;
}
.subtitle {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 32px;
}
.go-forex {
  background: #009490;
  color: #fff;
  border: none;
  padding: 16px 40px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.go-forex:hover {
  background: #007c7a;
}
</style> 