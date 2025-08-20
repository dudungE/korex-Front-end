<template>
  <section class="remit-info-section-v4">
    <h2 class="section-title-v4">송금정보</h2>

    <div class="info-table-v4">
      <div class="info-row-v4 input-row">
        <label for="sender-name" class="input-label-v4">보내는 분 이름</label>
        <input
            type="text"
            id="sender-name"
            v-model="localSenderName"
            class="input-field-v4"
            placeholder="이름을 입력해주세요"
        />
      </div>

      <div class="info-row-v4 radio-group-row">
        <label class="input-label-v4">송금 사유</label>
        <div class="radio-group-wrapper-v4">
          <label
              v-for="(label, index) in remitReasons"
              :key="index"
              class="radio-label-v4"
          >
            <input
                type="radio"
                name="remitReason"
                :value="label.value"
                v-model="localSelectedReason"
                class="radio-input-v4"
            />
            {{ label.text }}
          </label>
        </div>
      </div>

      <div class="info-row-v4 action-row">
        <span class="info-label-v4">수취인 선택</span>
        <button type="button" @click="showRecipientModal = true" class="action-button-v4">
          선택
        </button>
      </div>

      <div v-if="selectedRecipient" class="info-row-v4 selected-recipient-info">
        <div class="info-details-box-v4">
          <p><strong>이름:</strong> {{ selectedRecipient.name }}
            <strong>은행명:</strong> {{ selectedRecipient.bank }}
            <strong>계좌번호:</strong> {{ selectedRecipient.account }}
            <strong>통화:</strong> {{selectedRecipient.currency}}</p>
        </div>
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-phone" class="input-label-v4">보내는 분 핸드폰 번호</label>
        <input
            type="tel"
            id="sender-phone"
            v-model="localSenderPhone"
            class="input-field-v4"
            placeholder="01012345678"
            maxlength="11"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-email" class="input-label-v4">보내는 분 이메일 주소</label>
        <input
            type="email"
            id="sender-email"
            v-model="localSenderEmail"
            class="input-field-v4"
            placeholder="example@email.com"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-country" class="input-label-v4">보내는 분 거주 국가</label>
        <input
            type="text"
            id="sender-country"
            v-model="localSenderCountry"
            class="input-field-v4"
            placeholder="Korea"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-address" class="input-label-v4">보내는 분 영문 주소</label>
        <input
            type="text"
            id="sender-address"
            v-model="localSenderAddress"
            class="input-field-v4"
            placeholder="6F, 254, Changgyeonggung-ro, Jongno-gu, Seoul"
        />
      </div>

      <div class="info-row-v4 file-upload-row">
        <label class="input-label-v4">본인인증 서류</label>
        <small>예) 기본 증명서, 신분증, 면허증</small>
        <div class="file-input-wrapper-v4">
          <span class="uploaded-file-name-v4">
            {{ senderIdFileName || '선택된 파일 없음' }}
          </span>
          <label for="sender-id-upload" class="custom-file-button-v4">
            파일 선택
          </label>
          <input
              type="file"
              id="sender-id-upload"
              @change="onSenderIdUpload"
              class="hidden-file-input"
              ref="senderIdInput"
          />
        </div>
      </div>

      <div class="info-row-v4 file-upload-row">
        <label class="input-label-v4">송금 사유 증빙 서류</label>
        <small>예) 유학 증명서</small>
        <div class="file-input-wrapper-v4">
          <span class="uploaded-file-name-v4">
            {{ proofFileName || '선택된 파일 없음' }}
          </span>
          <label for="proof-upload" class="custom-file-button-v4">
            파일 선택
          </label>
          <input
              type="file"
              id="proof-upload"
              @change="onProofUpload"
              class="hidden-file-input"
              ref="proofInput"
          />
        </div>
      </div>
    </div>

    <RecipientModal
        v-if="showRecipientModal"
        :recipientList="recipientList"
        @selectRecipient="onSelectRecipient"
        @closeModal="showRecipientModal = false"
    />
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import RecipientModal from './RecipientModal.vue'

const props = defineProps({
  senderName: String,
  selectedReason: String,
  recipientList: Array,
  selectedRecipient: Object,
  senderPhone: String,
  senderEmail: String,
  senderCountry: String,
  senderAddress: String,
  senderIdFileName: String, // 파일 이름 표시용 prop
  proofFileName: String, // 파일 이름 표시용 prop
})

