<template>
  <div class="content-section search-box">
    <div class="page-header">
      <h1 class="page-title">해외송금</h1>
      <div class="step-indicator">
        <span class="step">01</span>
        <span class="step">02</span>
        <span class="step active">03</span>
      </div>
    </div>

    <h2 class="section-title">송금 완료</h2>
    <p>송금이 정상적으로 완료되었습니다.</p>

    <div class="btn-group">
      <button class="btn-primary" @click="startNew">새 송금 신청</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function startNew() {
  router.push({ name: 'International' })
}
</script>