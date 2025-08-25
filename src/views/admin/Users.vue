<template>
  <div class="user-page">
    <h2>회원 관리</h2>
    <a-table
      :columns="columns"
      :data-source="filteredUsers"
      row-key="id"
      :loading="loading"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <span v-if="column.dataIndex === 'email'" class="masked-text">
          {{ maskEmail(record.email) }}
        </span>
        <span v-else-if="column.dataIndex === 'phone'" class="masked-text">
          {{ maskPhone(record.phone) }}
        </span>
        <span v-else-if="column.dataIndex === 'action'">
          <a-button
            v-if="record.status === '제한'"
            type="primary"
            danger
            size="small"
            @click="unlockAccount(record)"
          >
            해제
          </a-button>
        </span>
        <span v-else>{{ record[column.dataIndex] }}</span>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import axios from 'axios'

const loading = ref(false)
const users = ref([])

// 컬럼 정의
const columns = [
  { title: 'NO', key: 'index', customRender: ({ index }) => index + 1 },
  { title: 'name', dataIndex: 'name', key: 'name' },
  { title: 'Login ID', dataIndex: 'loginId', key: 'loginId' },
  { title: 'e-mail', dataIndex: 'email', key: 'email' },
  { title: 'phone', dataIndex: 'phone', key: 'phone' },
  { title: 'birth', dataIndex: 'birth', key: 'birth' },
  { title: 'status', dataIndex: 'status', key: 'status' },
  { title: '상태 변경', dataIndex: 'action', key: 'action' },
]

// 마스킹 함수
function maskEmail(email) {
  if (!email) return ''
  const [id, domain] = email.split('@')
  return id[0] + '*'.repeat(Math.max(0, id.length - 1)) + '@' + domain
}
function maskPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// role USER만 필터링
const filteredUsers = computed(() =>
  users.value.filter(u => !u.role || u.role === 'ROLE_USER')
)

// user 조회
async function fetchUsers() {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/users')
    users.value = res.data
  } catch (err) {
    message.error('회원 정보를 불러오는 데 실패했습니다.')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 계정 잠금 해제
async function unlockAccount(user) {
  Modal.confirm({
    title: '계정 잠금 해제',
    content: `${user.loginId} 계정을 잠금 해제하시겠습니까?`,
    async onOk() {
      try {
        await axios.post(`/api/admin/${user.loginId}/unlock`)
        message.success('계정이 잠금 해제되었습니다.')
        user.status = '활성'
      } catch (err) {
        message.error('잠금 해제 실패')
        console.error(err)
      }
    }
  })
}

// 초기 로드
onMounted(fetchUsers)
</script>

<style scoped>
.user-page {
  padding: 16px;
  background-color: #f6f7fb;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
.user-table-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.restricted-btn {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

.restricted-label {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}
:deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px;
}
:deep(.ant-table-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #475467;
}

.masked-text {
  letter-spacing: 0.5px;
  color: #6b7280;
  font-family: monospace;
}
</style>

