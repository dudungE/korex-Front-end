<template>
  <section class="recipient-info-section-v4">
    <h2 class="section-title-v4">받는 분 정보</h2>

    <div class="info-table-v4">
      <div class="info-row-v4">
        <span class="info-label-v4">송금 통화</span>
        <span class="info-value-v4">{{ selectedRecipient?.currency || '불러오기 오류' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">거주 국가</span>
        <span class="info-value-v4">{{ selectedRecipient?.addressCountry || '불러오기 오류' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">영문 주소</span>
        <span class="info-value-v4">{{ selectedRecipient?.addressDetail || '불러오기 오류' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">계좌번호</span>
        <span class="info-value-v4">
          {{ selectedRecipient?.bank || '불러오기 오류' }} /
          {{ selectedRecipient?.account || '불러오기 오류' }}
        </span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">핸드폰 번호</span>
        <span class="info-value-v4">{{ selectedRecipient?.phone || '불러오기 오류' }}</span>
      </div>

      <!-- 수취인 관계 증명 서류 업로드 -->
      <div class="info-row-v4 file-upload-row-v4">
        <span class="info-label-v4">관계 증빙 서류</span>
        <div class="file-upload-wrapper-v4">
          <small class="file-desc-v4">예) 가족관계증명서, 기본증명서</small>
          <span class="file-name-v4">{{ fileName || '선택된 파일 없음' }}</span>
          <label for="relation-proof-file" class="file-label-v4">파일 선택</label>
          <input type="file" id="relation-proof-file" class="file-input-v4" @change="handleFileUpload" />
        </div>
      </div>
    </div>

    <div class="relationship-select-wrapper-v4">
      <label for="relationship-v4" class="select-label-v4">보내는 분과의 관계</label>
      <div class="custom-select-v4">
        <select id="relationship-v4" v-model="localRelationship" class="select-field-v4">
          <option value="" disabled selected>선택하세요</option>
          <option value="my">본인</option>
          <option value="family">가족</option>
          <option value="other">기타</option>
        </select>
        <div class="select-arrow-v4"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  selectedRecipient: {
    type: Object,
    default: null,
  },
  relationship: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:relationship', 'file-selected']);

const localRelationship = ref(props.relationship);
const fileName = ref('');

watch(localRelationship, (val) => {
  emit('update:relationship', val);
});

watch(
    () => props.relationship,
    (val) => {
      if (val !== localRelationship.value) {
        localRelationship.value = val;
      }
    }
);

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  fileName.value = file ? file.name : '';
  emit('file-selected', file);
};
</script>

<style scoped>
.recipient-info-section-v4 {
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
  color: #008681;
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

.info-label-v4 {
  font-size: 15px;
  color: #666666;
  font-weight: 500;
  flex-basis: 40%;
  flex-shrink: 0;
}

.info-value-v4 {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
  text-align: right;
  flex-grow: 1;
  word-break: break-all;
}

/* 파일 업로드 */
.file-upload-wrapper-v4 {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
  flex-wrap: nowrap;
  overflow: hidden;
}

.file-desc-v4 {
  font-size: 12px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
}

.file-name-v4 {
  font-size: 14px;
  color: #555;
  font-style: italic;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.file-label-v4 {
  padding: 8px 16px;
  background-color: #009b99;
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.3s;
}

.file-label-v4:hover {
  background-color: #008681;
}

.file-input-v4 {
  display: none;
}

.relationship-select-wrapper-v4 {
  margin-top: 25px;
}

.select-label-v4 {
  display: block;
  font-size: 16px;
  color: #333333;
  margin-bottom: 10px;
  font-weight: 600;
}

.custom-select-v4 {
  position: relative;
  width: 100%;
}

.select-field-v4 {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid #009b99;
  border-radius: 10px;
  background-color: #ffffff;
  font-size: 17px;
  color: #009b99;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-weight: 600;
}

.select-field-v4:focus {
  outline: none;
  border-color: #008681;
  box-shadow: 0 0 0 4px rgba(61, 153, 112, 0.2);
}

.select-field-v4 option {
  background-color: #ffffff;
  color: #333333;
}

.select-arrow-v4 {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #008681;
}
</style>
