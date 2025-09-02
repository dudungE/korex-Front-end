<template>
  <section class="recipient-info-section-v4">
    <h2 class="section-title-v4">받는 분 정보</h2>

    <div class="info-table-v4">
      <div class="info-row-v4">
        <span class="info-label-v4">이름</span>
        <span class="info-value-v4">{{ localRecipient?.name || '-' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">송금 통화</span>
        <span class="info-value-v4">{{ localRecipient?.currency || '-' }}</span>
      </div>

      <div class="info-row-v4">
        <span class="info-label-v4">계좌번호</span>
        <span class="info-value-v4">
    {{ localRecipient?.bank ? localRecipient.bank + ' / ' : 'KOREX BANK / ' }}
    {{ localRecipient?.accountNumber || '-' }} <!-- account -> accountNumber 로 변경 -->
  </span>
      </div>

      <div class="info-row-v4 input-row">
        <label class="input-label-v4">관계 증빙 서류</label>
        <div class="file-row-v4">
          <small>예: 가족관계증명서, 기본증명서 (최대 5MB)</small>
          <input
              type="file"
              ref="relationFileInput"
              @change="onFileChange"
              multiple
              style="display:none"
          />
          <button type="button" class="file-button-v4" @click="relationFileInput.click()">파일 선택</button>
          <span class="file-names-v4">{{ relationFiles.map(f => f.name).join(', ') || '선택된 파일 없음' }}</span>
        </div>
      </div>
    </div>

    <div class="relationship-select-wrapper-v4">
      <label for="relationship-v4" class="select-label-v4">보내는 분과의 관계</label>
      <div class="custom-select-v4">
        <select id="relationship-v4" v-model="localRelationship" class="select-field-v4">
          <option value="" disabled>선택하세요</option>
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
import { ref, watch, toRefs, computed } from 'vue'

const props = defineProps({
  selectedRecipient: { type: Object, default: () => ({}) },
  relationship: { type: String, default: '' },
  relationFilesProp: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:relationship', 'update:relationFiles', 'update:isValid'])

const { selectedRecipient, relationship, relationFilesProp } = toRefs(props)

const localRecipient = ref(selectedRecipient.value)
const localRelationship = ref(relationship.value)
const relationFiles = ref(relationFilesProp.value)

const relationFileInput = ref(null)

// 유효성 검사
const isValid = computed(() => {
  return !!localRecipient.value && !!localRelationship.value;
})

// watch: 부모 prop 변경 시 로컬 상태 업데이트
watch(selectedRecipient, (newVal) => {
  if(newVal) localRecipient.value = { ...newVal }
}, { immediate: true, deep: true });

watch(relationship, (newVal) => {
  localRelationship.value = newVal;
});

watch(relationFilesProp, (newVal) => {
  relationFiles.value = newVal;
});

// watch: 로컬 상태 변경 시 부모 컴포넌트에 emit
watch(localRelationship, (newVal) => {
  emit('update:relationship', newVal);
});

watch(relationFiles, (newVal) => {
  emit('update:relationFiles', newVal);
});

// watch: isValid 변경 시 부모 컴포넌트에 알림
watch(isValid, (newVal) => {
  emit('update:isValid', newVal);
}, { immediate: true });

// 파일 선택
const onFileChange = (event) => {
  const files = Array.from(event.target.files)
  const filteredFiles = files.filter(f => {
    if (f.size > 5 * 1024 * 1024) {
      alert(`'${f.name}' 파일은 5MB를 초과하여 제외되었습니다.`)
      return false
    }
    return true
  })

  relationFiles.value = filteredFiles
}
</script>

<style scoped>
.recipient-info-section-v4 {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  font-family: 'Pretendard Variable', sans-serif;
  color: #333;
}

.section-title-v4 {
  font-size: 26px;
  font-weight: 700;
  color: #008681;
  margin-bottom: 24px;
  text-align: center;
}

/* 정보 테이블 */
.info-table-v4 {
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 24px;
}

.info-row-v4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.info-label-v4 {
  font-size: 15px;
  color: #666;
  font-weight: 500;
  flex-basis: 35%;
}

.info-value-v4 {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  text-align: right;
  flex-grow: 1;
  word-break: break-all;
}

/* 파일 업로드 */
.file-row-v4 {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  overflow: hidden;
}

.file-names-v4 {
  font-size: 14px;
  color: #555;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-button-v4 {
  padding: 8px 16px;
  background-color: #009b99;
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.file-button-v4:hover {
  background-color: #008681;
}

/* 관계 선택 */
.relationship-select-wrapper-v4 {
  margin-top: 20px;
}

.select-label-v4 {
  display: block;
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.custom-select-v4 {
  position: relative;
  width: 100%;
}

.select-field-v4 {
  width: 100%;
  padding: 12px 18px;
  border: 2px solid #009b99;
  border-radius: 8px;
  background-color: #fff;
  font-size: 16px;
  color: #009b99;
  appearance: none;
  cursor: pointer;
  font-weight: 600;
}

.select-field-v4:focus {
  outline: none;
  border-color: #008681;
  box-shadow: 0 0 0 3px rgba(61,153,112,0.2);
}

.select-field-v4 option {
  background-color: #fff;
  color: #333;
}

.select-arrow-v4 {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #008681;
}

/* 모바일 대응 */
@media(max-width: 768px) {
  .info-row-v4 {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 16px;
  }

  .info-label-v4 {
    margin-bottom: 4px;
  }

  .file-row-v4 {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .select-field-v4 {
    padding: 10px 14px;
  }
}
</style>
