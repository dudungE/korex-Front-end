<!-- TabNav.vue -->
<template>
    <div class="tabs">
      <button :class="{ active: current === 'rateLookup' }" @click="goTab('rateLookup')">환율조회</button>
      <button :class="{ active: current === 'rateChart' }" @click="goTab('rateChart')">환율차트</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TabNav',
    props: {
      current: {
        type: String,
        required: true
      }
    },
    methods: {
      goTab(tab) {
        if (tab === 'rateLookup') this.$router.push('/rate-lookup');
        else if (tab === 'rateChart') this.$router.push('/rate-chart');
      }
    }
  }
  </script>
  
  <style scoped>
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
  }
  .tabs button {
    background: #f2f8f7;
    border: none;
    padding: 14px 24px;
    border-radius: 20px;
    color: #009490;
    font-weight: 500;
    cursor: pointer;
    transition: 0.2s;
    font-size: 18px;      /* 글자 크기 키우기 */
    min-width: 120px;     /* 최소 버튼 너비 설정 */
    height: 44px;         /* 버튼 높이 지정 */
    display: flex;
    justify-content: center;  /* 가로 중앙 정렬 */
    align-items: center;      /* 세로 중앙 정렬 */
  }
  .tabs button.active,
  .tabs button:hover {
    background: #009490;
    color: #fff;
  }
  </style>
  