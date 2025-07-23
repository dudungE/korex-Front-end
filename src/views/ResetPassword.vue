<template>
  <div class="app-container">
    <div class="logo-container">
      <router-link to="/" style="display: inline-block">
            <img src="@/assets/korex1.png" alt="로고" class="app-logo" />
        </router-link>
    </div>
    <main class="login-only-section">
      <div class="login-box with-divider">
        <div class="left-section">
          <h2 class="left-title">비밀번호 변경</h2>
          <p class="left-desc">이메일 인증 후<br>새 비밀번호를 입력하세요.</p>
        </div>

        <div class="divider"></div>

        <div class="right-section">
          <form @submit.prevent="handleSubmit">
            <div v-if="!emailVerified">
              <div class="input-with-button">
                <input type="email" v-model="email" class="input-field" placeholder="이메일 주소" required />
                <button type="button" class="input-btn" @click="sendVerificationCode">인증코드 전송</button>
              </div>
              <div class="input-with-button">
                <input type="text" v-model="verificationCode" class="input-field" placeholder="인증 코드 입력" required />
                <button type="button" class="input-btn" @click="verifyCode">인증 확인</button>
              </div>
            </div>

            <div v-else>
              <div class="input-wrapper">
                <input type="password" v-model="newPassword" class="combined-input" placeholder="새 비밀번호" required />
                <input type="password" v-model="confirmPassword" class="combined-input" placeholder="비밀번호 확인" required />
              </div>
              <button type="submit" class="btn-login">비밀번호 변경</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const codeSent = ref(false)
const emailVerified = ref(false)

const router = useRouter()

function sendVerificationCode() {
  message.info(`입력한 이메일로 인증코드가 전송되었습니다.`)
  codeSent.value = true
}

function verifyCode() {
  if (verificationCode.value === '123456') {
    message.success('이메일 인증이 완료되었습니다.')
    emailVerified.value = true
  } else {
    message.error('인증 코드가 올바르지 않습니다.')
  }
}

function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    message.warning('비밀번호가 일치하지 않습니다.')
    return
  }
  message.success('비밀번호가 변경되었습니다.')
  setTimeout(() => {
    router.push('/login')
  }, 1000)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans KR', sans-serif;
  align-items: center;
  padding-top: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.app-logo {
  width: 320px;
  height: auto;
}

.login-only-section {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-box.with-divider {
  display: flex;
  flex-direction: row;
  background-color: white;
  padding: 3rem 4rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  width: 100%;
  gap: 3rem;
  align-items: center;
}

.left-section {
  flex: 1;
  text-align: center;
  padding: 2rem;
}

.left-title {
  font-size: 1.75rem;
  font-weight: 800;
   color: #137c7c;
  margin-bottom: 1rem;
}

.left-desc {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
}

.divider {
  width: 1px;
  height: 300px;
  background-color: #e5e7eb;
}

.right-section {
  flex: 1;
  padding: 2rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.input-field {
  flex: 1;
  padding: 1rem;
   border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  font-size: 1rem;
}

.input-btn {
  width: 130px;
  background-color: #137c7c;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-btn:hover {
  background-color: #106060;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.combined-input {
  padding: 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  border-top: 1px solid #d1d5db;
}

.combined-input:first-child {
  border-top: none;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: bold;
  background-color: #137c7c;
  color: white;
  margin-bottom: 1rem;
  cursor: pointer;
}

.btn-login:hover {
  background-color: #106060;
}
</style>