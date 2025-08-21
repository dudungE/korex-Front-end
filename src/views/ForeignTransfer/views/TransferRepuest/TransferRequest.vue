<!-- TransferRequest.vue -->
<template>
  <div class="remit-step1-page">
    <h1 class="page-title">해외 송금 신청</h1>

    <!-- STEP 표시 -->
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

    <!-- STEP 내용 -->
    <div class="step-content">
      <TermsAgree
          v-if="currentStep === 1"
          v-model:agree1="agree1"
          v-model:agree2="agree2"
          v-model:agree3="agree3"
      />

      <RemitInfo
          v-else-if="currentStep === 2"
          v-model:senderName="senderName"
          v-model:selectedReason="selectedReason"
          :recipientList="recipientList"
          v-model:selectedRecipient="selectedRecipient"
          v-model:senderPhone="senderPhone"
          v-model:senderEmail="senderEmail"
          v-model:senderCountry="senderCountry"
          v-model:senderAddress="senderAddress"
          @uploadSenderId="handleSenderIdUpload"
          @uploadProof="handleProofUpload"
          v-model:senderIdFileName="senderIdFileName"
          v-model:proofFileName="proofFileName"
      />

      <WithdrawInfo
          v-else-if="currentStep === 3"
          ref="withdrawInfoRef"
          v-model:isValid="isWithdrawInfoValid"
          :withdrawAccountType="withdrawAccountType"
      />

      <RecipientInfo
          v-else-if="currentStep === 4"
          :selectedRecipient="selectedRecipient"
          v-model:relationship="relationship"
      />

      <div v-else-if="currentStep === 5" class="confirmation-message">
        <p>입력하신 정보를 다시 한번 확인해주세요. -> 입력 값 출력</p>
        <P>예상 금액 출력</P>
        <P>예상 금액과 실제 금액은 달라질 수 있음을 명시</P>
      </div>

      <div v-else-if="currentStep === 6" class="completion-message">
        <p>해외 송금 요청이 성공적으로 완료되었습니다!</p>
      </div>
    </div>

    <!-- STEP 네비게이션 -->
    <section class="navigation-section">
      <button
          v-if="currentStep > 1 && currentStep < 6"
          @click="prevStep"
          type="button"
          class="prev-button"
      >
        이전
      </button>

      <button
          v-if="currentStep === 6"
          @click="goToHome()"
          type="button"
          class="prev-button"
      >
        홈
      </button>

      <button
          v-if="currentStep === 6"
          @click="goToForeignTransferList()"
          type="button"
          class="next-button"
      >
        내역 조회
      </button>

      <button
          v-if="currentStep < 5"
          :disabled="!canGoNextStepForCurrentTab"
          @click="nextStep"
          type="button"
          class="next-button"
      >
        다음
      </button>

      <button
          v-if="currentStep === 5"
          :disabled="!canGoToFinalStep"
          @click="submitApplication"
          type="button"
          class="submit-button"
      >
        요청
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import RemitInfo from '@/views/ForeignTransfer/components/TransferRepuest/RemitInfo.vue'
import WithdrawInfo from '@/views/ForeignTransfer/components/TransferRepuest/WithdrawInfo.vue'
import TermsAgree from '@/views/ForeignTransfer/components/TransferRepuest/TermsAgree.vue'
import RecipientInfo from '@/views/ForeignTransfer/components/TransferRepuest/RecipientInfo.vue'
import { useRouter } from 'vue-router'

// STEP 상태
const currentStep = ref(1)
const stepNames = ['약관동의', '송금정보', '출금정보', '수취인 정보', '확인', '완료']

// 약관 동의
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)

// 송금정보
const senderName = ref('')
const selectedReason = ref('')
const selectedRecipient = ref(null)
const senderPhone = ref('')
const senderEmail = ref('')
const senderCountry = ref('')
const senderAddress = ref('')
const senderIdFileName = ref('')
const proofFileName = ref('')
const recipientList = ref([
  { id: 1, name: '홍길동', currency: 'USD', bank: 'KOREX BANK', account: '123-456-7890', phone: '+1 1234-5678', email: 'hong@naver.com', addressDetail: '1600 Amphitheatre Parkway, Mountain View, CA 94043', addressCountry: 'United States of America' },
  { id: 2, name: '홍길순', currency: 'EUR', bank: 'KOREX BANK', account: '123-456-7890', phone: '+44 8765-4321', email: 'kim@gmail.com', addressDetail: '10 Downing Street, London, SW1A 2AA', addressCountry: 'United Kingdom' },
])

