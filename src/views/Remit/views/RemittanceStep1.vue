<template>
  <div class="remit-step1-page">
    <h1 class="page-title">해외 송금 신청</h1>

    <div class="step-indicators">
      <div
          :class="{ 'step-item': true, active: currentStep === 1, completed: currentStep > 1 }"
          @click="setCurrentStep(1)"
      >
        <span>1. 약관동의</span>
      </div>
      <div
          :class="{ 'step-item': true, active: currentStep === 2, completed: currentStep > 2 }"
          @click="setCurrentStep(2)"
      >
        <span>2. 송금정보</span>
      </div>
      <div
          :class="{ 'step-item': true, active: currentStep === 3, completed: currentStep > 3 }"
          @click="setCurrentStep(3)"
      >
        <span>3. 출금정보</span>
      </div>
      <div
          :class="{ 'step-item': true, active: currentStep === 4, completed: currentStep > 4 }"
          @click="setCurrentStep(4)"
      >
        <span>4. 수취인정보</span>
      </div>
      <div
          :class="{ 'step-item': true, active: currentStep === 5, completed: currentStep > 5 }"
          @click="setCurrentStep(5)"
      >
        <span>5. 입력확인</span>
      </div>
      <div
          :class="{ 'step-item': true, active: currentStep === 6, completed: currentStep > 6 }"
          @click="setCurrentStep(6)"
      >
        <span>6. 완료</span>
      </div>
    </div>

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
          v-model:senderCity="senderCity"
          v-model:senderRegion="senderRegion"
          v-model:senderDistrict="senderDistrict"
          v-model:senderDetailAddress="senderDetailAddress"
          @uploadSenderId="handleSenderIdUpload"
          @uploadProof="handleProofUpload"
          :senderIdFileName="senderIdFileName"
          :proofFileName="proofFileName"
      />

      <WithdrawInfo
          v-else-if="currentStep === 3"
          v-model:withdrawAccountType="withdrawAccountType"
          :withdrawAccountList="withdrawAccountList"
          v-model:selectedWithdrawAccount="selectedWithdrawAccount"
          v-model:withdrawAmount="withdrawAmount"
          v-model:withdrawAccountPassword="withdrawAccountPassword"
          :balance="balance"
          :exchangeRate="exchangeRate"
          @checkBalance="checkBalance"
          @openCalculator="openCurrencyCalculator"
          v-model:isValid="isWithdrawInfoValid" ref="withdrawInfoRef" />

      <RecipientInfo
          v-else-if="currentStep === 4"
          :selectedRecipient="selectedRecipient"
          v-model:relationship="relationship"
      />

      <div v-else-if="currentStep === 5" class="confirmation-message">
        <p>입력하신 정보를 다시 한번 확인해주세요.</p>
        <p>이곳에 이전 단계의 정보 요약이 표시될 예정입니다.</p>
      </div>

      <div v-else-if="currentStep === 6" class="completion-message">
        <p>해외 송금 신청이 성공적으로 완료되었습니다!</p>
        <p>자세한 내용은 거래내역에서 확인하실 수 있습니다.</p>
      </div>
    </div>

    <section class="navigation-section">
      <button v-if="currentStep > 1 && currentStep < 6" @click="prevStep" type="button" class="prev-button">
        이전
      </button>
      <button v-if="currentStep === 6" @click="goToTransactionHistory" type="button" class="next-button">
        내역 조회
      </button>
      <button
          v-if="currentStep < 5" :disabled="!canGoNextStepForCurrentTab"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TermsAgree from '@/views/Remit/components/Remittance/TermsAgree.vue'
import RemitInfo from '@/views/Remit/components/Remittance/RemitInfo.vue'
import WithdrawInfo from '@/views/Remit/components/Remittance/WithdrawInfo.vue'
import RecipientInfo from '@/views/Remit/components/Remittance/RecipientInfo.vue'

const router = useRouter()

/* 상태 변수 */
const currentStep = ref(1) // 현재 활성화된 스텝
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)

const senderName = ref('')
const selectedReason = ref('reason1') // 기본값 설정
const recipientList = ref([
  {
    id: 1,
    name: '홍길동',
    currency: 'USD',
    bank: '국민은행',
    account: '123-456-789',
    idNumber: '900101-1234567',
    phone: '010-1234-5678',
    email: 'hong@example.com',
    addressCountry: '대한민국',
    addressCity: '서울',
    addressDetail: '강남구 역삼동 123-45',
  },
  {
    id: 2,
    name: '김철수',
    currency: 'EUR',
    bank: '우리은행',
    account: '987-654-321',
    idNumber: '850505-2345678',
    phone: '010-8765-4321',
    email: 'kim@example.com',
    addressCountry: '독일',
    addressCity: '베를린',
    addressDetail: '베를린 중심가 1번지',
  },
])
const selectedRecipient = ref(null)

