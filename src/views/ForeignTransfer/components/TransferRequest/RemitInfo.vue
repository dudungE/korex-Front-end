<template>
  <section class="remit-info-section-v4">
    <h2 class="section-title-v4">송금정보</h2>

    <div class="info-table-v4">
      <!-- 보내는 분 이름 -->
      <div class="info-row-v4 input-row">
        <label for="sender-name" class="input-label-v4">보내는 분 이름</label>
        <input type="text" id="sender-name" v-model="localSenderName" class="input-field-v4" placeholder="이름을 입력해주세요"/>
      </div>

      <!-- 송금 사유 -->
      <div class="info-row-v4 radio-group-row">
        <label class="input-label-v4">송금 사유</label>
        <div class="radio-group-wrapper-v4">
          <label v-for="(label, index) in remitReasons" :key="index" class="radio-label-v4">
            <input type="radio" name="remitReason" :value="label.value" v-model="localSelectedReason" class="radio-input-v4"/>
            {{ label.text }}
          </label>
        </div>
      </div>

      <!-- 수취인 선택 -->
      <div class="info-row-v4 action-row">
        <span class="info-label-v4">수취인 선택</span>
        <button type="button" @click="openRecipientModal" class="action-button-v4">선택</button>
      </div>

      <!-- 선택된 수취인 정보 -->
      <div v-if="localSelectedRecipient" class="info-row-v4 selected-recipient-info">
        <div class="info-details-box-v4">
          <p>
            <strong>이름:</strong> {{ localSelectedRecipient.name }}
            <strong>은행명:</strong> {{ localSelectedRecipient.bank }}
            <strong>계좌번호:</strong> {{ localSelectedRecipient.account }}
            <strong>통화:</strong> {{ localSelectedRecipient.currency }}
          </p>
        </div>
      </div>

      <!-- 연락처, 이메일, 국가, 주소 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">보내는 분 연락처</label>
        <div class="contact-input-wrapper">
          <select v-model="localSenderCountryCode" class="country-code-select">
            <option value="" disabled>국가 선택</option>
            <option v-for="code in countryCodes" :key="code.value" :value="code.value">{{ code.text }}</option>
          </select>
          <input type="tel" v-model.trim="localSenderPhoneNumber" class="input-field-v4 phone-input" placeholder="123456789"/>
        </div>
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-email" class="input-label-v4">보내는 분 이메일</label>
        <input type="email" id="sender-email" v-model="localSenderEmail" class="input-field-v4" placeholder="example@email.com"/>
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-country" class="input-label-v4">보내는 분 거주 국가</label>
        <input type="text" id="sender-country" v-model="localSenderCountry" class="input-field-v4" placeholder="United States"/>
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-address" class="input-label-v4">보내는 분 영문 주소</label>
        <input type="text" id="sender-address" v-model="localSenderAddress" class="input-field-v4" placeholder="주소를 입력해주세요"/>
      </div>

      <div class="info-row-v4 input-row">
        <label for="staff-message" class="input-label-v4">전달 사항</label>
        <input type="text" id="staff-message" v-model="staffMessage" class="input-field-v4" placeholder="직원에게 전달할 사항을 입력해주세요"/>
      </div>

      <!-- 본인인증 서류 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">본인인증 서류</label>
        <div class="file-row-v4">
          <small>예: 기본증명서, 신분증, 운전면허증, 여권사본</small>
          <input type="file" ref="identityInput" @change="onFileChange($event, 'identity')" multiple style="display:none" />
          <button type="button" class="file-button-v4" @click="identityInput.click()">파일 선택</button>
          <span class="file-names-v4">{{ identityFiles.map(f => f.name).join(', ') }}</span>
        </div>
      </div>

      <!-- 송금사유 서류 -->
      <div class="info-row-v4 input-row">
        <label class="input-label-v4">송금사유 서류</label>
        <div class="file-row-v4">
          <small>예: 유학증명서</small>
          <input type="file" ref="reasonInput" @change="onFileChange($event, 'reason')" multiple style="display:none" />
          <button type="button" class="file-button-v4" @click="reasonInput.click()">파일 선택</button>
          <span class="file-names-v4">{{ reasonFiles.map(f => f.name).join(', ') }}</span>
        </div>
      </div>
      <!-- 수취인 모달 -->
      <RecipientModal
          v-if="showRecipientModal"
          :recipients="recipients"
          @selectRecipient="onSelectRecipient"
          @closeModal="showRecipientModal = false"/>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RecipientModal from '@/views/ForeignTransfer/components/TransferRequest/RecipientModal.vue'
import axios from 'axios'

const props = defineProps({
  senderName: String,
  selectedReason: String,
  selectedRecipient: Object,
  senderPhoneNumber: String,
  senderCountryCode: String,
  senderEmail: String,
  senderCountry: String,
  senderAddress: String,
  staffMessage: String,
})

const emit = defineEmits([
  'update:senderName',
  'update:selectedReason',
  'update:selectedRecipient',
  'update:senderPhoneNumber',
  'update:senderCountryCode',
  'update:senderEmail',
  'update:senderCountry',
  'update:senderAddress',
  'update:staffMessage',
  'update:isValid',
])

