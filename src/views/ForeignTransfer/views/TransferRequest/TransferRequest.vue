<template>
  <div class="remit-step-page">
    <h1 class="page-title">해외 송금 신청</h1>

    <!-- STEP 진행 표시 -->
    <div class="step-indicators">
      <div
          v-for="(stepName, index) in stepNames"
          :key="index"
          :class="['step-item', { active: currentStep === index + 1, completed: currentStep > index + 1 }]">
        STEP {{ index + 1 }}
        <div class="step-label">{{ stepName }}</div>
      </div>
    </div>

    <!-- STEP 컴포넌트 -->
    <TermsAgree v-if="currentStep === 1" ref="termsAgreeComponent" />

    <RemitInfo
        v-if="currentStep === 2"
        ref="remitInfoComponent"
        v-model:senderName="localSenderName"
        v-model:selectedReason="localSelectedReason"
        v-model:selectedRecipient="localSelectedRecipient"
        v-model:staffMessage="staffMessage"
        v-model:identityFiles="identityFiles"
        v-model:reasonFiles="reasonFiles"
        @update:isValid="remitInfoValid = $event"
    />

    <WithdrawInfo
        v-if="currentStep === 3"
        ref="withdrawInfoComponent"
        :selected-recipient="localSelectedRecipient"
        :initial-amount="Number(amountInput) || 0"
        v-model:totalAmountKRW="totalAmountKRW"
        v-model:feeAmountKRW="feeAmountKRW"
        @update:selectedAccount="selectedAccount = $event"
        @update:selectedCurrency="selectedCurrency = $event"
        @update:amountInput="amountInput = $event"
        @update:totalAmountKRW="totalAmountKRW = $event"
        @update:feeAmountKRW="feeAmountKRW = $event"
        @update:isValid="isWithdrawValid = $event"
    />

    <RecipientInfo
        v-if="currentStep === 4"
        v-model:selectedRecipient="localSelectedRecipient"
        v-model:relationship="relationship"
        v-model:relationFiles="relationFiles"
    />

    <ConfirmationStep
        v-if="currentStep === 5"
        :sender-name="localSenderName"
        :selected-account="selectedAccount"
        :recipient="localSelectedRecipient"
        :relationship="relationship"
        :relationFiles="relationFiles"
        :reason="localSelectedReason"
        :identity-files="identityFiles"
        :reason-files="reasonFiles"
        :amount="amountInput"
        :currency="selectedCurrency"
        :totalAmountKRW="totalAmountKRW"
        :fee="feeAmountKRW"
        :staff-message="staffMessage"
    />

    <CompletionStep
        v-if="currentStep === 6"
        @go-home="goHome"
        @go-to-history="goToHistory"
    />

    <!-- STEP 이동 버튼 -->
    <div class="navigation-buttons" v-if="currentStep !== 6">
      <button @click="prevStep" :disabled="currentStep === 1">이전</button>
      <button @click="nextStep" :disabled="isNextDisabled">
        {{ currentStep === 5 ? '완료' : '다음' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import TermsAgree from '@/views/ForeignTransfer/components/TransferRequest/TermsAgree.vue'
import RemitInfo from '@/views/ForeignTransfer/components/TransferRequest/RemitInfo.vue'
import WithdrawInfo from '@/views/ForeignTransfer/components/TransferRequest/WithdrawInfo.vue'
import RecipientInfo from '@/views/ForeignTransfer/components/TransferRequest/RecipientInfo.vue'
import ConfirmationStep from '@/views/ForeignTransfer/components/TransferRequest/ConfirmationStep.vue'
import CompletionStep from '@/views/ForeignTransfer/components/TransferRequest/CompletionStep.vue'

const router = useRouter()
const currentStep = ref(1)

// STEP 데이터
const localSenderName = ref('')
const localSelectedReason = ref('')
const localSelectedRecipient = ref(null)
const staffMessage = ref('')
const identityFiles = ref([])
const reasonFiles = ref([])

const amountInput = ref(0)
const selectedCurrency = ref('USD')
const selectedAccount = ref(null)
const totalAmountKRW = ref(0)
const feeAmountKRW = ref(0)
const isWithdrawValid = ref(false)
const remitInfoValid = ref(false)

const relationship = ref('')
const relationFiles = ref([])

// STEP 컴포넌트 ref
const termsAgreeComponent = ref(null)
const remitInfoComponent = ref(null)
const withdrawInfoComponent = ref(null)

// STEP 이름
const stepNames = ['약관동의', '송금정보', '출금정보', '수취인 정보', '확인', '완료']

// -----------------------------
// STEP 이동
// -----------------------------
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const nextStep = async () => {
  try {
    switch(currentStep.value) {
      case 1:
        if (termsAgreeComponent.value) {
          await termsAgreeComponent.value.agreeTerms()
          await checkRecipientsAndProceed()
        }
        break
      case 2:
        if (!remitInfoValid.value) {
          alert('송금 정보를 올바르게 입력해주세요.')
          return
        }
        currentStep.value++
        break
      case 3:
        if (!isWithdrawValid.value) {
          alert('출금 정보가 올바르지 않습니다.')
          return
        }
        currentStep.value++
        break
      case 4:
        if (!localSelectedRecipient.value || !relationship.value) {
          alert('수취인 정보가 올바르게 입력되지 않았습니다.')
          return
        }
        currentStep.value++
        break
      case 5:
        // STEP 5: 송금 완료
        try {
          const requestPayload = {
            senderName: localSenderName.value,
            transferReason: localSelectedReason.value,
            recipientId: localSelectedRecipient.value.id,
            amount: Number(amountInput.value),
            currency: selectedCurrency.value,
            fee: feeAmountKRW.value,
            totalAmountKRW: totalAmountKRW.value,
            accountType: selectedAccount.value?.accountType
          }

          const requestRes = await axios.post('/api/foreign-transfer/request', requestPayload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          })

          const transactionId = requestRes.data.transferId

          const formData = new FormData()
          formData.append('name', localSenderName.value)
          formData.append('transferReason', localSelectedReason.value)
          formData.append('relationRecipient', JSON.stringify({
            name: localSelectedRecipient.value.name,
            accountNumber: localSelectedRecipient.value.accountNumber,
            bank: localSelectedRecipient.value.bank
          }))
          formData.append('staffMessage', staffMessage.value)

          if (identityFiles.value.length > 0) formData.append('idFile', identityFiles.value[0])
          if (reasonFiles.value.length > 0) formData.append('proofDocumentFile', reasonFiles.value[0])
          if (relationFiles.value.length > 0) formData.append('relationDocumentFile', relationFiles.value[0])

          await axios.post(`/api/foreign-transfer/sender/create?transactionId=${transactionId}`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'multipart/form-data'
            }
          })

          alert('송금 요청이 완료되었습니다.')
          currentStep.value++ // STEP 6 완료
        } catch (err) {
          console.error('송금 처리 실패', err)
          alert('송금 처리 중 오류가 발생했습니다.')
        }
        break
      default:
        currentStep.value++
        break
    }
  } catch(err) {
    console.error(err)
  }
}


