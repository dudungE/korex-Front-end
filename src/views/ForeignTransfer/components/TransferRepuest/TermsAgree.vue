<template>
  <section class="terms-section-v4">
    <h2 class="section-title-v4">약관 동의</h2>

    <div class="info-table-v4 terms-table-v4">
      <div class="info-row-v4 agree-all-row">
        <button
            :class="['agree-all-button-v4', { active: agreeAll }]"
            @click="toggleAgreeAll"
            type="button"
        >
          전체 동의
        </button>
      </div>

      <div class="info-row-v4 term-item-row">
        <label :for="'agree-term-1'" class="checkbox-label-v4">
          <input type="checkbox" :id="'agree-term-1'" v-model="localAgree1" class="hidden-checkbox-v4" />
          <span class="custom-checkbox-v4"></span>
          개인정보 제3자 제공 동의
        </label>
        <button type="button" class="view-term-button-v4">약관 확인</button>
      </div>

      <div class="info-row-v4 term-item-row">
        <label :for="'agree-term-2'" class="checkbox-label-v4">
          <input type="checkbox" :id="'agree-term-2'" v-model="localAgree2" class="hidden-checkbox-v4" />
          <span class="custom-checkbox-v4"></span>
          개인정보 수집 및 이용 동의 <span class="required-text-v4">(필수)</span>
        </label>
        <button type="button" class="view-term-button-v4">약관 확인</button>
      </div>

      <div class="info-row-v4 term-item-row">
        <label :for="'agree-term-3'" class="checkbox-label-v4">
          <input type="checkbox" :id="'agree-term-3'" v-model="localAgree3" class="hidden-checkbox-v4" />
          <span class="custom-checkbox-v4"></span>
          해외 송금 서비스 이용약관<span class="required-text-v4">(필수)</span>
        </label>
        <button type="button" class="view-term-button-v4">약관 확인</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, watch, toRefs, ref } from 'vue'

const props = defineProps({
  agree1: Boolean,
  agree2: Boolean,
  agree3: Boolean,
})

const emit = defineEmits(['update:agree1', 'update:agree2', 'update:agree3'])

const { agree1, agree2, agree3 } = toRefs(props)

/* 로컬 바인딩 */
const localAgree1 = ref(agree1.value)
const localAgree2 = ref(agree2.value)
const localAgree3 = ref(agree3.value)

watch(localAgree1, (val) => emit('update:agree1', val))
watch(localAgree2, (val) => emit('update:agree2', val))
watch(localAgree3, (val) => emit('update:agree3', val))

const agreeAll = computed({
  get() {
    return localAgree1.value && localAgree2.value && localAgree3.value
  },
  set(val) {
    localAgree1.value = val
    localAgree2.value = val
    localAgree3.value = val
  },
})

function toggleAgreeAll() {
  agreeAll.value = !agreeAll.value
}

// isAgreeRequired는 더 이상 UI에 직접 표시되지 않으므로 제거합니다.
// 하지만 논리적으로는 여전히 필요할 수 있습니다 (예: 최종 제출 버튼 활성화 조건 등).
// 여기서는 UI에서만 제거하고, 만약 사용하지 않는다면 관련된 computed 속성도 제거할 수 있습니다.
// const isAgreeRequired = computed(() => localAgree1.value && localAgree2.value)

// Prop 변경 감지하여 local ref 업데이트 (외부에서 prop이 변경될 경우)
watch(agree1, (val) => { localAgree1.value = val; });
watch(agree2, (val) => { localAgree2.value = val; });
watch(agree3, (val) => { localAgree3.value = val; });

</script>

<style scoped>
/* 섹션 공통 스타일 */
.terms-section-v4 {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #333333;
  margin-bottom: 2rem; /* 다른 컴포넌트와의 간격 */
}

.section-title-v4 {
  font-size: 26px;
  font-weight: 700;
  color: #008681; /* Deeper Green */
  margin-bottom: 28px;
  text-align: center;
}

/* 정보 테이블 공통 스타일 (재활용) */
.info-table-v4 {
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 0; /* 필수 약관 문구가 없어졌으므로 마진 제거 */
  /* '전체 동의' 버튼을 위로 올리기 위해 순서 변경 */
  display: flex;
  flex-direction: column-reverse;
}

/* 각 정보 행 스타일 (재활용) */
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