const emit = defineEmits([
  'update:senderName',
  'update:selectedReason',
  'update:selectedRecipient',
  'update:senderPhone',
  'update:senderEmail',
  'update:senderCountry',
  'update:senderAddress',
  'uploadSenderId', // 실제 파일 객체 전송 이벤트
  'uploadProof', // 실제 파일 객체 전송 이벤트
  'update:senderIdFileName', // 파일 이름 업데이트 이벤트 추가
  'update:proofFileName', // 파일 이름 업데이트 이벤트 추가
])

const remitReasons = [
  { value: 'reason1', text: '유학생 등록비' },
  { value: 'reason2', text: '유학생 생활비' },
  { value: 'reason3', text: '기타' },
]

/* 로컬 복사 & emit */
const localSenderName = ref(props.senderName)
const localSelectedReason = ref(props.selectedReason)
const localSenderPhone = ref(props.senderPhone)
const localSenderEmail = ref(props.senderEmail)
const localSenderCountry = ref(props.senderCountry)
const localSenderAddress = ref(props.senderAddress)

watch(localSenderName, (val) => emit('update:senderName', val))
watch(localSelectedReason, (val) => emit('update:selectedReason', val))
watch(localSenderPhone, (val) => emit('update:senderPhone', val))
watch(localSenderEmail, (val) => emit('update:senderEmail', val))
watch(localSenderCountry, (val) => emit('update:senderCountry', val))
watch(localSenderAddress, (val) => emit('update:senderAddress', val))

const selectedRecipient = ref(props.selectedRecipient)
watch(
    () => props.selectedRecipient,
    (val) => {
      selectedRecipient.value = val
    }
)

const showRecipientModal = ref(false)

function onSelectRecipient(recipient) {
  emit('update:selectedRecipient', recipient)
  showRecipientModal.value = false
}

// 파일 이름 표시를 위한 ref (선택 사항, 부모 컴포넌트에서 prop을 통해 제어하는 것이 더 일반적)
const senderIdInput = ref(null);
const proofInput = ref(null);

function onSenderIdUpload(e) {
  const file = e.target.files[0];
  if (file) {
    emit('uploadSenderId', file); // 실제 파일 객체 전송
    emit('update:senderIdFileName', file.name); // 파일명 업데이트
  } else {
    emit('uploadSenderId', null);
    emit('update:senderIdFileName', null); // 파일명 초기화
  }
}

function onProofUpload(e) {
  const file = e.target.files[0];
  if (file) {
    emit('uploadProof', file);
    emit('update:proofFileName', file.name); // 파일명 업데이트
  } else {
    emit('uploadProof', null);
    emit('update:proofFileName', null); // 파일명 초기화
  }
}

</script>

<style scoped>
/* 섹션 공통 스타일 */
.remit-info-section-v4 {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #333333;
}

.section-title-v4 {
  font-size: 26px;
  font-weight: 700;
  color: #008681; /* Deeper Green */
  margin-bottom: 28px;
  text-align: center;
}

.info-table-v4 {
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 30px;
}

/* 각 정보 행 스타일 */
.info-row-v4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #eeeeee;
}

.info-row-v4:last-child {
  border-bottom: none;
}

/* 입력 필드 라벨 */
.input-label-v4 {
  font-size: 15px;
  color: #666666;
  font-weight: 500;
  flex-basis: 40%; /* 라벨 너비 고정 */
  flex-shrink: 0;
  text-align: left;
}

