<template>
  <div class="calendar-container">
    <h2 class="calendar-title">캘린더</h2>
    <a-calendar @select="onSelect" />
    <div class="selected-date" v-if="selectedDate">
      {{ selectedDate.format('YYYY-MM-DD') }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'

const selectedDate = ref(null)

const onSelect = (date) => {
  selectedDate.value = date
  console.log('선택한 날짜:', date.format('YYYY-MM-DD'))
}
</script>

<style scoped>
.calendar-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.calendar-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.selected-date {
  margin-top: 16px;
  font-size: 16px;
  color: #555;
}
</style>
