<template>
  <div class="admin-dashboard">
    <div class="page-head">
      <div class="title-wrap">
        <h2 class="title">Admin Dashboard</h2>
        <a-segmented
          v-model:value="quickRange"
          :options="quickRanges"
          size="small"
          @change="onQuickRangeChange"
        />
        <a-range-picker
          v-model:value="dateRange"
          :presets="presets"
          :allowClear="false"
          @change="fetchAll"
        />
      </div>
      <a-space>
        <a-button @click="refresh" :loading="loadingAll" icon="⟳">새로고침</a-button>
      </a-space>
    </div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="k in kpis" :key="k.key">
        <a-card :loading="loading.metrics" class="kpi-card">
          <div class="kpi-head">
            <span class="kpi-label">{{ k.label }}</span>
            <a-tag :color="k.color">{{ k.tag }}</a-tag>
          </div>
          <div class="kpi-body">
            <a-statistic :value="metrics[k.key] ?? 0" :precision="k.precision || 0" />
            <div class="kpi-trend">
              <Sparkline :points="k.spark" />
              <span :class="['delta', k.delta >= 0 ? 'up' : 'down']">
                <template v-if="k.delta >= 0">▲</template>
                <template v-else>▼</template>
                {{ Math.abs(k.delta).toFixed(1) }}%
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="bottom-row">
      <a-col :xs="24" :md="12">
        <a-card :loading="loading.restricted" title="제한 계정 (최신)">
          <a-table
            size="small"
            :columns="restrictedCols"
            :data-source="restrictedRows"
            :pagination="{ pageSize: 5 }"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key==='reason'">
                <a-tag :color="record.reason==='FAILED_LOGIN_THRESHOLD' ? 'error' : 'warning'">
                  {{ reasonLabel(record.reason) }}
                </a-tag>
              </template>
              <template v-else-if="column.key==='action'">
                <a-space>
                  <a-button size="small" @click="$emit('open-user', record)">보기</a-button>
                  <a-button size="small" type="primary" @click="$emit('lift-restrict', record)">해제</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
        <a-card :loading="loading.audit" title="최근 관리자 활동">
          <a-table
            size="small"
            :columns="auditCols"
            :data-source="auditRows"
            :pagination="{ pageSize: 5 }"
            row-key="id"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'

/*****************
 * Filters & Dates
 *****************/
