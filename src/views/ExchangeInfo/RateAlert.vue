<template>
  <div class="forex-alert-container">
    <!-- 왼쪽: 알림 등록 및 활성 알림 -->
    <div class="left-section">
      <div class="forex-alert-page">
        <h1 class="page-title">환율 알림 서비스</h1>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading">처리 중...</div>

        <!-- 알림 등록 폼 -->
        <section class="alert-form">
          <label>
            <span>통화 선택</span>
            <select v-model="newAlert.currencyCode">
              <option disabled value="">선택하세요</option>
              <option v-for="c in currencies" :key="c.code" :value="c.code">
                {{ c.label }}
              </option>
            </select>
          </label>

          <label>
            <span>목표 환율</span>
            <input 
              type="number" 
              v-model.number="newAlert.targetRate" 
              placeholder="예: 1300" 
              min="0" 
              step="0.01" 
            />
          </label>

          <label>
            <span>알림 조건</span>
            <select v-model="newAlert.condition">
              <option value="ABOVE">이상(≥)</option>
              <option value="BELOW">이하(≤)</option>
            </select>
          </label>

          <button class="hana-btn" @click="addAlert" :disabled="loading">
            {{ loading ? '등록 중...' : '알림 등록' }}
          </button>
        </section>

        <!-- 활성 알림 목록 -->
        <section class="alert-list" v-if="activeAlerts.length">
          <h2>활성 알림 목록</h2>
          <div class="alert-cards">
            <div v-for="alert in activeAlerts" :key="alert.id" class="alert-card active-card">
              <div class="alert-info">
                <h3>{{ getCurrencyLabel(alert.currencyCode) }}</h3>
                <p class="target-rate">{{ alert.targetRate.toLocaleString() }}원</p>
                <p class="condition">{{ alert.condition === 'ABOVE' ? '이상(≥)' : '이하(≤)' }}</p>
                <small class="created-date">{{ formatDate(alert.createdAt) }}</small>
              </div>
              <div class="alert-actions">
                <button 
                  class="deactivate-btn" 
                  @click="toggleAlert(alert.id, false)"
                  :disabled="loading"
                >
                  비활성화
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="no-alerts">
          활성 알림이 없습니다.
        </section>
      </div>
    </div>

    <!-- 오른쪽: 전체 알림 관리 -->
    <div class="right-section">
      <div class="alert-management">
        <h2 class="management-title">
          전체 알림 관리
          <button class="refresh-btn" @click="loadAllAlerts" :disabled="loading">
            🔄 새로고침
          </button>
        </h2>

        <!-- 필터 및 검색 -->
        <div class="filter-section">
          <select v-model="filter.status" @change="applyFilters">
            <option value="">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <select v-model="filter.currency" @change="applyFilters">
            <option value="">전체 통화</option>
            <option v-for="c in currencies" :key="c.code" :value="c.code">
              {{ c.label }}
            </option>
          </select>
        </div>

        <!-- 전체 알림 목록 -->
        <div class="all-alerts-list">
          <div v-if="filteredAlerts.length === 0" class="no-alerts">
            {{ allAlerts.length === 0 ? '등록된 알림이 없습니다.' : '조건에 맞는 알림이 없습니다.' }}
          </div>
          
          <div v-for="alert in filteredAlerts" :key="alert.id" 
               class="alert-item" 
               :class="{ 'inactive-alert': !alert.isActive }">
            
            <!-- 수정 모드가 아닐 때 -->
            <div v-if="editingAlert !== alert.id" class="alert-display">
              <div class="alert-header">
                <span class="currency-name">{{ getCurrencyLabel(alert.currencyCode) }}</span>
                <span class="alert-status" :class="alert.isActive ? 'status-active' : 'status-inactive'">
                  {{ alert.isActive ? '활성' : '비활성' }}
                </span>
              </div>
              
              <div class="alert-details">
                <div class="rate-info">
                  <span class="target-rate">{{ alert.targetRate.toLocaleString() }}원</span>
                  <span class="condition-badge" :class="alert.condition.toLowerCase()">
                    {{ alert.condition === 'ABOVE' ? '이상' : '이하' }}
                  </span>
                </div>
                <div class="alert-meta">
                  <small>등록: {{ formatDate(alert.createdAt) }}</small>
                  <small v-if="alert.updatedAt !== alert.createdAt">
                    수정: {{ formatDate(alert.updatedAt) }}
                  </small>
                </div>
              </div>

              <div class="alert-actions">
                <button 
                  class="toggle-btn" 
                  @click="toggleAlert(alert.id, !alert.isActive)"
                  :disabled="loading"
                  :class="alert.isActive ? 'deactivate' : 'activate'"
                >
                  {{ alert.isActive ? '비활성화' : '활성화' }}
                </button>
                <button 
                  class="edit-btn" 
                  @click="startEdit(alert)"
                  :disabled="loading"
                >
                  수정
                </button>
                <button 
                  class="delete-btn" 
                  @click="confirmDelete(alert.id)"
                  :disabled="loading"
                >
                  삭제
                </button>
              </div>
            </div>

            <!-- 수정 모드일 때 -->
            <div v-else class="alert-edit">
              <div class="edit-form">
                <div class="form-row">
                  <label>목표 환율:</label>
                  <input 
                    type="number" 
                    v-model.number="editForm.targetRate" 
                    min="0" 
                    step="0.01"
                    class="edit-input"
                  />
                </div>
                <div class="form-row">
                  <label>조건:</label>
                  <select v-model="editForm.condition" class="edit-select">
                    <option value="ABOVE">이상(≥)</option>
                    <option value="BELOW">이하(≤)</option>
                  </select>
                </div>
              </div>
              
              <div class="edit-actions">
                <button 
                  class="save-btn" 
                  @click="saveEdit(alert.id)"
                  :disabled="loading"
                >
                  저장
                </button>
                <button 
                  class="cancel-btn" 
                  @click="cancelEdit"
                  :disabled="loading"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 (선택사항) -->
        <div v-if="filteredAlerts.length > 10" class="pagination">
          <!-- 페이지네이션 로직은 필요에 따라 구현 -->
        </div>
      </div>
    </div>

    <!-- 에러/성공 메시지 -->
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message, Modal } from 'ant-design-vue'
import axios from 'axios' // axios import 추가

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const currencies = ref([
  { code: "USD", label: "미국 달러 (USD)" },
  { code: "EUR", label: "유로 (EUR)" },
  { code: "JPY", label: "일본 엔 (JPY)" },
  { code: "CNY", label: "중국 위안 (CNY)" },
])