/* 전체 동의 버튼 스타일 */
.agree-all-row {
  justify-content: flex-end; /* **버튼을 오른쪽으로 배치** */
  padding: 18px 20px; /* 상하 패딩을 더 넓게 */
  background-color: #f0f0f0; /* 배경색을 약간 다르게 */
  font-weight: 600;
  border-top: 1px solid #e0e0e0; /* 순서가 바뀌었으므로 border-top */
  border-bottom: none; /* 기존 border-bottom 제거 */
}

.agree-all-button-v4 {
  padding: 10px 20px; /* **크기 약간 줄임** */
  background-color: #dcdcdc; /* Default grey */
  color: #666666;
  border: none;
  border-radius: 8px;
  font-size: 16px; /* **폰트 크기 줄임** */
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  width: auto; /* 내용에 따라 너비 조절 */
  max-width: 200px; /* **최대 너비 제한** */
}

.agree-all-button-v4.active {
  background-color: #009b99; /* Green when active */
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(61, 153, 112, 0.2);
}

.agree-all-button-v4:hover:not(.active) {
  background-color: #cccccc;
}

/* 개별 약관 동의 아이템 스타일 */
.term-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label-v4 {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #333333;
  font-weight: 500;
  flex-grow: 1; /* 라벨이 남은 공간을 차지하도록 */
}

/* 기본 체크박스 숨기기 */
.hidden-checkbox-v4 {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 커스텀 체크박스 스타일 */
.custom-checkbox-v4 {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid #ccc;
  border-radius: 6px; /* 둥근 사각형 */
  margin-right: 12px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0; /* 체크박스가 줄어들지 않도록 */
  background-color: #ffffff;
}

/* 체크될 때 커스텀 체크박스 스타일 */
.hidden-checkbox-v4:checked + .custom-checkbox-v4 {
  background-color: #009b99; /* Green background */
  border-color: #009b99;
}

/* 체크 마크 (SVG 아이콘이나 폰트 아이콘 사용 권장) */
.hidden-checkbox-v4:checked + .custom-checkbox-v4::after {
  content: '✓'; /* 유니코드 체크 마크 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
}

/* 약관 옆 (필수) 텍스트 스타일 */
.required-text-v4 {
  font-size: 14px; /* 본문 텍스트보다 살짝 작게 */
  color: #d9534f; /* 붉은색 계열로 강조 */
  margin-left: 6px; /* 약관 텍스트와 간격 */
  font-weight: 600;
}


/* 약관 확인 버튼 */
.view-term-button-v4 {
  padding: 8px 15px;
  background-color: #e0e0e0; /* Light grey button */
  color: #666666;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.view-term-button-v4:hover {
  background-color: #cccccc;
}

/* 필수 약관 모두 동의 필요 메시지 (삭제) */
/* .required-terms-info-v4, .disabled-checkbox-v4, .required-label-v4 관련 스타일 모두 제거 */


/* 미디어 쿼리 - 모바일 최적화 */
@media (max-width: 768px) {
  .terms-section-v4 {
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
    padding: 12px 16px;
    flex-wrap: wrap; /* 모바일에서 내용이 길어질 경우 줄 바꿈 */
  }

  .agree-all-row {
    padding: 15px 16px;
    justify-content: center; /* 모바일에서는 중앙 정렬 */
  }

  .agree-all-button-v4 {
    font-size: 16px;
    padding: 10px 20px;
    width: 100%; /* 모바일에서는 너비 100% */
    max-width: none; /* 모바일에서는 최대 너비 제한 없음 */
  }

  .term-item-row {
    flex-direction: column; /* 모바일에서 세로로 쌓이도록 */
    align-items: flex-start;
  }

  .checkbox-label-v4 {
    font-size: 15px;
    width: 100%; /* 라벨이 전체 너비 차지 */
    margin-bottom: 10px; /* 버튼과의 간격 */
  }

  .custom-checkbox-v4 {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .hidden-checkbox-v4:checked + .custom-checkbox-v4::after {
    font-size: 15px;
  }

  .view-term-button-v4 {
    width: 100%; /* 버튼이 전체 너비 차지 */
    padding: 10px 15px;
    font-size: 14px;
  }

  .required-text-v4 {
    font-size: 13px; /* 모바일에서 더 작게 */
    margin-left: 4px;
  }

  /* 필수 약관 모두 동의 필요 메시지 (삭제됨) */
  /* .required-terms-info-v4 관련 스타일 모두 제거 */
}
</style>