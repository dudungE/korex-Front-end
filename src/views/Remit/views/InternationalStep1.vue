<template>
  <div class="recipient-page forex-style">
    <div class="page-header">
      <h1 class="page-title">해외송금</h1>
      <div class="step-indicator">
        <span class="step active">01</span>
        <span class="step">02</span>
        <span class="step">03</span>
      </div>
    </div>

    <div class="info-box result-box">
      <ul>
        <li>
          <i class="bullet"></i> 처음 이용하시거나 해외송금과 관련하여 궁금한 사항이 있으시면
          <a href="#" class="link">해외송금안내</a>를 참고해 주세요.
          <button class="btn-info">해외송금안내</button>
        </li>
        <li><i class="asterisk">*</i> 항목은 필수 입력 항목입니다.</li>
      </ul>
    </div>

    <div class="content-section search-box">
      <div class="section-header">
        <span class="section-icon"></span>
        <h3 class="section-title">송금전 확인사항</h3>
      </div>
      <p class="section-description">
        <span class="highlight">가상화폐</span>에 관련한 송금을 하거나, 이와 관련된 자금을 제3자를 대신하여 송금할 경우,
        외국환거래법에 의거하여 제재를 받을 수 있습니다.
      </p>
      <label class="checkbox-group">
        <input type="checkbox" v-model="termsAgreed" id="termsCheck" />
        <label for="termsCheck">확인함</label>
      </label>
    </div>

    <RemittanceInfoForm v-model:formData="formData.remittanceInfo" />
    <RemittanceForm v-model:formData="formData.remittanceDetails" />

    <div class="terms-page">
      <h2 class="page-title">약관</h2>
      <div class="terms-box" style="max-height: 300px; overflow-y: auto; white-space: pre-wrap;">
        <!-- 약관 텍스트 여기에 삽입 -->
        외환거래 기본약관... (생략)
      </div>

      <div class="agreement-section">
        <p>위 약관의 내용을 이해하였으며, 그 내용에 동의하십니까?</p>
        <div class="radio-group">
          <label><input type="radio" name="agreement" value="agree" v-model="termsAgreement" /> 동의함</label>
          <label><input type="radio" name="agreement" value="disagree" v-model="termsAgreement" /> 동의하지 않음</label>
        </div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn-primary" @click="goToStep2" :disabled="!isFormValid">
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

import RemittanceInfoForm from '@/views/Remit/components/RemittanceInfoForm.vue'
import RemittanceForm from '@/views/Remit/components/RemittanceForm.vue'

const router = useRouter()
const termsAgreed = ref(false)
const termsAgreement = ref(null)

const formData = reactive({
  remittanceInfo: {
    senderName: '',
    remittanceReason: '',
    recipientName: '',
    recipientAccountName: '',
    recipientAccountNumber: '',
    recipientPhone: '',
    recipientCountry: '',
    recipientCity: '',
    recipientDetailAddress: '',
    senderAddressFloor: '',
    senderAddressStreet: '',
    senderAddressTown: '',
    relationship: '',
  },
  remittanceDetails: {
    selectedAccountType: 'KRW',
    selectedAccountNumber: '',
    withdrawAmountKRW: 0,
    withdrawAmountFX: 0,
    accountPassword: '',
    staffNote: '',
    exchangeRate: '',
    applyExchangeRate: '',
    remittanceFee: '',
    bankFee: '',
    totalWithdrawAmount: ''
  }
})

const isFormValid = computed(() => {
  return termsAgreed.value &&
    termsAgreement.value === 'agree' &&
    formData.remittanceInfo.remittanceReason &&
    formData.remittanceInfo.recipientName &&
    formData.remittanceDetails.selectedAccountNumber &&
    formData.remittanceDetails.accountPassword.length === 4
})

const showStep2 = ref(false)

function goToStep2() {
  if (!isFormValid.value) {
    alert('필수 항목과 약관 동의가 완료되어야 합니다.')
    return
  }
  // 다음 STEP2 페이지로 라우팅 또는 상태변경 방식으로 이동 처리
  router.push({ name: 'InternationalStep2', params: { formData: JSON.parse(JSON.stringify(formData)) } })
}
</script>