const newAlert = reactive({
  currencyCode: "",
  targetRate: null,
  condition: "ABOVE",
})

const allAlerts = ref([])
const filteredAlerts = ref([])
const filter = reactive({
  status: '',
  currency: ''
})

const activeAlerts = computed(() => 
  allAlerts.value.filter(alert => alert.isActive)
)

const editingAlert = ref(null)
const editForm = reactive({
  targetRate: null,
  condition: 'ABOVE'
})

// 에러 메시지 처리 함수
const handleApiError = (error, context) => {
  console.error(`Error ${context}:`, error)
  
  if (error.response?.status === 401) {
    message.error('인증이 필요합니다. 다시 로그인해주세요.')
    router.push('/login')
    return
  }
  
  const errorMsg = error.response?.data?.message || `오류가 발생했습니다: ${context}`
  message.error(errorMsg)
}

// 전체 알림 목록 로드 - axios 사용으로 변경
const loadAllAlerts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/alerts/my/all')
    
    console.log('API Response:', response.data)
    
    // API 응답 구조에 따라 데이터 추출
    if (response.data.success) {
      allAlerts.value = response.data.data || []
    } else {
      allAlerts.value = []
      message.error(response.data.message || '알림 목록을 불러오는데 실패했습니다.')
    }
    
    applyFilters()
  } catch (error) {
    handleApiError(error, '알림 목록 로딩')
    allAlerts.value = []
    applyFilters()
  } finally {
    loading.value = false
  }
}

// 필터 적용
const applyFilters = () => {
  filteredAlerts.value = allAlerts.value.filter(alert => {
    const statusMatch = !filter.status ||
      (filter.status === 'active' && alert.isActive) ||
      (filter.status === 'inactive' && !alert.isActive)
    const currencyMatch = !filter.currency || alert.currencyCode === filter.currency
    return statusMatch && currencyMatch
  })
}

// 새 알림 추가 - axios 사용으로 변경
const addAlert = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    const response = await axios.post('/api/alerts/register', newAlert)
    
    if (response.data.success) {
      message.success('알림이 성공적으로 등록되었습니다.')
      resetForm()
      await loadAllAlerts()
    } else {
      message.error(response.data.message || '알림 등록에 실패했습니다.')
    }
  } catch (error) {
    handleApiError(error, '알림 등록')
  } finally {
    loading.value = false
  }
}

