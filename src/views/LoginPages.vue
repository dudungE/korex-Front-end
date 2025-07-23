<template>
  <div id="app" class="app-container">
    <div class="top-logo-wrapper"> 
        <router-link to="/" style="display: inline-block">
            <img src="@/assets/korex1.png" alt="로고" class="top-app-logo" />
        </router-link>
    </div>
    <main class="login-only-section">
      <div class="login-box with-divider">
        <div class="left-section">
          <h2 class="login-text">LOGIN</h2>
          <p class="left-desc">
            아이디/비밀번호를 통해<br />인터넷뱅킹에 로그인합니다.
          </p>
        </div>
        <div class="divider"></div>
        <div class="right-section">
          <form @submit.prevent="login">
            <div class="input-wrapper">
              <input v-model="id" type="text" class="combined-input top" placeholder="아이디 입력" required />
              <input v-model="password" type="password" class="combined-input bottom" placeholder="비밀번호 입력" required />
            </div>
            <button type="submit" class="btn-login">로그인</button>
            <p class="login-warning">이용자 비밀번호 5회 연속 오류 시</p>
            <p class="login-info">이용자 아이디/비밀번호 로그인 이용이 제한됩니다.</p>
            <div class="login-links">
              <router-link to="/find-id" class="login-link">아이디 찾기</router-link>
              <span>〉</span>
              <router-link to="/reset-password" class="login-link">비밀번호 변경</router-link>
              <span>〉</span>
              <router-link to="/sign-up" class="login-link">회원가입</router-link>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const id = ref('')
const password = ref('')

function login() {
  alert(`ID: ${id.value}\nPASSWORD: ${password.value}`)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans KR', sans-serif;
}

.top-logo-wrapper {
  margin-top: 1.5rem;
  margin-bottom: 10rem;
  display: flex;
  justify-content: center;
}

.top-app-logo {
  width: 200px;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.login-only-section {
  display: flex;
  justify-content: center;
  align-items: start;
  flex: 1;
  width: 100%;
}

.login-box.with-divider {
  display: flex;
  flex-direction: row;
  background-color: white;
  padding: 2rem 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  max-width: 880px;
  width: 100%;
  gap: 2rem;
  align-items: center;
}

.left-section,
.right-section {
  flex: 1;
  max-width: 100%;
}

.left-section {
  text-align: center;
}

.login-text {
  font-size: 2rem;
  font-weight: 800;
   color: #137c7c;
  margin-bottom: 1rem;
}

.left-desc {
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.5;
}

.divider {
  width: 1px;
  height: 220px;
  background-color: #e5e7eb;
}

.right-section {
  flex: 1;
}

.input-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.combined-input {
  padding: 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.combined-input + .combined-input {
  border-top: 1px solid #d1d5db;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: bold;
  background-color: #137c7c;
  color: white;
  margin-bottom: 1.25rem;
}

.login-warning {
  color: #d97706;
  font-weight: bold;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 0.25rem;
}

.login-info {
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.login-links {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.login-link {
  text-decoration: none;
  color: #137c7c;
}
</style>