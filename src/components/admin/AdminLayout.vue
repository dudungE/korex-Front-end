<template>
  <a-layout class="admin-layout">
    <a-layout-sider collapsible v-model:collapsed="collapsed" width="220">
      <div class="logo" @click="go('/admin/dashboard')">
        <span class="logo-text">Admin</span>
      </div>
      <a-menu
        mode="inline"
        :selectedKeys="[activeKey]"
        :items="menuItems"
        @click="onMenuClick"
      />
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="topbar">
        <div class="left">
          <a-breadcrumb :items="breadcrumb" />
        </div>
        <div class="right">
          <a-divider type="vertical" />
          <a-dropdown>
            <a-avatar style="cursor:pointer">A</a-avatar>
            <template #overlay>
              <a-menu @click="onUserMenu">
                <a-menu-item key="logout">로그아웃</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PieChartOutlined,
  UserOutlined,
  MessageOutlined,
  DollarCircleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const q = ref('')

/** 사이드바 메뉴 */
const menuItems = [
  { key: '/admin/dashboard', label: '대시보드', icon: () => h(PieChartOutlined) },
  { key: '/admin/users', label: '회원 관리', icon: () => h(UserOutlined) },
  { key: '/admin/inquiries', label: '문의 관리', icon: () => h(MessageOutlined) },
  { key: '/admin/remittances', label: '송금 관리', icon: () => h(DollarCircleOutlined) },
  { key: '/admin/settings', label: '설정', icon: () => h(SettingOutlined) },
]

/** 현재 활성 메뉴 키(경로 기준) */
const activeKey = computed(() => {
  // /admin/xxx 형태의 첫 두 세그먼트를 맞춤
  const path = route.path
  // 등록된 key 중 가장 길게 매칭되는 것 선택
  const keys = menuItems.filter(i => i.key).map(i => i.key)
  const found = keys
    .filter(k => path.startsWith(k))
    .sort((a,b) => b.length - a.length)[0]
  return found || '/admin/dashboard'
})

/** 빵부스러기 */
const breadcrumb = computed(() => {
  const segs = route.path.replace(/^\/+/, '').split('/')
  const acc = []
  const items = []
  segs.forEach(s => {
    acc.push(s)
    items.push({ title: s })
  })
  return items.length ? items : [{ title: 'admin' }, { title: 'dashboard' }]
})

function onMenuClick({ key }) {
  if (key) router.push(key)
}
function go(path) { router.push(path) }

function onSearch(val) {
  if (!val) return
  message.info(`"${val}" 검색 (추후 전역 검색 연동)`)
}
function onUserMenu({ key }) {
  if (key === 'logout') {
    // TODO: 로그아웃 로직
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout { min-height: 100vh; }

.logo { 
  height: 56px; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  cursor: pointer; 
  background: #000;  
}
.logo-text { 
  font-weight: 800; 
  color: #fff;        
  letter-spacing: .5px; 
}

:deep(.ant-layout-sider) {
  background: #fff; 
  border-right: 1px solid #f0f0f0;
}

:deep(.ant-menu) {
  background: transparent; 
  color: #000;
  font-weight: 500;
}
:deep(.ant-menu-item) {
  color: #000 !important;
}
:deep(.ant-menu-item-selected) {
  background-color: #1890ff !important; 
  color: #fff !important;
  border-radius: 6px;
  margin: 4px 8px;
}

.topbar {
  height: 56px; 
  display:flex; 
  align-items:center; 
  justify-content:space-between;
  padding: 0 16px; 
  background: #fff; 
  border-bottom: 1px solid #f0f0f0;
}
.topbar .right { 
  display:flex; 
  align-items:center; 
  gap: 8px; 
}

.content { 
  padding: 16px; 
  background: #f6f7fb; 
  min-height: calc(100vh - 56px); 
}
</style>