// 알림 활성화/비활성화 토글 - axios 사용으로 변경
const toggleAlert = async (alertId, isActive) => {
  try {
    loading.value = true
    const response = await axios.patch(`/api/alerts/${alertId}/toggle?isActive=${isActive}`)
    
    if (response.data.success) {
      message.success(isActive ? '알림이 활성화되었습니다.' : '알림이 비활성화되었습니다.')
      await loadAllAlerts()
    } else {
      message.error(response.data.message || '상태 변경에 실패했습니다.')
    }
  } catch (error) {
    handleApiError(error, '상태 변경')
  } finally {
    loading.value = false
  }
}

// 알림 삭제 - axios 사용으로 변경
const confirmDelete = (alertId) => {
  Modal.confirm({
    title: '정말로 삭제하시겠습니까?',
    content: '이 작업은 되돌릴 수 없습니다.',
    okText: '삭제',
    okType: 'danger',
    cancelText: '취소',
    onOk: async () => {
      try {
        loading.value = true
        const response = await axios.delete(`/api/alerts/${alertId}`)
        
        if (response.data.success) {
          message.success('알림이 성공적으로 삭제되었습니다.')
          await loadAllAlerts()
        } else {
          message.error(response.data.message || '알림 삭제에 실패했습니다.')
        }
      } catch (error) {
        handleApiError(error, '알림 삭제')
      } finally {
        loading.value = false
      }
    },
  })
}

// 수정 시작
const startEdit = (alert) => {
  editingAlert.value = alert.id
  editForm.targetRate = alert.targetRate
  editForm.condition = alert.condition
}

// 수정 저장 - axios 사용으로 변경
const saveEdit = async (alertId) => {
  if (editForm.targetRate === null || editForm.targetRate <= 0) {
    message.error('유효한 목표 환율을 입력해 주세요.')
    return
  }

  try {
    loading.value = true
    const response = await axios.put(`/api/alerts/${alertId}`, editForm)
    
    if (response.data.success) {
      message.success('알림이 성공적으로 수정되었습니다.')
      cancelEdit()
      await loadAllAlerts()
    } else {
      message.error(response.data.message || '알림 수정에 실패했습니다.')
    }
  } catch (error) {
    handleApiError(error, '알림 수정')
  } finally {
    loading.value = false
  }
}

// 수정 취소
const cancelEdit = () => {
  editingAlert.value = null
  editForm.targetRate = null
  editForm.condition = 'ABOVE'
}

// 폼 유효성 검사
const validateForm = () => {
  if (!newAlert.currencyCode) {
    message.error("통화를 선택해 주세요.")
    return false
  }
  if (newAlert.targetRate === null || newAlert.targetRate <= 0) {
    message.error("유효한 목표 환율을 입력해 주세요.")
    return false
  }
  return true
}

// 폼 초기화
const resetForm = () => {
  newAlert.currencyCode = ""
  newAlert.targetRate = null
  newAlert.condition = "ABOVE"
}

// 통화 레이블 가져오기
const getCurrencyLabel = (code) => {
  const cur = currencies.value.find((c) => c.code === code)
  return cur ? cur.label : code
}

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 성공 메시지 표시
const showSuccess = (msg) => {
  successMessage.value = msg
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 에러 메시지 표시
const showError = (msg) => {
  errorMessage.value = msg
  successMessage.value = ''
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  console.log('Component mounted, loading alerts...')
  await loadAllAlerts()
})
</script>




<style scoped>
.forex-alert-container {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 30px auto;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
}

/* 왼쪽 섹션 - 알림 등록 및 활성 알림 */
.left-section {
  flex: 1;
  min-width: 400px;
}

.forex-alert-page {
  background: #fff;
  border-radius: 18px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 132, 133, 0.12), 0 2px 6px rgba(0, 40, 70, 0.07);
  color: #222;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #008485;
  text-align: center;
  margin-bottom: 28px;
}

.loading {
  text-align: center;
  color: #008485;
  padding: 20px;
  font-weight: 600;
}

.alert-form label {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  font-weight: 600;
  color: #008485;
}

.alert-form select,
.alert-form input {
  padding: 8px 10px;
  font-size: 1em;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  margin-top: 6px;
  outline: none;
  transition: box-shadow 0.2s ease;
}