const senderPhone = ref('')
const senderEmail = ref('')
const senderCity = ref('')
const senderRegion = ref('')
const senderDistrict = ref('')
const senderDetailAddress = ref('')

const senderIdFileName = ref('')
const proofFileName = ref('')

function handleSenderIdUpload(file) {
  senderIdFileName.value = file ? file.name : ''
}

function handleProofUpload(file) {
  proofFileName.value = file ? file.name : ''
}

/* 출금 및 송금금액 정보 */
const withdrawAccountType = ref('KRW')
const withdrawAccountList = ref([
  { accountNumber: '111-222-333', currency: 'KRW' },
  { accountNumber: '444-555-666', currency: 'USD' },
])
const selectedWithdrawAccount = ref(withdrawAccountList.value[0].accountNumber)
const balance = ref(null) // 초기값 null 또는 0
const withdrawAmount = ref(0)
const withdrawAccountPassword = ref('')

// WithdrawInfo 컴포넌트의 유효성 상태를 받아올 변수 (새롭게 추가)
const isWithdrawInfoValid = ref(false); // 초기값은 false로 설정

// ref로 WithdrawInfo 컴포넌트 인스턴스 참조 (triggerValidation 호출에 필요)
const withdrawInfoRef = ref(null);


const exchangeRate = ref(1300)

function checkBalance() {
  balance.value = 5000000 // 예시
}
function openCurrencyCalculator() {
  alert('환율 계산기 기능 준비 중입니다.')
}

/* 보내는 분과의 관계 */
const relationship = ref('')

/* 스텝별 유효성 검사 */
const isStep1Valid = computed(() => agree2.value && agree3.value) // agree1은 선택, agree2와 agree3이 필수
const isStep2Valid = computed(() => {
  return (
      senderName.value.trim() !== '' &&
      selectedReason.value !== '' && // 송금 사유 선택 확인
      selectedRecipient.value !== null && // 수취인 선택 확인
      senderPhone.value.trim() !== '' && // 핸드폰 번호
      senderEmail.value.trim() !== '' && // 이메일
      senderCity.value.trim() !== '' && // 도시
      senderRegion.value.trim() !== '' && // 지역
      senderDistrict.value.trim() !== '' && // 동/면/리
      senderDetailAddress.value.trim() !== '' && // 상세 주소
      senderIdFileName.value !== '' && // 신분증 파일 업로드 확인
      proofFileName.value !== '' // 증빙 서류 업로드 확인
  )
})
const isStep3Valid = computed(() => {
  // 이제 isStep3Valid는 WithdrawInfo 컴포넌트가 계산하여 전달해주는 isWithdrawInfoValid에 의존합니다.
  return isWithdrawInfoValid.value;
})
const isStep4Valid = computed(() => relationship.value.trim() !== '')
// 5단계 '입력확인'은 자체적인 유효성 검사 없이 이전 단계들의 유효성 검사를 기반으로 함
const isStep5Valid = computed(() => true); // 5단계는 확인 단계이므로 항상 유효하다고 가정

const canGoNextStepForCurrentTab = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isStep1Valid.value
    case 2:
      return isStep2Valid.value
    case 3:
      return isStep3Valid.value // WithdrawInfo 컴포넌트의 유효성 상태에 따라 결정
    case 4:
      return isStep4Valid.value
    case 5: // 5단계 '입력확인' 단계에서 '신청 완료' 버튼 활성화 여부
      return canGoToFinalStep.value; // 모든 이전 단계가 유효해야 함
    default:
      return false
  }
})

// 최종 제출 또는 6단계 '완료' 탭으로 이동하기 위한 전체 유효성 검사
const canGoToFinalStep = computed(() => {
  return isStep1Valid.value && isStep2Valid.value && isStep3Valid.value && isStep4Valid.value
})

