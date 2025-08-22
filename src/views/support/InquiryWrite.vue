<template>
  <div class="inquiry-page">
    <div class="inquiry-wrap">
      <div class="inquiry-card">
        <div class="inquiry-header">
          <h2 class="inquiry-title">문의 글 작성</h2>
          <a-button @click="$emit('go-list')">목록</a-button>
        </div>

        <a-form
          ref="formRef"
          layout="vertical"
          :model="form"
          :rules="rules"
          @finish="handleSubmit"
        >
          <a-form-item name="category" label="카테고리" :rules="rules.category">
            <a-select v-model:value="form.category" placeholder="선택하세요">
              <a-select-option value="PAYMENT">결제</a-select-option>
              <a-select-option value="ACCOUNT">계좌</a-select-option>
              <a-select-option value="AUTH">계정/버그</a-select-option>
              <a-select-option value="ETC">기타</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item name="title" label="제목" :rules="rules.title">
            <a-input v-model:value="form.title" :maxlength="100" show-count placeholder="제목을 입력하세요" />
          </a-form-item>

          <a-form-item name="content" label="내용" :rules="rules.content">
            <a-textarea
              v-model:value="form.content"
              :rows="8"
              :maxlength="2000"
              show-count
              placeholder="문의 내용을 자세히 적어주세요."
            />
          </a-form-item>

          <a-space>
            <a-button class="inquiry-btn" @click="$emit('go-list')">취소</a-button>
            <a-button class="inquiry-btn" type="default" :loading="submitting" html-type="submit">등록</a-button>
          </a-space>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['go-list'])

const formRef = ref(null)
const submitting = ref(false)

const form = ref({
  category: null,
  title: '',
  content: '',
})

const rules = {
  category: [{ required: true, message: '카테고리를 선택하세요.' }],
  title: [
    { required: true, message: '제목을 입력하세요.' },
    { min: 2, max: 100, message: '제목은 2~100자입니다.' },
  ],
  content: [
    { required: true, message: '내용을 입력하세요.' },
    { min: 5, max: 2000, message: '내용은 5~2000자입니다.' },
  ],
}

async function handleSubmit() {
  submitting.value = true
  try {
    await axios.post('/api/inquiries/create', {
      category: form.value.category,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
    })

    alert('문의가 등록되었습니다.')
    emit('go-list')
  } catch (e) {
    console.error(e)
    alert('문의 등록에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.inquiry-page { 
    width: 100%; 
    background: transparent; 
}
.inquiry-wrap { 
    width: 100%; 
    padding: 0; 
    margin: 0; 
}
.inquiry-card {
  width: 60%; 
  margin: 20px auto;
  height: calc(100vh - 40px); 
  max-width: 900px; 
  min-width: 320px;
  display: flex;
  flex-direction: column; 
  background: #fff; 
  border-radius: 16px; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.06); 
  padding: 24px 24px 16px; 
  box-sizing: border-box;
}
.inquiry-header{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.inquiry-title{
  margin: 0;
  font-weight: 700;
  font-size: 20px;
  color: #101828;
}
.inquiry-btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  background: #e0f7f4;
  color: #009490;
  box-shadow: 0 2px 6px rgba(0,148,144,0.08);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.06s;
}
.inquiry-btn:hover { 
    background: #009490; 
    color: #fff; 
}
.inquiry-btn:active { 
    transform: translateY(1px); 
}
:deep(.main-content) { 
    padding: 0; 
    background: transparent; 
}
</style>
