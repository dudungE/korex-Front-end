<template>
  <a-layout class="mypage-layout">
    <!-- 사이드바 -->
    <a-layout-sider width="200" class="sidebar" breakpoint="lg" collapsed-width="0">
      <div class="sidebar-title">마이페이지</div>
      <a-menu
        mode="inline"
        :selected-keys="[activeSection]"
        @click="({ key }) => setSection(key)"
        style="height: 100%; border-right: 0"
      >
        <a-menu-item key="info">개인정보</a-menu-item>
        <a-menu-item key="exchange">환전내역</a-menu-item>
        <a-menu-item key="remittance">송금내역</a-menu-item>
        <a-menu-item key="inquiry">1:1 문의</a-menu-item>
        <a-menu-item key="calendar">캘린더</a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 메인 콘텐츠 -->
    <a-layout-content class="main-content">
       <keep-alive>
        <component
          :is="activeComponent"
          @open-write="() => setSection('inquiry:new')"
          @go-list="() => setSection('inquiry')"
        />
      </keep-alive>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'

import MyInfo from './mypage/MyInfo.vue'
import ExchangeHistory from './mypage/ExchangeHistory.vue'
import RemittanceHistory from './mypage/RemittanceHistory.vue'
import InquiryList from './mypage/InquiryList.vue'
import InquiryWrite from './mypage/InquiryWrite.vue' 
import CalendarView from './mypage/CalendarView.vue'

const activeSection = ref('info')

const componentsMap = {
  info: markRaw(MyInfo),
  exchange: markRaw(ExchangeHistory),
  remittance: markRaw(RemittanceHistory),
  inquiry: markRaw(InquiryList),       // 목록
  'inquiry:new': markRaw(InquiryWrite),// 작성
  calendar: markRaw(CalendarView),
}

const activeComponent = computed(() => componentsMap[activeSection.value])

function setSection(section) {
  activeSection.value = section === 'inquiry' ? 'inquiry' : section
}

const selectedKeys = computed(() => {
  if (activeSection.value.startsWith('inquiry')) return ['inquiry']
  return [activeSection.value]
})
</script>

<style scoped>
.mypage-layout {
  min-height: 85vh;
  background: #fff;
}

.sidebar {
  background: #f0f2f5;
}

.sidebar-title {
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #137c7c;
  text-align: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.main-content {
  padding: 24px;
  background: #fff;
  min-height: 100%;
}
</style>