// 출금정보
const withdrawInfoRef = ref(null)
const withdrawAccountType = ref('KRW')
const isWithdrawInfoValid = ref(false)

// 수취인 관계
const relationship = ref('')

// STEP 이동
function prevStep() { if(currentStep.value>1) currentStep.value-- }
function setCurrentStep(step) { currentStep.value = step }

// 다음 버튼 활성 조건
const canGoNextStepForCurrentTab = computed(() => {
  if (currentStep.value === 1) return agree1.value && agree2.value && agree3.value
  if (currentStep.value === 2) return senderName.value && selectedReason.value && selectedRecipient.value
  if (currentStep.value === 3) return isWithdrawInfoValid.value
  if (currentStep.value === 4) return relationship.value
  return false
})

// 최종 확인 버튼 활성
const canGoToFinalStep = computed(() => true) // 실제 검증 필요 시 추가

const router = useRouter()

function nextStep() {
  if(currentStep.value === 3) {
    // WithdrawInfo 검증
    if(withdrawInfoRef.value) withdrawInfoRef.value.triggerValidation()
  }
  if(canGoNextStepForCurrentTab.value) currentStep.value++
}

// STEP5 요청
function submitApplication() {
  currentStep.value = 6
}

// 파일 업로드 이벤트
function handleSenderIdUpload(file) { console.log('본인인증 파일:', file) }
function handleProofUpload(file) { console.log('증빙 파일:', file) }

// 내역 페이지 이동
const goToForeignTransferList = () => router.push('/ForeignTransfer/list')

//홈 페이지로 이동
const goToHome = () => router.push('/')
</script>



<style scoped>
.remit-step1-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #333;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #008681;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 30px;
}

/* Step Indicators */
.step-indicators {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step-item {
  flex: 1;
  padding: 15px 10px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '>';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  color: #ccc;
  font-weight: bold;
}

.step-item.active {
  color: #008681;
  background-color: #E6F5F4;
}

.step-item.completed {
  color: #008681;
  font-weight: 700;
}

.step-item.active::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #008681;
}

/* Step Content Area */
.step-content {
  padding: 20px 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.confirmation-message,
.completion-message {
  text-align: center;
  padding: 50px 20px;
  line-height: 1.6;
}

.confirmation-message p { margin-bottom: 10px }
.completion-message { font-size: 20px; color: #008681; font-weight: 600 }
.completion-message p { margin-bottom: 10px }

/* Navigation Buttons */
.navigation-section {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.navigation-section button {
  padding: 12px 25px;
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-width: 120px;
}

.navigation-section .prev-button {
  background-color: #e0e0e0;
  color: #555;
}

.navigation-section .prev-button:hover { background-color: #d0d0d0 }

.navigation-section .next-button,
.navigation-section .submit-button {
  background-color: #009b99;
  color: #ffffff;
}

.navigation-section .next-button:hover,
.navigation-section .submit-button:hover {
  background-color: #008681;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navigation-section button:disabled {
  background-color: #cccccc;
  color: #999999;
  cursor: not-allowed;
  box-shadow: none;
}

/* Mobile */
@media (max-width: 768px) {
  .page-title { font-size: 24px; margin-bottom: 20px }
  .step-indicators { flex-wrap: wrap; border-radius: 8px }
  .step-item { flex-basis: 33.33%; padding: 12px 8px; font-size: 14px }
  .step-item:not(:last-child)::after { right: -2px }
  .step-indicators .step-item:nth-child(2)::after,
  .step-indicators .step-item:nth-child(4)::after,
  .step-indicators .step-item:nth-child(6)::after { content: none }
  .step-content { padding: 15px 0; border-radius: 8px }
  .navigation-section { flex-direction: column; gap: 10px }
  .navigation-section button { width: 100%; max-width: 250px; padding: 10px 20px; font-size: 16px }
}
</style>
