<template>
  <div class="inquiry-page">
    <div class="inquiry-wrap">
      <div class="inquiry-card">
        <div class="inquiry-header">
          <h3>1:1 문의</h3>
          <a-button type="primary" @click="$emit('open-write')">문의하기</a-button>
        </div>

        <a-table
          :loading="loading"
          :columns="columns"
          :data-source="rows"
          :row-key="rowKey"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <a-typography-link @click.stop="openDetail(record.id)">
                {{ record.title }}
              </a-typography-link>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>

  <a-modal
    v-model:open="detailOpen"
    title="문의 내용"
    :footer="null"
    @cancel="closeDetail"
    :destroyOnClose="true"
    :maskClosable="true"
    :centered="true"
    :width="680"
    wrapClassName="inquiry-detail-modal"
  >
    <a-skeleton :loading="detailLoading" active :paragraph="{ rows: 6 }">
      <div v-if="detail" class="detail-container">
        <div class="detail-head">
          <div class="title-row">
            <span class="detail-title">{{ detail.title }}</span>
            <a-tag class="detail-status" :color="statusColor(detail.status)">
              {{ statusLabel(detail.status) }}
            </a-tag>
          </div>
          <div class="meta-row">
            <CalendarOutlined />
            <span class="meta-date">{{ formatDate(detail.createdAt) }}</span>
            <a-divider type="vertical" />
            <span class="meta-id">#{{ detail.id }}</span>
          </div>
        </div>

        <a-divider class="detail-divider" />

        <div class="detail-content">{{ detail.content }}</div>
      </div>
    </a-skeleton>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { CalendarOutlined } from '@ant-design/icons-vue'

defineEmits(['open-write'])

const columns = [
  { title: '번호', dataIndex: 'id', key: 'id', width: 100 },
  { title: '제목', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '상태', dataIndex: 'status', key: 'status', width: 120 },
  { title: '등록일', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
]

const loading = ref(false)
const rows = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `총 ${total}건`,
})

const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

const rowKey = (record) => record.id

function statusColor(s) {
  if (s === 'ANSWERED') return 'success'
  if (s === 'IN_PROGRESS') return 'processing'
  return 'default'
}
function statusLabel(s) {
  if (s === 'ANSWERED') return '답변완료'
  if (s === 'IN_PROGRESS') return '처리중'
  return '접수'
}
function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function fetchData() {
  loading.value = true
  try {
    const res = await axios.get('/api/inquiries/list', {
      params: {
        page: pagination.value.current - 1,
        size: pagination.value.pageSize,
        sort: 'createdAt,desc'
      },
    })
    const content = res.data?.content ?? []
    const total   = res.data?.totalElements ?? content.length

    rows.value = content.map((it) => ({
      id: it.id,
      title: it.title,
      status: it.status,
      createdAt: formatDate(it.createdAt),
    }))
    pagination.value = { ...pagination.value, total }
  } catch (e) {
    console.error(e)
    alert('문의 목록을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag) {
  pagination.value = { ...pagination.value, current: pag.current, pageSize: pag.pageSize }
  fetchData()
}

async function openDetail(id) {
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const { data } = await axios.get(`/api/inquiries/${id}`)
    detail.value = data
  } catch (e) {
    console.error(e)
    alert('문의 상세를 불러오지 못했습니다.')
    detailOpen.value = false
  } finally {
    detailLoading.value = false
  }
}
function closeDetail() {
  detailOpen.value = false
  detail.value = null
}

onMounted(fetchData)
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
  width: 100%;
  max-width: none;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 24px 24px 16px;
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
:global(.inquiry-detail-modal .ant-modal-content){ 
  border-radius: 18px; 
}
:global(.inquiry-detail-modal .ant-modal-header){ 
  border-bottom: none; 
  padding-bottom: 0; 
}
:global(.inquiry-detail-modal .ant-modal-body){
  height: 60vh;
  overflow-y: auto;
  padding: 16px 20px;
}
.detail-title { 
  font-weight:700; 
  font-size:18px; 
  color:#101828; }
.title-row { 
  display:flex; 
  align-items:center; 
  gap:8px; 
}
.meta-row { 
  color:#667085; 
  margin-top:4px; 
}
.meta-id { 
  font-variant-numeric: tabular-nums;
 }
.detail-divider { 
  margin:12px 0; 
}
.detail-content { 
  white-space:pre-wrap; 
  word-break:break-word; 
  line-height:1.7; 
  color:#344054; 
}

@media (max-width: 768px) {
  :global(.inquiry-detail-modal .ant-modal-body){ 
    height: 70vh;
   }
}
</style>
