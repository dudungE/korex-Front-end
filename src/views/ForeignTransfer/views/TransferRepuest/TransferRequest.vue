<template>
  <div class="remit-step-page">
    <h1 class="page-title">해외 송금 신청</h1>

    <div class="step-indicators">
      <div
          v-for="step in 6"
          :key="step"
          :class="{ 'step-item': true, active: currentStep === step, completed: currentStep > step }"
          @click="setCurrentStep(step)"
      >
        <span>{{ step }}. {{ stepNames[step - 1] }}</span>
      </div>
    </div>

    <div class="step-content">
      <!-- STEP1 약관 -->
      <TermsAgree
          v-if="currentStep === 1"
          ref="termsAgreeComponent"
          :agree1="agree1"
          :agree2="agree2"
          :agree3="agree3"
          @update:agree1="agree1 = $event"
          @update:agree2="agree2 = $event"
          @update:agree3="agree3 = $event"
      />

      <!-- STEP2 송금정보 -->
      <RemitInfo
          v-if="currentStep === 2"
          ref="remitInfoComponent"
          :krwAccountsProp="krwAccounts"
          :fxAccountsProp="fxAccounts"
          :krwBanksProp="krwBanks"
          :fxBanksProp="fxBanks"
          :userId="userId"
          v-model:isValid="isStep2Valid"
      />

      <!-- STEP3 출금정보 -->
      <WithdrawInfo
          v-if="currentStep === 3"
          ref="withdrawInfoComponent"
          :krwAccountsProp="krwAccounts"
          :fxAccountsProp="fxAccounts"
          :krwBanksProp="krwBanks"
          :fxBanksProp="fxBanks"
          :userId="userId"
          v-model:isValid="isStep3Valid"
      />

      <!-- STEP4~STEP6은 프론트 상태 관리만 -->
    </div>

    <section class="navigation-section">
      <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="prev-button"
      >이전</button>

      <button
          v-if="currentStep < 6"
          :disabled="!canGoNextStep"
          @click="goNextStep"
          class="next-button"
      >다음</button>

      <button
          v-if="currentStep === 6"
          @click="finishSteps"
          class="submit-button"
      >완료</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TermsAgree from '@/views/ForeignTransfer/components/TransferRequest/TermsAgree.vue'
import RemitInfo from '@/views/ForeignTransfer/components/TransferRequest/RemitInfo.vue'
import WithdrawInfo from '@/views/ForeignTransfer/components/TransferRequest/WithdrawInfo.vue'

// STEP 관리
const currentStep = ref(1)
const stepNames = ['약관동의', '송금정보', '출금정보', '수취인 정보', '확인', '완료']

// STEP1 약관
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)
const termsAgreeComponent = ref(null)

// STEP2 송금정보
const isStep2Valid = ref(false)
const remitInfoComponent = ref(null)

// STEP3 출금정보
const isStep3Valid = ref(false)
const withdrawInfoComponent = ref(null)

// 계좌/은행 목록 (실제 데이터 연결 필요)
const userId = ref(123)
const krwAccounts = ref([])
const fxAccounts = ref([])
const krwBanks = ref([])
const fxBanks = ref([])

// STEP 이동
function prevStep() { if(currentStep.value > 1) currentStep.value-- }
function setCurrentStep(step) { currentStep.value = step }

function goNextStep() {
  if (currentStep.value === 1 && termsAgreeComponent.value) {
    termsAgreeComponent.value.agreeTerms().then(success => {
      if(success) currentStep.value++
    })
  } else if (currentStep.value === 2 && isStep2Valid.value) {
    remitInfoComponent.value.saveSenderDataLocal()
    currentStep.value++
  } else if (currentStep.value === 3 && isStep3Valid.value) {
    withdrawInfoComponent.value.saveSenderDataLocal()
    currentStep.value++
  } else if (currentStep.value > 3) {
    currentStep.value++
  }
}

// 다음 버튼 활성 조건
const canGoNextStep = computed(() => {
  if(currentStep.value === 1){
    const local = termsAgreeComponent.value?.localAgree ?? [false,false,false]
    return local[0] && local[1]
  }
  if(currentStep.value === 2) return isStep2Valid.value
  if(currentStep.value === 3) return isStep3Valid.value
  return true
})

// 완료 버튼 클릭
function finishSteps() {
  alert('프론트 상태 완료! (백엔드 호출 없음)')
}
</script>

<style scoped>
/* 스타일은 기존 코드와 동일하게 사용 */
.remit-step-page { max-width: 850px; margin: 0 auto; padding: 1rem; font-family: 'Pretendard Variable', sans-serif; color: #333; }
.page-title { font-size: 28px; font-weight: 700; color: #008681; text-align: center; margin-top: 10px; margin-bottom: 30px; }
.step-indicators { display: flex; justify-content: space-around; margin-bottom: 30px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.step-item { flex: 1; padding: 15px 10px; text-align: center; font-size: 16px; font-weight: 600; color: #888; cursor: pointer; transition: all 0.3s ease; position: relative; }
.step-item:not(:last-child)::after { content: '>'; position: absolute; right: -5px; top: 50%; transform: translateY(-50%); color: #ccc; font-weight: bold; }
.step-item.active { color: #008681; background-color: #E6F5F4; }
.step-item.completed { color: #008681; font-weight: 700; }
.step-item.active::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background-color: #008681; }
.step-content { padding: 15px 15px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
.navigation-section { margin-top: 30px; text-align: center; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
.navigation-section button { padding: 12px 25px; font-size: 17px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s ease, box-shadow 0.2s ease; min-width: 120px; }
.navigation-section .prev-button { background-color: #e0e0e0; color: #555; }
.navigation-section .prev-button:hover { background-color: #d0d0d0; }
.navigation-section .next-button { background-color: #009b99; color: #ffffff; }
.navigation-section .next-button:hover { background-color: #008681; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.navigation-section button:disabled { background-color: #cccccc; color: #999999; cursor: not-allowed; box-shadow: none; }
</style>