// Local state
const localSenderName = ref(props.senderName || '')
const localSelectedReason = ref(props.selectedReason || '')
const localSelectedRecipient = ref(props.selectedRecipient || null)
const localSenderPhoneNumber = ref(props.senderPhoneNumber || '')
const localSenderCountryCode = ref(props.senderCountryCode || '')
const localSenderEmail = ref(props.senderEmail || '')
const localSenderCountry = ref(props.senderCountry || '')
const localSenderAddress = ref(props.senderAddress || '')
const staffMessage = ref(props.staffMessage || '')

const identityFiles = ref([])
const reasonFiles = ref([])

const showRecipientModal = ref(false)
const recipients = ref([]) // 수취인 목록

const identityInput = ref(null)
const reasonInput = ref(null)

// Options
const remitReasons = [
  { value: 'reason1', text: '유학생 등록비' },
  { value: 'reason2', text: '유학생 생활비' },
  { value: 'reason3', text: '기타' },
]

const countryCodes = [
  { value: '+82', text: '+82 (KR)' },
  { value: '+1', text: '+1 (US)' },
  { value: '+44', text: '+44 (UK)' },
]

// Can proceed
const canProceed = computed(() => {
  return !!localSenderName.value &&
      !!localSelectedReason.value &&
      !!localSelectedRecipient.value &&
      !!localSenderPhoneNumber.value &&
      !!localSenderCountryCode.value &&
      !!localSenderEmail.value &&
      !!localSenderCountry.value &&
      !!localSenderAddress.value &&
      !!staffMessage.value
})

// Watchers
watch(localSenderName, val => emit('update:senderName', val))
watch(localSelectedReason, val => emit('update:selectedReason', val))
watch(localSelectedRecipient, val => emit('update:selectedRecipient', val))
watch(localSenderPhoneNumber, val => emit('update:senderPhoneNumber', val))
watch(localSenderCountryCode, val => emit('update:senderCountryCode', val))
watch(localSenderEmail, val => emit('update:senderEmail', val))
watch(localSenderCountry, val => emit('update:senderCountry', val))
watch(localSenderAddress, val => emit('update:senderAddress', val))
watch(staffMessage, val => emit('update:staffMessage', val))
watch(canProceed, val => emit('update:isValid', val))

// 수취인 모달 열기 + 목록 조회
async function openRecipientModal() {
  try {
    const response = await axios.get('/api/ForeignTransfer/recipients/active')
    recipients.value = response.data
  } catch (error) {
    console.error('수취인 목록 조회 실패', error)
    recipients.value = []
  } finally {
    showRecipientModal.value = true
  }
}

// 수취인 선택
function onSelectRecipient(recipient) {
  localSelectedRecipient.value = recipient
  showRecipientModal.value = false
}

// 파일 선택
function onFileChange(event, type) {
  const files = Array.from(event.target.files)
  if (type === 'identity') identityFiles.value = files
  else if (type === 'reason') reasonFiles.value = files
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.contact-input-wrapper { display: flex; gap: 8px; flex-grow: 1; }
.country-code-select { width: 30%; padding: 8px 12px; border-radius: 6px; border: 1px solid #dcdcdc; background-color: #fff; text-align: center; }
.phone-input { flex-grow: 1; }
.remit-info-section-v4 { background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); font-family: 'Pretendard Variable', sans-serif; color: #333333; }
.section-title-v4 { font-size: 26px; font-weight: 700; color: #008681; margin-bottom: 28px; display: flex; justify-content: center; align-items: center; gap: 10px; }
.info-table-v4 { background-color: #f8f8f8; border-radius: 10px; border: 1px solid #e0e0e0; overflow: hidden; margin-bottom: 30px; }
.info-row-v4 { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #eeeeee; }
.input-label-v4 { font-size: 15px; color: #666666; font-weight: 500; flex-basis: 35%; flex-shrink: 0; text-align: left; }
.input-field-v4 { flex-grow: 1; padding: 8px 12px; border: 1px solid #dcdcdc; border-radius: 6px; font-size: 16px; color: #333333; width: auto; box-sizing: border-box; text-align: right; }
.input-field-v4:focus { outline: none; border-color: #009b99; box-shadow: 0 0 0 3px rgba(61, 153, 112, 0.1); }
.radio-group-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #eeeeee; }
.radio-group-wrapper-v4 { display: flex; flex-wrap: wrap; gap: 12px 20px; justify-content: flex-end; flex-grow: 1; }
.radio-label-v4 { display: flex; align-items: center; cursor: pointer; font-size: 15px; color: #333333; font-weight: 500; }
.radio-input-v4 { margin-right: 8px; accent-color: #009b99; }
.action-row { justify-content: space-between; }
.action-button-v4 { padding: 7px 10px; background-color: #009b99; color: #ffffff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s ease, box-shadow 0.2s ease; min-width: 68px; }
.action-button-v4:hover { background-color: #008681; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.selected-recipient-info { display: block; padding: 10px 20px 14px; }
.info-details-box-v4 { background-color: #E6F5F4; border: 1px solid #c8e6c9; border-radius: 8px; padding: 12px 18px; font-size: 15px; line-height: 1.6; color: #333333; }
.info-details-box-v4 p { margin: 3px; padding: 2px 0; text-align: center; }
.info-details-box-v4 strong { color: #008681; padding: 3px; }
.file-row-v4 {
  display: flex;
  align-items: center;
  gap: 12px; /* 버튼과 파일명 사이 간격 */
}

.file-button-v4 {
  padding: 8px 16px;
  background-color: #009b99;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.file-button-v4:hover {
  background-color: #008681;
}

.file-names-v4 {
  flex-grow: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>