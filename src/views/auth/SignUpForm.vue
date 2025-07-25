<template>
  <div id="app" class="app-container">
    <main class="login-only-section">
      <section class="login-section">
        <router-link to="/" style="display: inline-block">
          <img src="@/assets/korex1.png" alt="로고" class="app-logo" />
        </router-link>
        <div class="login-box large-box">
          <h2 class="login-title">회원가입</h2>

          <a-form
            ref="formRef"
            :model="signupForm"
            @finish="handleSignup"
            layout="vertical"
            :validate-trigger="['blur', 'submit']"
          >
            <a-form-item
              name="id"
              :rules="[
                { required: true, message: '아이디를 입력해주세요' },
                { min: 4, max: 20, message: '아이디는 4~20자여야 합니다' },
                { pattern: /^[a-zA-Z0-9]+$/, message: '영문과 숫자만 사용가능합니다' }
              ]"
            >
              <input v-model="signupForm.id" class="combined-input top" placeholder="아이디" />
            </a-form-item>

            <a-form-item
              name="password"
              :rules="[
                { required: true, message: '비밀번호를 입력해주세요' },
                { min: 6, max: 20, message: '비밀번호는 6~20자여야 합니다' }
              ]"
            >
              <input v-model="signupForm.password" type="password" class="combined-input" placeholder="비밀번호" />
            </a-form-item>

            <a-form-item
              name="confirmPassword"
              :rules="[
                { required: true, message: '비밀번호 확인을 입력해주세요' },
                { validator: validatePasswordMatch }
              ]"
            >
              <input v-model="signupForm.confirmPassword" type="password" class="combined-input" placeholder="비밀번호 확인" />
            </a-form-item>

            <a-form-item
              name="email"
              :rules="[
                { required: true, message: '이메일을 입력해주세요' },
                { type: 'email', message: '올바른 이메일 형식입니다' }
              ]"
            >
              <div class="input-with-button">
                <input v-model="signupForm.email" type="email" class="input-field" placeholder="이메일 주소" />
                <button type="button" class="input-btn" @click="sendEmailVerification">인증요청</button>
              </div>
            </a-form-item>

            <a-form-item
              name="emailCode"
              :rules="[ { required: true, message: '이메일 인증코드를 입력해주세요' } ]"
            >
              <div class="input-with-button">
                <input v-model="signupForm.emailCode" class="input-field" placeholder="이메일 인증 코드" />
                <button type="button" class="input-btn" @click="verifyEmailCode">인증 확인</button>
              </div>
            </a-form-item>

            <a-form-item
              name="name"
              :rules="[
                { required: true, message: '이름을 입력해주세요' },
                { min: 2, max: 10, message: '이름은 2~10자여야 합니다' }
              ]"
            >
              <input v-model="signupForm.name" class="combined-input" placeholder="이름" />
            </a-form-item>

            <a-form-item
              name="birthdate"
              :rules="[ { required: true, message: '생년월일을 입력해주세요' } ]"
            >
              <input v-model="signupForm.birthdate" class="combined-input bottom" placeholder="생년월일 8자리" />
            </a-form-item>

            <div class="terms-agree">
              <label>
                <input type="checkbox" v-model="termsAgreed" />
                [필수] 인증 약관 전체동의
              </label>
            </div>

            <a-form-item>
              <button type="submit" class="btn-login">가입하기</button>
            </a-form-item>
          </a-form>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const signupForm = ref({
  id: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
  name: '',
  birthdate: ''
})

const termsAgreed = ref(false)
const formRef = ref()
const emailVerified = ref(false)

function sendEmailVerification() {
  if (!signupForm.value.email) {
    message.warning('이메일을 먼저 입력해주세요.')
    return
  }
  // 실제 서버 연동 시 API 호출
  message.success(`인증 이메일이 전송되었습니다: ${signupForm.value.email}`)
  emailVerified.value = true
}

function verifyEmailCode() {
  if (signupForm.value.emailCode === '123456') {
    message.success('이메일 인증 완료')
    emailVerified.value = true
  } else {
    message.error('잘못된 인증 코드입니다.')
  }
}

const validatePasswordMatch = async (_rule, value) => {
  if (value !== signupForm.value.password) {
    return Promise.reject('비밀번호가 일치하지 않습니다.')
  }
  return Promise.resolve()
}

const handleSignup = async () => {
  if (!termsAgreed.value) {
    message.warning('약관에 동의해주세요.')
    return
  }
  if (!emailVerified.value) {
    message.warning('이메일 인증을 완료해주세요.')
    return
  }

  const payload = {
    loginId: signupForm.value.id,
    password: signupForm.value.password,
    nickname: signupForm.value.name,
    name: signupForm.value.name,
    email: signupForm.value.email
  }

  try {
    const success = await authStore.join(payload)
    if (success) {
      message.success('가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.')
      router.push('/login')
    }
  } catch (err) {
    message.error('회원가입 중 오류가 발생했습니다.')
  }
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