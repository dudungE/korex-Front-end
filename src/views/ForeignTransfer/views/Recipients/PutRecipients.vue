<template>
  <section class="recipient-form">
    <h1>수정</h1>

    <form @submit.prevent="onSubmit">
      <!-- 1. 수취인 이름 입력 -->
      <div class="form-group">
        <label for="name">받는 분 이름</label>
        <input id="name" v-model.trim="form.name" type="text" placeholder="예: 홍길동" required />
      </div>

      <!-- 2. 수취인이 받는 통화 선택 -->
      <div class="form-group">
        <label for="selectedCurrency">송금할 통화</label>
        <select id="selectedCurrency" v-model="form.selectedCurrency" required>
          <option value="" disabled>통화를 선택하세요</option>
          <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- 3. 수취인 은행명 선택 -->
      <div class="form-group">
        <label for="bankName">받는 분 은행명</label>
        <select id="bankName" v-model="form.bankName" required>
          <option value="" disabled>은행을 선택하세요</option>
          <option v-for="b in bankOptions" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <!-- 4. 수취인 계좌번호 입력 -->
      <div class="form-group">
        <label for="accountNumber">받는 분 계좌번호</label>
        <input id="accountNumber" v-model.trim="form.accountNumber" type="text" placeholder="예: 123-456-789" required />
      </div>

      <!-- 5. 수취인 연락처 입력 -->
      <div class="form-group">
        <label for="phoneNumber">받는 분 연락처</label>

        <div style="display: flex; gap: 0.5rem;">
          <!-- 국가 선택 -->
          <select v-model="form.countryCode" required>
            <option value="" disabled>국가 선택</option>
            <option v-for="c in countryOptions" :key="c.code" :value="c.code">
              {{ c.flag }} {{ c.name }} ({{ c.phonePrefix }})
            </option>
          </select>

          <!-- 번호 입력 -->
          <input
              id="phoneNumber"
              v-model.trim="form.localPhoneNumber"
              type="tel"
              placeholder="예: 1012345678"
              required
              style="flex: 1"
          />
        </div>
      </div>

      <!-- 6. 수취인 이메일 주소 입력 -->
      <div class="form-group">
        <label for="email">받는 분 이메일 주소</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="example@domain.com" />
      </div>

      <!-- 7. 수취인 국가 (거주지) 선택 -->
      <div class="form-group">
        <label for="country" class="required">받는 분 거주지</label>
        <select id="country" v-model="form.country" required>
          <option value="" disabled>국가를 선택하세요</option>
          <option v-for="c in countryOptions" :key="c.code" :value="c.name">{{ c.flag }} {{ c.name }}</option>
        </select>
      </div>

      <!-- 8. 수취인 영문 주소 입력 -->
      <div class="form-group">
        <label for="eng_Address">받는 분 영문 주소</label>
        <textarea id="eng_Address" v-model.trim="form.eng_Address" rows="3" placeholder="예: 14, changkuengguro, jonglo" required></textarea>
      </div>

      <!-- 버튼 -->
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? '수정 중...' : '등록' }}</button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">수취인이 수정되었습니다.</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  selectedCurrency: '',
  bankName: '',
  accountNumber: '',
  countryCode: '',         // 국가 코드
  localPhoneNumber: '',    // 현지 번호
  email: '',
  country: '',
  eng_Address: '',
})

const currencyOptions = ['USD', 'EUR', 'JPY', 'KRW']
const bankOptions = ['KOREX']
const countryOptions = [
  { code: 'US', name: 'USA', flag: '🇺🇸', phonePrefix: '+1' },
  { code: 'JP', name: 'JAPAN', flag: '🇯🇵', phonePrefix: '+81' },
  { code: 'KR', name: 'KOREA', flag: '🇰🇷', phonePrefix: '+82' }
]

const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)

// onSubmit 안에서 서버 전송용으로 합치기
async function onSubmit() {
  error.value = ''
  success.value = false
  isSubmitting.value = true

  // 국가 코드 + 현지 번호 합치기
  const country = countryOptions.find(c => c.code === form.countryCode)
  const fullPhoneNumber = country ? `${country.phonePrefix}${form.localPhoneNumber}` : form.localPhoneNumber

  const payload = {
    ...form,
    phoneNumber: fullPhoneNumber, // 서버에 보내는 실제 번호
  }

  try {
    const res = await fetch('/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    if (!res.ok) throw new Error('등록 실패')
    success.value = true
    setTimeout(() => router.push('/recipients'), 800)
  } catch (e) {
    error.value = e?.message || '오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.recipient-form {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.recipient-form h1 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #008681;
  text-align: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #333;
}
input, select, textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
}
input:focus, select:focus, textarea:focus {
  border-color: #00908C;
  outline: none;
}
textarea {
  resize: none;
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
button {
  background: #009b99;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}
button:hover {
  background: #008681;
}
.error-message {
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}
.success-message {
  color: #00908C;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}
</style>