.alert-form select:focus,
.alert-form input:focus {
  border-color: #008485;
  box-shadow: 0 0 6px #45c8b2a9;
}

.hana-btn {
  width: 100%;
  padding: 14px 0;
  background: linear-gradient(90deg, #008485 60%, #00aba0 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.12em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 132, 133, 0.35);
  transition: background 0.3s ease;
  user-select: none;
}

.hana-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #00aba0 10%, #008485 90%);
}

.hana-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 활성 알림 카드 스타일 */
.alert-list {
  margin-top: 32px;
}

.alert-list h2 {
  color: #005750;
  font-weight: 700;
  margin-bottom: 18px;
  border-bottom: 2px solid #008485;
  padding-bottom: 8px;
  text-align: center;
}

.alert-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  background: linear-gradient(135deg, #e8f5f5 0%, #f0f9f9 100%);
  border: 1px solid #b2dfdb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-info h3 {
  color: #008485;
  margin: 0 0 8px 0;
  font-size: 1.1em;
}

.target-rate {
  font-size: 1.2em;
  font-weight: 700;
  color: #005750;
  margin: 4px 0;
}

.condition {
  color: #666;
  font-size: 0.9em;
  margin: 4px 0;
}

.created-date {
  color: #888;
  font-size: 0.8em;
}

.deactivate-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.25s ease;
}

.deactivate-btn:hover:not(:disabled) {
  background: #f57c00;
}

/* 오른쪽 섹션 - 전체 알림 관리 */
.right-section {
  flex: 1.2;
  min-width: 500px;
}

.alert-management {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 132, 133, 0.12), 0 2px 6px rgba(0, 40, 70, 0.07);
  color: #222;
  height: fit-content;
}

.management-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #005750;
  font-weight: 700;
  margin-bottom: 20px;
  border-bottom: 2px solid #008485;
  padding-bottom: 8px;
}

.refresh-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background 0.25s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #45a049;
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-section select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  flex: 1;
}

/* 전체 알림 목록 */
.all-alerts-list {
  max-height: 600px;
  overflow-y: auto;
}

.alert-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.3s ease;
}

.alert-item:hover {
  box-shadow: 0 2px 8px rgba(0, 132, 133, 0.15);
}

.inactive-alert {
  opacity: 0.7;
  background: #f8f8f8;
}

.alert-display {
  padding: 16px;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.currency-name {
  font-weight: 600;
  color: #008485;
  font-size: 1.1em;
}

.alert-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.status-active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #c62828;
}

.alert-details {
  margin-bottom: 12px;
}

.rate-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.target-rate {
  font-size: 1.2em;
  font-weight: 700;
  color: #005750;
}

.condition-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.condition-badge.above {
  background: #e3f2fd;
  color: #1976d2;
}

.condition-badge.below {
  background: #fff3e0;
  color: #f57c00;
}

.alert-meta {
  display: flex;
  gap: 12px;
}

.alert-meta small {
  color: #666;
}

.alert-actions {
  display: flex;
  gap: 8px;
}

.toggle-btn, .edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 600;
  transition: background 0.25s ease;
}

.toggle-btn.activate {
  background: #4caf50;
  color: white;
}

.toggle-btn.deactivate {
  background: #ff9800;
  color: white;
}

.edit-btn {
  background: #2196f3;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.toggle-btn:hover:not(:disabled),
.edit-btn:hover:not(:disabled),
.delete-btn:hover:not(:disabled) {
  opacity: 0.8;
}

/* 수정 폼 */
.alert-edit {
  padding: 16px;
  background: #f8f9fa;
}

.edit-form {
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.form-row label {
  width: 80px;
  font-weight: 600;
  color: #008485;
}

.edit-input, .edit-select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  background: #666;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.no-alerts {
  text-align: center;
  color: #666;
  padding: 40px 0;
  font-style: italic;
  font-weight: 500;
}

/* 메시지 스타일 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-message {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #f44336;
}

.success-message {
  background: #e8f5e8;
  color: #2e7d32;
  border-left: 4px solid #4caf50;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .forex-alert-container {
    flex-direction: column;
    gap: 16px;
    margin: 20px;
  }
  
  .left-section, .right-section {
    min-width: unset;
  }
  
  .alert-actions {
    flex-wrap: wrap;
  }
  
  .management-title {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
