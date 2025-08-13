<template>
  <div class="app-container">
    <div class="logo-top">
      <router-link to="/" style="display: inline-block">
        <img src="@/assets/korex1.png" alt="로고" class="top-app-logo" />
      </router-link>
    </div>

    <main class="login-only-section">
      <div class="login-box with-divider">
        <div class="left-section">
          <h2 class="left-title">비밀번호 변경</h2>
          <p class="left-desc">이메일 인증 후<br />새 비밀번호를 입력하세요.</p>
        </div>

        <div class="divider"></div>

        <div class="right-section">
          <a-form @finish="handleSubmit" :model="form" ref="formRef" autocomplete="off">
            <div v-if="!emailVerified">
              <div class="input-with-button">
                <input type="email" v-model="form.email" class="input-field" placeholder="이메일 주소" required />
                <button type="button" class="input-btn" :disabled="sending || !isEmailValid || cooldown > 0" @click="onSendCode">
                  <span v-if="cooldown === 0">인증코드 전송</span>
                  <span v-else>{{ cooldown }}초</span>
                </button>
              </div>

              <div class="input-with-button">
                <input type="text" v-model="form.verificationCode" class="input-field" placeholder="인증 코드 입력(6자리)" maxlength="6" required />
                <button type="button" class="input-btn" :disabled="verifying || !canVerify" @click="onVerifyCode">인증 확인</button>
              </div>
            </div>

            <div v-else>
              <a-form-item name="password" :rules="[{ required: true, message: '비밀번호를 입력해주세요' }, { min: 8, max: 64, message: '비밀번호는 8~64자여야 합니다' } ]">
                <a-input-password v-model:value="form.password" placeholder="새 비밀번호" />
              </a-form-item>

              <a-form-item name="confirm" :rules="[{ required: true, message: '비밀번호 확인을 입력해주세요' }, { validator: validateConfirmPassword } ]">
                <a-input-password v-model:value="form.confirm" placeholder="비밀번호 확인" />
              </a-form-item>

              <button type="submit" class="btn-login" :disabled="submitting">{{ submitting ? '변경 중...' : '비밀번호 변경' }}</button>
            </div>
          </a-form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth' // ✅ 스토어 사용

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const emailVerified = ref(false)

const form = ref({ email: '', verificationCode: '', password: '', confirm: '' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isEmailValid = computed(() => EMAIL_RE.test(form.value.email || ''))
const canVerify = computed(() => isEmailValid.value && /^\d{6}$/.test(form.value.verificationCode || ''))

const sending = ref(false)
const verifying = ref(false)
const submitting = ref(false)

const cooldown = ref(0)
let timer = null
onUnmounted(() => { if (timer) clearInterval(timer) })
function startCooldown(sec = 60) {
  cooldown.value = sec
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) { clearInterval(timer); timer = null }
  }, 1000)
}

async function onSendCode() {
  if (!isEmailValid.value) { message.warning('유효한 이메일을 입력해주세요.'); return }
  sending.value = true
  try {
    const ok = await auth.sendVerificationCode(form.value.email, 'RESET_PASSWORD')
    if (ok) startCooldown(60)
  } finally { sending.value = false }
}

async function onVerifyCode() {
  if (!canVerify.value) { message.warning('이메일과 6자리 인증코드를 정확히 입력하세요.'); return }
  verifying.value = true
  try {
    const ok = await auth.verifyEmailCode({ email: form.value.email, code: form.value.verificationCode, purpose: 'RESET_PASSWORD' })
    if (ok) emailVerified.value = true
  } finally { verifying.value = false }
}

function validateConfirmPassword(_, value) {
  if (!value || value === form.value.password) return Promise.resolve()
  return Promise.reject('비밀번호가 일치하지 않습니다.')
}

async function handleSubmit() {
  try { await formRef.value?.validate() } catch { return }
  if (!emailVerified.value) { message.warning('이메일 인증을 먼저 완료해주세요.'); return }
  submitting.value = true
  try {
    const ok = await auth.resetPassword(form.value.email, form.value.verificationCode, form.value.password)
    if (ok) setTimeout(() => router.push('/login'), 800)
  } finally { submitting.value = false }
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

.logo-top {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 7rem;
}

.top-app-logo {
  height: 80px;
  object-fit: contain;
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

.input-with-button { display: flex; gap: 8px; margin-bottom: 12px; }
.input-field { flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; }
.input-btn { padding: 10px 12px; border-radius: 8px; border: none; background: #1677ff; color: #fff; cursor: pointer; }
.input-btn:disabled { background: #bfbfbf; cursor: not-allowed; }
.btn-login { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #1677ff; color:#fff; }
</style>