/* 스텝 이동 함수 */
const nextStep = () => {
  // 3단계일 때 '다음' 버튼 클릭 시 WithdrawInfo 컴포넌트의 유효성 검사 강제 트리거
  if (currentStep.value === 3 && withdrawInfoRef.value) {
    if (!withdrawInfoRef.value.triggerValidation()) {
      alert('출금정보의 필수 항목을 모두 입력하거나 유효하게 작성해주세요.');
      return; // 유효성 검사 실패 시 다음 단계로 넘어가지 않음
    }
  }

  // 현재 탭의 유효성 검사를 통과했을 때만 다음 스텝으로 이동
  if (canGoNextStepForCurrentTab.value) {
    currentStep.value++
  } else {
    // triggerValidation을 통해 이미 alert이 나왔을 수 있으므로 중복 경고 방지
    // 3단계가 아닐 때만 기본 경고
    if (currentStep.value !== 3) {
      alert('현재 단계의 필수 정보를 모두 입력하거나 동의해주세요.')
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const setCurrentStep = (step) => {
  // 이전 스텝으로는 자유롭게 이동 허용 (validation 없이)
  if (step < currentStep.value) {
    currentStep.value = step;
    return;
  }

  // 다음 스텝으로 이동할 때 이전 스텝들의 유효성 검사
  let canSet = true;
  if (step > 1 && !isStep1Valid.value) canSet = false;
  if (step > 2 && !isStep2Valid.value) canSet = false;
  if (step > 3 && !isStep3Valid.value) canSet = false;
  if (step > 4 && !isStep4Valid.value) canSet = false;
  // 6단계 '완료' 탭으로 이동 시에는 5단계 '입력확인'을 건너뛰고 바로 완료할 수 없으므로,
  // 5단계로 이동하는 것처럼 canGoToFinalStep을 체크합니다.
  if (step > 5 && !canGoToFinalStep.value) canSet = false;


  if (canSet) {
    currentStep.value = step;
  } else {
    alert('이전 단계의 필수 정보를 먼저 완료해주세요.');
  }
}


// 최종 제출 함수
const submitApplication = () => {
  // 최종 제출 시 모든 스텝의 유효성 재확인
  if (!canGoToFinalStep.value) {
    alert('모든 필수 정보를 입력하고 필수 약관에 동의해야 송금 신청을 완료할 수 있습니다.')
    return
  }
  // 실제 송금 신청 로직 또는 다음 페이지로 이동
  // 5단계에서 '신청 완료' 버튼 클릭 시 6단계 '완료' 탭으로 이동
  currentStep.value = 6;
  // router.push({ name: 'Remittance2' }) // 실제 완료 페이지 라우팅은 6단계에서 진행될 수 있습니다.
}

// "내역 조회" 버튼 클릭 시 호출될 함수
const goToTransactionHistory = () => {
  // 실제 거래 내역 페이지 라우트 이름으로 변경해야 합니다.
  alert('내역 조회 기능은 준비중입니다')
  router.push({ name: 'TransactionHistoryPage' });
  // 예를 들어, 라우트 이름이 'TransactionHistory'라면
  // router.push({ name: 'TransactionHistory' });
};
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
  color: #1a7a4f;
  text-align: center;
  margin-bottom: 30px;
}

/* Step Indicators (Tabs) Styling */
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

/* 스텝 구분자 '>' 추가: 마지막 스텝을 제외하고 표시 */
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
  color: #1a7a4f;
  background-color: #e9f5ed;
}

.step-item.completed {
  color: #1a7a4f;
  font-weight: 700;
}

.step-item.active::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #1a7a4f;
}

/* Step Content Area */
.step-content {
  padding: 20px 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

/* 입력확인 메시지 스타일 */
.confirmation-message {
  text-align: center;
  padding: 50px 20px;
  font-size: 18px;
  color: #555;
  line-height: 1.6;
}
.confirmation-message p {
  margin-bottom: 10px;
}

/* 완료 메시지 스타일 */
.completion-message {
  text-align: center;
  padding: 50px 20px;
  font-size: 20px;
  color: #3d9970;
  font-weight: 600;
  line-height: 1.6;
}
.completion-message p {
  margin-bottom: 10px;
}


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

.navigation-section .prev-button:hover {
  background-color: #d0d0d0;
}

.navigation-section .next-button,
.navigation-section .submit-button {
  background-color: #3d9970;
  color: #ffffff;
}

.navigation-section .next-button:hover,
.navigation-section .submit-button:hover {
  background-color: #2e8b57;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navigation-section button:disabled {
  background-color: #cccccc;
  color: #999999;
  cursor: not-allowed;
  box-shadow: none;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .step-indicators {
    flex-wrap: wrap; /* 모바일에서 탭이 너무 많으면 줄바꿈 */
    border-radius: 8px;
  }

  .step-item {
    flex-basis: 33.33%; /* 6개 스텝이므로 3개씩 한 줄에 */
    padding: 12px 8px;
    font-size: 14px;
  }
  /* 모바일에서 스텝 구분자 '>' 조정 */
  .step-item:not(:last-child)::after {
    right: -2px; /* 기본값에서 약간 왼쪽으로 이동 */
  }

  /* 모바일에서 짝수번째 아이템 뒤의 화살표 제거 (줄바꿈 고려) */
  .step-indicators .step-item:nth-child(2)::after,
  .step-indicators .step-item:nth-child(4)::after {
    content: none;
  }

  /* 마지막 스텝 (6단계) 뒤의 화살표도 제거 */
  .step-indicators .step-item:nth-child(6)::after {
    content: none;
  }

  .step-content {
    padding: 15px 0;
    border-radius: 8px;
  }

  .navigation-section {
    flex-direction: column;
    gap: 10px;
  }

  .navigation-section button {
    width: 100%;
    max-width: 250px; /* 버튼 최대 너비 제한 */
    padding: 10px 20px;
    font-size: 16px;
  }
}
</style>