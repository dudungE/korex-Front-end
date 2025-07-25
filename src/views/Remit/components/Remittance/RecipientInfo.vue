<template>
  <section class="recipient-info-section-v4">
    <h2 class="section-title-v4">받는 분 정보</h2>

    <div class="info-table-v4">
      <div class="info-row-v4">
        <span class="info-label-v4">송금 통화</span>
        <span class="info-value-v4">{{ selectedRecipient?.currency || '선택 안 됨' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">주소 (국가)</span>
        <span class="info-value-v4">{{ selectedRecipient?.addressCountry || '선택 안 됨' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">주소 (도시/지역)</span>
        <span class="info-value-v4">{{ selectedRecipient?.addressCity || '선택 안 됨' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">주소 (세부주소)</span>
        <span class="info-value-v4">{{ selectedRecipient?.addressDetail || '선택 안 됨' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">계좌번호</span>
        <span class="info-value-v4">
          {{ selectedRecipient?.bank || '선택 안 됨' }} /
          {{ selectedRecipient?.account || '선택 안 됨' }}
        </span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">핸드폰 번호</span>
        <span class="info-value-v4">{{ selectedRecipient?.phone || '선택 안 됨' }}</span>
      </div>
    </div>

    <div class="relationship-select-wrapper-v4">
      <label for="relationship-v4" class="select-label-v4">보내는 분과의 관계</label>
      <div class="custom-select-v4">
        <select id="relationship-v4" v-model="localRelationship" class="select-field-v4">
          <option value="" disabled selected>선택하세요</option>
          <option value="family">가족</option>
          <option value="friend">친구</option>
          <option value="colleague">동료</option>
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

const emit = defineEmits(['update:relationship']);

const localRelationship = ref(props.relationship);

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
  color: #1a7a4f; /* Deeper Green */
  margin-bottom: 28px;
  text-align: center;
}

.info-table-v4 {
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  overflow: hidden; /* Ensures rounded corners apply to inner rows */
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
  flex-basis: 40%; /* Adjust as needed */
  flex-shrink: 0;
}

.info-value-v4 {
  font-size: 16px;
  color: #333333;
  font-weight: 600; /* Slightly bolder for values */
  text-align: right;
  flex-grow: 1;
  word-break: break-all;
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
  border: 2px solid #3d9970; /* Vibrant Green Border */
  border-radius: 10px;
  background-color: #ffffff; /* Changed to white */
  font-size: 17px;
  color: #2e8b57; /* Darker green text for the selected value */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  font-weight: 600;
}

.select-field-v4:focus {
  outline: none;
  border-color: #4CAF50; /* Brighter green on focus */
  box-shadow: 0 0 0 4px rgba(61, 153, 112, 0.2);
  background-color: #ffffff; /* Remains white on focus */
}

/* Option elements inside the select can also be styled for consistency */
.select-field-v4 option {
  background-color: #ffffff; /* White background for options */
  color: #333333; /* Dark text for options */
}

.select-arrow-v4 {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  pointer-events: none;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #3d9970; /* Green arrow */
}
</style>