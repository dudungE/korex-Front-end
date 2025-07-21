<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    
    // 앱 시작 시 로그인 상태 복원
    authStore.restoreAuth()
    
    return {
      authStore
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