/* 일반 텍스트 입력 필드 */
.input-field-v4 {
  flex-grow: 1; /* 나머지 공간 차지 */
  padding: 8px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
  color: #333333;
  width: auto;
  box-sizing: border-box;
  text-align: right;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field-v4:focus {
  outline: none;
  border-color: #009b99;
  box-shadow: 0 0 0 3px rgba(61, 153, 112, 0.1);
}

/* 라디오 버튼 그룹 */
.radio-group-row {
  display: flex; /* Flexbox를 사용하여 라벨과 그룹을 같은 줄에 */
  justify-content: space-between;
  align-items: center; /* 세로 중앙 정렬 */
  padding: 14px 20px;
  border-bottom: 1px solid #eeeeee;
}

/* 라디오 버튼 그룹 자체를 감싸는 래퍼 */
.radio-group-wrapper-v4 {
  display: flex;
  flex-wrap: wrap; /* 라디오 버튼이 여러 줄로 표시될 수 있도록 */
  gap: 12px 20px; /* 라디오 버튼 간 간격 */
  justify-content: flex-end; /* 오른쪽 정렬 */
  flex-grow: 1; /* 남은 공간 차지 */
}

.radio-label-v4 {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  color: #333333;
  font-weight: 500;
}

.radio-input-v4 {
  margin-right: 8px;
  accent-color: #009b99;
}

/* 수취인 선택 버튼 */
.action-row {
  justify-content: space-between;
}

.action-button-v4 {
  padding: 7px 10px;
  background-color: #009b99;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-width: 68px;
}

.action-button-v4:hover {
  background-color: #008681;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 선택된 수취인 정보 표시 박스 */
.selected-recipient-info {
  display: block;
  padding: 10px 20px 14px;
}

.info-details-box-v4 {
  background-color: #E6F5F4;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 12px 18px;
  font-size: 15px;
  line-height: 1.6;
  color: #333333;
}

.info-details-box-v4 p {
  margin: 3px;
  padding: 2px 0;
  text-align: center;
}

.info-details-box-v4 strong {
  color: #008681;
  padding: 3px;
}

/* 파일 업로드 필드 정렬 및 스타일 */
.file-upload-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}

.file-input-wrapper-v4 {
  display: flex;
  align-items: center;
  flex-grow: 1; /* 남은 공간 차지 */
  justify-content: flex-end; /* 내부 요소들을 오른쪽으로 정렬 */
}

/* 실제 input[type="file"]은 숨김 */
.hidden-file-input {
  display: none;
}

/* 커스텀 파일 선택 버튼 (label로 변경하여 클릭 가능하게) */
.custom-file-button-v4 {
  display: inline-block;
  padding: 7px 10px;
  background-color: #009b99; /* Green button */
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  margin-left: 10px; /* 파일 이름과의 간격 */
  flex-shrink: 0; /* 버튼이 줄어들지 않도록 */
}

.custom-file-button-v4:hover {
  background-color: #008681;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 파일 이름 표시 */
.uploaded-file-name-v4 {
  font-size: 14px;
  color: #666666;
  text-align: right;
  word-break: break-all;
  overflow: hidden; /* 긴 파일 이름 처리 */
  text-overflow: ellipsis; /* ...으로 표시 */
  white-space: nowrap; /* 한 줄로 표시 */
  max-width: 150px; /* 파일 이름 최대 너비 지정 */
  flex-shrink: 1; /* 필요시 줄어들도록 */
}

/* 미디어 쿼리 - 모바일 최적화 */
@media (max-width: 768px) {
  .remit-info-section-v4 {
    padding: 16px;
  }

  .section-title-v4 {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .info-table-v4 {
    border-radius: 8px;
  }

  .info-row-v4 {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
  }

  .input-label-v4 {
    flex-basis: auto;
    width: 100%;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .input-field-v4 {
    width: 100%;
    text-align: left;
    font-size: 15px;
    padding: 10px 12px;
  }

  .radio-group-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .radio-group-wrapper-v4 {
    width: 100%;
    justify-content: flex-start;
    margin-top: 8px;
    gap: 10px 15px;
  }

  .action-row {
    flex-direction: row;
    align-items: center;
  }

  .action-button-v4 {
    padding: 8px 15px;
    font-size: 14px;
  }

  .info-details-box-v4 {
    font-size: 14px;
    padding: 10px 15px;
  }

  /* 모바일 파일 업로드 정렬 */
  .file-upload-row {
    flex-direction: column; /* 모바일에서는 라벨과 파일 선택 부분이 세로로 쌓이도록 */
    align-items: flex-start;
  }

  .file-input-wrapper-v4 {
    width: 100%; /* 전체 너비 차지 */
    flex-direction: row; /* 파일 이름과 버튼은 가로로 유지 */
    justify-content: space-between; /* 파일 이름과 버튼을 양 끝으로 */
    margin-top: 8px;
  }

  .custom-file-button-v4 {
    margin-left: 0; /* 모바일에서 좌측 마진 제거 */
    margin-right: 0; /* 우측 마진 제거 (space-between이 처리) */
  }

  .uploaded-file-name-v4 {
    max-width: none; /* 모바일에서 파일명 전체 표시 */
    white-space: normal; /* 줄 바꿈 허용 */
    text-align: left; /* 파일명 왼쪽 정렬 */
    flex-grow: 1; /* 남은 공간 차지 */
  }
}
</style>