// 수취인 목록 확인 후 STEP 이동
const checkRecipientsAndProceed = async () => {
  try {
    const res = await axios.get('/api/ForeignTransfer/recipients/active')
    const list = res.data?.recipients || res.data || []
    if (list.length === 0) {
      alert('먼저 수취인을 등록해주세요.')
      router.push('/recipients')
    } else {
      currentStep.value++
    }
  } catch(err) {
    console.error(err)
    alert('수취인 목록 조회 실패')
  }
}

// STEP 버튼 disabled 처리
const isNextDisabled = computed(() => {
  if(currentStep.value === 2) return !remitInfoValid.value
  if(currentStep.value === 3) return !isWithdrawValid.value
  if(currentStep.value === 4) return !localSelectedRecipient.value || !relationship.value
  return false
})

// 완료 Step 이벤트
const goHome = () => { router.push('/') }
const goToHistory = () => { router.push('/ForeignTransfer/list') }
</script>

<style scoped>
.remit-step-page { max-width: 850px; margin: 0 auto; padding: 1rem; font-family: 'Pretendard Variable', sans-serif; color: #333; }
.page-title { font-size: 28px; font-weight: 700; color: #008681; text-align: center; margin-top: 10px; margin-bottom: 30px; }
.step-indicators { display: flex; justify-content: space-between; margin-bottom: 30px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.step-item { flex: 1; padding: 15px 10px; text-align: center; font-size: 16px; font-weight: 600; color: #888; cursor: pointer; transition: all 0.3s ease; position: relative; }
.step-item:not(:last-child)::after { content: '>'; position: absolute; right: -5px; top: 50%; transform: translateY(-50%); color: #ccc; font-weight: bold; }
.step-item.active { color: #008681; background-color: #E6F5F4; }
.step-item.completed { color: #008681; font-weight: 700; }
.step-item .step-label { font-size: 12px; color: #666; margin-top: 5px; }
.step-item.active::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background-color: #008681; }

.navigation-buttons { margin-top: 30px; text-align: center; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
.navigation-buttons button { padding: 12px 25px; font-size: 17px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s ease, box-shadow 0.2s ease; min-width: 120px; }
.navigation-buttons button:hover { background-color: #008681; color: #fff; }
.navigation-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
