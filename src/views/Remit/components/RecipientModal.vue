<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h4>수취인 목록</h4>
      <ul>
        <li v-for="(rec, idx) in recipientList" :key="idx">
          <button type="button" @click="select(rec)">
            {{ rec.name }} - {{ rec.accountName }} - {{ rec.accountNumber }}
          </button>
        </li>
      </ul>
      <button class="btn-info" @click="close">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'

const emit = defineEmits(['close', 'select'])

const recipientList = ref([
  { name: '홍길동', accountName: '홍길동', accountNumber: '123-456-789', phone: '010-1234-5678', country: '대한민국', city: '서울', detailAddress: '강남구 삼성동' },
  { name: '김철수', accountName: '김철수', accountNumber: '234-567-890', phone: '010-9876-5432', country: '대한민국', city: '부산', detailAddress: '해운대구 우동' },
  { name: '이영희', accountName: '이영희', accountNumber: '345-678-901', phone: '010-1111-2222', country: '대한민국', city: '대구', detailAddress: '중구 동성로' },
])

function close() {
  emit('close')
}

function select(recipient) {
  emit('select', recipient)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-content li {
  margin-bottom: 10px;
}

.modal-content button {
  width: 100%;
  background: #009490;
  color: white;
  border: none;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #007c7a;
}

</style>
