<template>
  <div id="app" class="app-container">
    <main class="login-only-section">
      <div class="logo-top">
        <router-link to="/" style="display: inline-block">
            <img src="@/assets/korex1.png" alt="로고" class="top-app-logo" />
        </router-link>
      </div>
      <div class="login-box with-divider">
        <div class="left-section">
          <div class="left-title">ID 찾기</div>
          <p class="left-desc">이메일 주소와 이름을 입력하시면<br />아이디를 확인하실 수 있습니다.</p>
        </div>
        <div class="divider"></div>
        <div class="right-section">
          <form @submit.prevent="handleSubmit">
            <div class="input-wrapper" v-if="!foundId">
              <input v-model="email" type="email" class="combined-input top" placeholder="이메일 주소 입력" required />
              <input v-model="name" type="text" class="combined-input bottom" placeholder="이름 입력" required />
            </div>

            <div v-if="foundId" class="result-message">
              고객님의 아이디는 <strong>{{ foundId }}</strong> 입니다.
            </div>

            <button type="submit" class="btn-login">
              {{ foundId ? '로그인' : '아이디 찾기' }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const name = ref('')
const foundId = ref('')
const router = useRouter()

function handleSubmit() {
  if (foundId.value) {
    router.push('/login')
    return
  }

  // 임시 테스트용 데이터
  const mockUser = { email: 'test@example.com', name: '홍길동', id: 'hong123' }

  if (email.value === mockUser.email && name.value === mockUser.name) {
    foundId.value = mockUser.id
  } else {
    foundId.value = '일치하는 정보가 없습니다.'
  }
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
  padding: 2rem;
}

.logo-top {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 7rem;
}

.logo-top img {
  height: 80px;
  object-fit: contain;
}

.login-only-section {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 1rem;
  color: #137c7c;
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

.input-wrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 2rem;
  margin-top: 1rem;
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
  padding: 0.85rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  background-color: #137c7c;
  color: white;
  margin-bottom: 1.5rem;
}

.result-message {
  margin-bottom: 1rem;
  text-align: center;
  color: #374151;
  font-size: 1rem;
}
</style>