const today = dayjs()
const dateRange = ref([today.add(-6,'day'), today]) // 기본: 최근 7일
const quickRanges = [
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '90일', value: '90d' },
]
const quickRange = ref('7d')
const presets = [
  { label: '최근 7일', value: [dayjs().add(-6,'day'), dayjs()] },
  { label: '이번 달', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
]

function onQuickRangeChange(v){
  const map = { '7d': 6, '30d': 29, '90d': 89 }
  const end = dayjs()
  const start = end.add(-(map[v]||6), 'day')
  dateRange.value = [start, end]
  fetchAll()
}

/*****************
 * KPI & Trend
 *****************/
const loading = reactive({ metrics:false, restricted:false, audit:false })
const loadingAll = computed(()=> Object.values(loading).some(Boolean))

const metrics = reactive({
  newUsersToday: 0,
  activeUsers: 0,
  restrictedUsers: 0,
  pendingExchanges: 0,
  pendingRemittances: 0,
})

const kpis = computed(()=>[
  { key:'newUsersToday', label:'오늘 가입', color:'processing', tag:'Users', delta: deltas.value.newUsersToday, spark: trends.value.newUsersToday },
  { key:'activeUsers', label:'활성 사용자', color:'blue', tag:'Active', delta: deltas.value.activeUsers, spark: trends.value.activeUsers },
  { key:'restrictedUsers', label:'제한 계정', color:'error', tag:'Restricted', delta: deltas.value.restrictedUsers, spark: trends.value.restrictedUsers },
  { key:'pendingExchanges', label:'미처리 환전', color:'warning', tag:'Exchanges', delta: deltas.value.pendingExchanges, spark: trends.value.pendingExchanges },
  { key:'pendingRemittances', label:'미처리 송금', color:'warning', tag:'Remittances', delta: deltas.value.pendingRemittances, spark: trends.value.pendingRemittances },
])

const trends = ref({ newUsersToday:[], activeUsers:[], restrictedUsers:[], pendingExchanges:[], pendingRemittances:[] })
const deltas = ref({ newUsersToday:0, activeUsers:0, restrictedUsers:0, pendingExchanges:0, pendingRemittances:0 })

/*****************
 * Tables
 *****************/
const restrictedCols = [
  { title:'사용자', dataIndex:'email', key:'email' },
  { title:'사유', key:'reason' },
  { title:'일시', dataIndex:'at', key:'at', width: 160 },
  { title:'액션', key:'action', width: 140 },
]
const restrictedRows = ref([])

const auditCols = [
  { title:'관리자', dataIndex:'admin', key:'admin', width: 120 },
  { title:'행동', dataIndex:'action', key:'action' },
  { title:'일시', dataIndex:'at', key:'at', width: 160 },
]
const auditRows = ref([])

/*****************
 * Fetchers
 *****************/
function paramsWithRange(){
  const [s,e] = dateRange.value
  return {
    start: s.startOf('day').toISOString(),
    end: e.endOf('day').toISOString(),
  }
}

async function fetchMetrics(){
  loading.metrics = true
  try{
    const { data } = await axios.get('/api/admin/metrics', { params: paramsWithRange() })
    Object.assign(metrics, data.metrics || {})
    trends.value = data.trends || trends.value
    deltas.value = data.deltas || deltas.value
  }finally{ loading.metrics = false }
}

async function fetchRestricted(){
  loading.restricted = true
  try{
    const { data } = await axios.get('/api/admin/restricted-latest', { params: { page:0, size:5 } })
    restrictedRows.value = (data.content||[]).map(r=>({
      id: r.id,
      email: r.email,
      reason: r.reason,
      at: formatDate(r.restrictedAt)
    }))
  }finally{ loading.restricted = false }
}

async function fetchAudit(){
  loading.audit = true
  try{
    const { data } = await axios.get('/api/admin/audit-latest', { params: { page:0, size:5 } })
    auditRows.value = (data.content||[]).map(a=>({ id:a.id, admin:a.admin, action:a.action, at: formatDate(a.at) }))
  }finally{ loading.audit = false }
}

async function fetchAll(){
  await Promise.all([fetchMetrics(), fetchRestricted(), fetchAudit()])
}

function refresh(){ fetchAll() }

/*****************
 * Utils
 *****************/
function formatDate(iso){
  if(!iso) return '-'
  const d = dayjs(iso)
  return d.format('YYYY-MM-DD HH:mm')
}
function formatAmount(v){
  if (v==null) return '-'
  return new Intl.NumberFormat().format(v)
}
function reasonLabel(r){
  if (r==='FAILED_LOGIN_THRESHOLD') return '5회 비밀번호 오류'
  if (r==='EMAIL_UNVERIFIED') return '이메일 미인증'
  return r || '-'
}

/*****************
 * Lifecycle
 *****************/
onMounted(fetchAll)
watch(dateRange, (v,ov)=>{ if(v!==ov) fetchAll() })

/*****************
 * Components: Sparkline
 *****************/
const propsSpark = defineProps({})
</script>

<script>
// Option API sub-component for simplicity
export default {
  components: {
    Sparkline: {
      name: 'Sparkline',
      props: {
        points: { type: Array, default: () => [] },
        width: { type: Number, default: 300 },
        height: { type: Number, default: 60 },
        stroke: { type: String, default: '#1677ff' },
        fill: { type: String, default: 'rgba(22,119,255,0.08)' },
        strokeWidth: { type: Number, default: 1.5 },
      },
      computed: {
        pathData(){
          const pts = this.points.length ? this.points : [0]
          const w = this.width
          const h = this.height
          const max = Math.max(...pts)
          const min = Math.min(...pts)
          const span = Math.max(1, max - min)
          const stepX = pts.length > 1 ? w/(pts.length-1) : w
          const toY = (v)=> h - ((v - min) / span) * (h - 6) - 3
          const toX = (i)=> i*stepX
          let d = ''
          pts.forEach((v,i)=>{
            const x = toX(i); const y = toY(v)
            d += (i===0?`M ${x},${y}`:` L ${x},${y}`)
          })
          return d
        },
        fillData(){
          if (!this.points.length) return ''
          const w = this.width, h = this.height
          return `${this.pathData} L ${w},${h} L 0,${h} Z`
        }
      },
      template: `
        <svg :width="width" :height="height" viewBox="0 0 300 60" preserveAspectRatio="none" class="sparkline">
          <path :d="fillData" :fill="fill" stroke="none" />
          <path :d="pathData" :stroke="stroke" :stroke-width="strokeWidth" fill="none"/>
        </svg>
      `
    }
  }
}
</script>

<style scoped>
.admin-dashboard { padding: 16px; }
.page-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
.title-wrap { display:flex; align-items:center; gap:12px; }
.title { margin:0; font-size:20px; font-weight:700; }

.kpi-row { margin-bottom: 12px; }
.kpi-card { border-radius: 14px; }
.kpi-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
.kpi-label { color:#475467; font-size:13px; }
.kpi-body { display:flex; align-items:flex-end; justify-content:space-between; gap:8px; }
.kpi-trend { display:flex; align-items:center; gap:8px; }
.sparkline { width: 120px; height: 40px; }
.delta { font-variant-numeric: tabular-nums; font-size: 12px; }
.delta.up { color: #0ea5e9; }
.delta.down { color: #ef4444; }

.middle-row, .bottom-row { margin-top: 12px; }
</style>