<template>
  <div class="content-section search-box">
    <div class="section-header">
      <span class="section-icon"></span>
      <h3 class="section-title">송금정보</h3>
    </div>
    <table class="form-table">
      <colgroup><col style="width: 150px" /><col /></colgroup>
      <tbody>
        <tr>
          <th>송금사유<span class="highlight"> *</span></th>
          <td>
            <div class="radio-grid">
              <label v-for="(text, key) in reasonMap" :key="key">
                <input type="radio" name="reason" :value="key" v-model="localFormData.remittanceReason" />
                {{ text }}
              </label>
            </div>
          </td>
        </tr>
        <tr>
          <th>수취인 선택<span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <input type="text" class="input-text full-width" v-model="localFormData.recipientName" readonly placeholder="수취인 선택 버튼으로 선택하세요" />
              <button type="button" class="btn-balance" @click="openRecipientModal">수취인 정보</button>
            </div>
          </td>
        </tr>
        <tr>
          <th>송금인주소<span class="highlight"> *</span></th>
          <td>
            <div class="address-input-group">
              <input type="text" class="input-text full-width" placeholder="(FLOOR)" v-model="localFormData.senderAddressFloor" />
              <input type="text" class="input-text full-width" placeholder="(STREET)" v-model="localFormData.senderAddressStreet" />
              <input type="text" class="input-text full-width" placeholder="(TOWN)" v-model="localFormData.senderAddressTown" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <RecipientModal v-if="showRecipientModal" @close="closeRecipientModal" @select="selectRecipient" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RecipientModal from '@/views/Remit/components/RecipientModal.vue'

defineProps({
  formData: Object,
})

const emit = defineEmits(['update:formData'])


const localFormData = computed({
  get() {
    return __props.formData
  },
  set(val) {
    emit('update:formData', val)
  },
})

const reasonMap = {
  reason1: '미화 5천불 상당액 이하 증빙서류 미제출 송금(구:증여성송금)',
  reason2: '해외유학생의 학비 송금',
  reason3: '외국인 및 비거주자의 외화 예금 인출 송금',
  reason4: '해외체재자의 해외 체재비 송금',
  reason5: '비거주자 자유해외예금 인출송금',
}

const showRecipientModal = ref(false)
function openRecipientModal() {
  showRecipientModal.value = true
}
function closeRecipientModal() {
  showRecipientModal.value = false
}
function selectRecipient(recipient) {
  localFormData.value.recipientName = recipient.name
  localFormData.value.recipientAccountName = recipient.accountName
  localFormData.value.recipientAccountNumber = recipient.accountNumber
  localFormData.value.recipientPhone = recipient.phone
  localFormData.value.recipientCountry = recipient.country
  localFormData.value.recipientCity = recipient.city
  localFormData.value.recipientDetailAddress = recipient.detailAddress
  closeRecipientModal()
}
</script>
