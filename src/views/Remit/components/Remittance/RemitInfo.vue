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
          <p><strong>수취인 이름:</strong> {{ selectedRecipient.name }}</p>
          <p><strong>은행명:</strong> {{ selectedRecipient.bank }}</p>
          <p><strong>계좌번호:</strong> {{ selectedRecipient.account }}</p>
        </div>
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-phone" class="input-label-v4">보내는 분 핸드폰 번호(- 제외)</label>
        <input
            type="tel"
            id="sender-phone"
            v-model="localSenderPhone"
            class="input-field-v4"
            placeholder="01012345678"
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
        <label for="sender-city" class="input-label-v4">보내는 분 주소 (도시)</label>
        <input
            type="text"
            id="sender-city"
            v-model="localSenderCity"
            class="input-field-v4"
            placeholder="서울특별시"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-region" class="input-label-v4">보내는 분 주소 (지역)</label>
        <input
            type="text"
            id="sender-region"
            v-model="localSenderRegion"
            class="input-field-v4"
            placeholder="강남구"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-district" class="input-label-v4">보내는 분 주소 (동/면/리)</label>
        <input
            type="text"
            id="sender-district"
            v-model="localSenderDistrict"
            class="input-field-v4"
            placeholder="역삼동"
        />
      </div>

      <div class="info-row-v4 input-row">
        <label for="sender-detail-address" class="input-label-v4">보내는 분 주소 (상세 주소)</label>
        <input
            type="text"
            id="sender-detail-address"
            v-model="localSenderDetailAddress"
            class="input-field-v4"
            placeholder="테헤란로 123-45, 1205호"
        />
      </div>

      <div class="info-row-v4 file-upload-row">
        <label class="input-label-v4">보내는 분 신분증 업로드</label>
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
        <label class="input-label-v4">송금 목적 증빙 서류 업로드</label>
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
  senderCity: String,
  senderRegion: String,
  senderDistrict: String,
  senderDetailAddress: String,
  senderIdFileName: String, // 파일 이름 표시용 prop
  proofFileName: String, // 파일 이름 표시용 prop
})

const emit = defineEmits([
  'update:senderName',
  'update:selectedReason',
  'update:selectedRecipient',
  'update:senderPhone',
  'update:senderEmail',
  'update:senderCity',
  'update:senderRegion',
  'update:senderDistrict',
  'update:senderDetailAddress',
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
const localSenderCity = ref(props.senderCity)
const localSenderRegion = ref(props.senderRegion)
const localSenderDistrict = ref(props.senderDistrict)
const localSenderDetailAddress = ref(props.senderDetailAddress)

watch(localSenderName, (val) => emit('update:senderName', val))
watch(localSelectedReason, (val) => emit('update:selectedReason', val))
watch(localSenderPhone, (val) => emit('update:senderPhone', val))
watch(localSenderEmail, (val) => emit('update:senderEmail', val))
watch(localSenderCity, (val) => emit('update:senderCity', val))
watch(localSenderRegion, (val) => emit('update:senderRegion', val))
watch(localSenderDistrict, (val) => emit('update:senderDistrict', val))
watch(localSenderDetailAddress, (val) => emit('update:senderDetailAddress', val))

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
    emit('update:senderIdFileName', file.name); // 파일 이름 업데이트
  } else {
    emit('update:senderIdFileName', ''); // 파일 선택 취소 시 초기화
  }
}

function onProofUpload(e) {
  const file = e.target.files[0];
  if (file) {
    emit('uploadProof', file); // 실제 파일 객체 전송
    emit('update:proofFileName', file.name); // 파일 이름 업데이트
  } else {
    emit('update:proofFileName', ''); // 파일 선택 취소 시 초기화
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
  color: #1a7a4f; /* Deeper Green */
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
  border-color: #3d9970;
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
  accent-color: #3d9970;
}

/* 수취인 선택 버튼 */
.action-row {
  justify-content: space-between;
}

.action-button-v4 {
  padding: 10px 18px;
  background-color: #3d9970;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-width: 80px;
}

.action-button-v4:hover {
  background-color: #2e8b57;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 선택된 수취인 정보 표시 박스 */
.selected-recipient-info {
  display: block;
  padding: 10px 20px 14px;
}

.info-details-box-v4 {
  background-color: #f5fff5;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 12px 18px;
  font-size: 15px;
  line-height: 1.6;
  color: #333333;
}

.info-details-box-v4 p {
  margin: 0;
  padding: 2px 0;
}

.info-details-box-v4 strong {
  color: #1a7a4f;
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
  padding: 8px 15px;
  background-color: #3d9970; /* Green button */
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
  background-color: #2e8b57;
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