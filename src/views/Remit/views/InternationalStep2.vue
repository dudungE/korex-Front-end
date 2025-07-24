<template>
  <div class="content-section search-box">
    <div class="page-header">
      <h1 class="page-title">해외송금</h1>
      <div class="step-indicator">
        <span class="step">01</span>
        <span class="step active">02</span>
        <span class="step">03</span>
      </div>
    </div>

    <h3 class="section-title">입력값 확인</h3>

    <SenderInfoConfirm :data="formData.remittanceInfo" />
    <RemittanceInfoConfirm :data="formData.remittanceDetails" />
    <RecipientInfoConfirm :data="formData.remittanceInfo" />

    <div class="btn-group" style="margin-top: 20px;">
      <button class="btn-secondary" @click="goBack">이전</button>
      <button class="btn-primary" @click="confirm">확인 및 제출</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import SenderInfoConfirm from '@/views/Remit/components/SenderInfoConfirm.vue'
import RemittanceInfoConfirm from '@/views/Remit/components/RemittanceInfoConfirm.vue'
import RecipientInfoConfirm from '@/views/Remit/components/RecipientInfoConfirm.vue'

const router = useRouter()
const route = useRoute()

// params 혹은 state 로 받은 formData
const formData = reactive(route.params.formData || {})

function goBack() {
  router.back()
}
function confirm() {
  // 실제 송금 처리 후 STEP3 이동
  router.push({ name: 'InternationalStep3' })
}
</script>
