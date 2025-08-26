<template>
  <div class="inquiry-page">
    <div class="inquiry-header">
      <h2>문의 관리</h2>
      <a-checkbox v-model:checked="showUnansweredOnly" >
        답변 미작성
      </a-checkbox>
    </div>

    <a-table
      :columns="columns"
      :data-source="inquiries"
      row-key="id"
      :loading="loading"
      bordered
      :scroll="{ x: 800 }"
    >
      <template #bodyCell="{ column, record, index }">
        <span v-if="column.dataIndex === 'no'">
          {{ index + 1 }}
        </span>
        <span v-else-if="column.dataIndex === 'action'">
          <template v-if="record.status === 'REGISTERED'">
            <a-button
              type="primary"
              size="small"
              @click="openAnswerModal(record)"
            >
              답변 작성
            </a-button>
          </template>
          <template v-else-if="record.status === 'ANSWERED'">
            작성완료
          </template>
          <template v-else-if="record.status === 'WITHDRAW'">
            철회됨
          </template>
        </span>
        <span v-else>
          {{ record[column.dataIndex] }}
        </span>
      </template>
    </a-table>

    <!-- 답변 모달 -->
    <a-modal
      v-model:open="answerModalVisible"
      title="답변 작성"
      @ok="submitAnswer"
      :confirm-loading="modalLoading"
    >
      <ATextarea
        :rows="4"
        placeholder="답변을 입력하세요"
        v-model:value="answerContent"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'

const loading = ref(false)
const inquiries = ref([])

const answerModalVisible = ref(false)
const modalLoading = ref(false)
const currentInquiry = ref(null)
const answerContent = ref('')
const showUnansweredOnly = ref(false)

// 컬럼 정의
const columns = [
  { title: 'NO', dataIndex: 'no', key: 'no' },
  { title: '작성자', dataIndex: 'userName', key: 'userName' },
  { title: '카테고리', dataIndex: 'category', key: 'category' },
  { title: '제목', dataIndex: 'title', key: 'title' },
  { title: '상태', dataIndex: 'status', key: 'status' },
  { title: '작성일', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '답변', dataIndex: 'action', key: 'action' },
]

// 데이터 조회
async function fetchInquiries() {
  loading.value = true
  try {
    const url = showUnansweredOnly.value
      ? '/api/admin/inquiries/filter'
      : '/api/admin/inquiries'
    const res = await axios.get(url)
    inquiries.value = res.data
  } catch (err) {
    message.error('문의 정보를 불러오는데 실패했습니다.')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 체크박스 상태 변경 시 자동 호출
watch(showUnansweredOnly, () => {
  fetchInquiries()
})

// 답변 작성 모달
function openAnswerModal(inquiry) {
  currentInquiry.value = inquiry
  answerContent.value = ''
  answerModalVisible.value = true
}

// 답변 제출
async function submitAnswer() {
  if (!currentInquiry.value || !currentInquiry.value.id) {
    message.warning('답변할 문의를 선택해주세요.')
    return
  }

  if (!answerContent.value) {
    message.warning('답변 내용을 입력해주세요.')
    return
  }

  modalLoading.value = true
  try {
    await axios.post(`/api/admin/inquiries/${currentInquiry.value.id}/answer`, {
      content: answerContent.value,
    })
    message.success('답변이 등록되었습니다.')
    currentInquiry.value.status = 'ANSWERED'
    answerModalVisible.value = false
  } catch (err) {
    message.error('답변 등록 실패')
    console.error(err)
  } finally {
    modalLoading.value = false
  }
}

// 초기 로드
onMounted(() => {
  fetchInquiries()
})
</script>

<style scoped>
.inquiry-page {
  padding: 16px;
  background-color: #f6f7fb;
}

.inquiry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
