<script setup>
// 라우터 기반이므로 별도 import 불필요
import FooterBar from './components/FooterBar.vue'
import HeaderBar from './components/HeaderBar.vue'
</script>

<template>
  <div id = "app">
  <HeaderBar />
  <router-view />
  <FooterBar />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
