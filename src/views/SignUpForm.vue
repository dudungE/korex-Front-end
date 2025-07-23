<template>
  <div id="app" class="app-container">
    <main class="login-only-section">
      <section class="login-section">
        <router-link to="/" style="display: inline-block">
            <img src="@/assets/korex1.png" alt="로고" class="app-logo" />
        </router-link>
        <div class="login-box large-box">
          <h2 class="login-title">회원가입</h2>
          <form @submit.prevent="register">
            <div class="input-wrapper">
                <input type="text" class="combined-input top" placeholder="아이디" v-model="id" required /><hr class="custom-divider" />
                <input type="password" class="combined-input" placeholder="비밀번호" v-model="password" required />
                <input type="password" class="combined-input" placeholder="비밀번호 확인" v-model="confirmPassword" required /><hr class="custom-divider" />
                <div class="input-with-button">
                    <input type="email" class="input-field" placeholder="이메일주소" v-model="email" required />
                    <button type="button" class="input-btn" @click="sendEmailVerification">인증요청</button>
                </div>
                <div class="input-with-button">
                    <input type="text" class="input-field" placeholder="이메일 인증 코드" v-model="emailCode" required />
                    <button type="button" class="input-btn" @click="verifyEmailCode">인증 확인</button>
                </div><hr class="custom-divider" />
                <input type="text" class="combined-input" placeholder="이름" v-model="name" required /><hr class="custom-divider" />
                <input type="text" class="combined-input bottom" placeholder="생년월일 8자리" v-model="birthdate" required />
            </div>
            <div class="terms-agree">
              <label>
                <input type="checkbox" v-model="termsAgreed" /> [필수] 인증 약관 전체동의
              </label>
            </div>
            <button type="submit" class="btn-login">가입하기</button>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const id = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const emailCode = ref('')
const name = ref('')
const birthdate = ref('')
const termsAgreed = ref(false)
const emailVerified = ref(false)
const router = useRouter()

function sendEmailVerification() {
  alert(`인증 이메일 전송: ${email.value}`)
  emailVerified.value = true
}

function register() {
  if (!emailVerified.value) {
    alert('이메일 인증을 완료해주세요.')
    return
  }
  if (!termsAgreed.value) {
    alert('약관에 동의해주세요.')
    return
  }
  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  alert(`회원가입 완료: \nID: ${id.value}\nEMAIL: ${email.value}`)
}
</script>

<style scoped>
body {
  font-family: 'Noto Sans KR', sans-serif;
}

.app-container {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans KR', sans-serif;
}

.login-only-section {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  padding: 2rem 0;
}

.login-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.app-logo {
  height: 60px;
  margin-bottom: 1.5rem;
}

.login-box {
  background-color: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 24rem;
}

.large-box {
  max-width: 30rem;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
}

.input-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.combined-input {
  width: 100%;
  padding: 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  box-sizing: border-box;
  display: block;
}

.combined-input::placeholder {
  color: #6b7280;
}

.custom-divider {
  border: none;
  border-top: 1px solid #d1d5db;
  margin: 0;
}

.email-verification {
  display: flex;
  align-items: stretch; /* 세로 높이 맞춤 */
  gap: 0.5rem;           /* 버튼과 input 사이 여백 */
}

.email-verification .combined-input {
  flex: 2;
}

.verify-btn {
  padding: 0.65rem 1.25rem;
  background-color: #137c7c;
  color: white;
  border: 1px solid #137c7c;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  height: 100%;
  flex: 1;
  box-sizing: border-box;
  transition: background-color 0.3s, color 0.3s;
}

.verify-btn:hover {
  background-color: #106060;
}

.input-with-button {
  display: flex;
  border-top: 1px solid #d1d5db;
  border-bottom: 1px solid #d1d5db;
}

.input-with-button:first-of-type {
  border-top: none;
}

.input-field {
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
  border: none;
  outline: none;
  box-sizing: border-box;
  border-right: 1px solid #d1d5db;
}

.input-btn {
  padding: 0 1rem;
  background-color: #137c7c;
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 0;
  width: 7rem;
}

.input-btn:hover {
  background-color: #106060;
}

.terms-agree {
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.btn-login {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  transition: background-color 0.3s;
  background-color: #137c7c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-login:hover {
  background-color: #106060;
}
</style>