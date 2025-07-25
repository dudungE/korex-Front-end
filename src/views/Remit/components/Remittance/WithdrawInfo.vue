<template>
  <section class="withdraw-info-section-v4">
    <h2 class="section-title-v4">출금 및 송금금액 정보</h2>

    <div class="info-table-v4">
      <div class="info-row-v4 radio-group-row compact-radio-group-row">
        <label class="input-label-v4">출금 계좌 선택</label>
        <div class="radio-group-wrapper-v4">
          <label class="radio-label-v4">
            <input type="radio" value="KRW" v-model="localWithdrawAccountType" class="radio-input-v4" />
            원화출금계좌
          </label>
          <label class="radio-label-v4">
            <input type="radio" value="FX" v-model="localWithdrawAccountType" class="radio-input-v4" />
            외화출금계좌
          </label>
          <label class="radio-label-v4">
            <input type="radio" value="BOTH" v-model="localWithdrawAccountType" class="radio-input-v4" />
            원화+외화출금계좌
          </label>
        </div>
      </div>

      <div v-if="localWithdrawAccountType === 'KRW' || localWithdrawAccountType === 'BOTH'"
           :class="['krw-withdraw-form', {'no-top-border': localWithdrawAccountType === 'KRW'}]">
        <div class="info-row-v4 select-row">
          <label for="krw-account-select" class="input-label-v4">원화출금계좌</label>
          <div class="select-wrapper-v4">
            <select
                id="krw-account-select"
                v-model="localSelectedKrwAccount"
                class="select-field-v4"
            >
              <option value="" disabled>계좌를 선택하세요</option> <option v-for="acc in krwAccounts" :key="acc.accountNumber" :value="acc.accountNumber">
              {{ acc.accountNumber }} [원화출금]
            </option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">잔액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">{{ formatCurrency(krwBalance, '원') }}</span>
            <button type="button" @click="fetchBalance('KRW')" class="action-button-v4 small-button">
              잔액조회
            </button>
          </div>
        </div>

        <div class="info-row-v4 radio-group-row">
          <label class="input-label-v4">환전 기준</label>
          <div class="radio-group-wrapper-v4">
            <label class="radio-label-v4">
              <input type="radio" value="USD" v-model="krwBasis" class="radio-input-v4" />
              USD 기준
            </label>
            <label class="radio-label-v4">
              <input type="radio" value="KRW" v-model="krwBasis" class="radio-input-v4" />
              원화(KRW) 기준
            </label>
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="krw-usd-amount" class="input-label-v4">
            출금 금액 ({{ krwBasis === 'USD' ? 'USD' : '원화' }})
          </label>
          <input
              type="number"
              id="krw-usd-amount"
              v-model.number="krwAmountInput"
              class="input-field-v4 text-right"
              placeholder="0"
          />
        </div>

        <div class="info-row-v4 description-row">
          <p class="description-text-v4" v-if="krwBasis === 'USD'">
            <span class="bullet-point"></span> 외화기준: 입력한 USD 금액으로 환전되어 출금 및 송금됩니다.
          </p>
          <p class="description-text-v4" v-else-if="krwBasis === 'KRW'">
            <span class="bullet-point"></span> 원화기준: 원화(KRW) 금액이 출금되어 USD로 환전 후 송금됩니다.
          </p>
        </div>

        <div class="info-row-v4 input-row">
          <label for="krw-password" class="input-label-v4">원화출금계좌 비밀번호</label>
          <input
              type="password"
              id="krw-password"
              v-model="localKrwPassword"
              maxlength="4"
              class="input-field-v4 text-right"
              placeholder="숫자 4자리"
          />
        </div>
      </div>

      <div v-if="localWithdrawAccountType === 'FX' || localWithdrawAccountType === 'BOTH'"
           :class="['fx-withdraw-form', {'no-top-border': localWithdrawAccountType === 'FX'}]">
        <div class="info-row-v4 select-row">
          <label for="fx-account-select" class="input-label-v4">외화출금계좌</label>
          <div class="select-wrapper-v4">
            <select
                id="fx-account-select"
                v-model="localSelectedFxAccount"
                class="select-field-v4"
            >
              <option value="" disabled>계좌를 선택하세요</option>
              <option v-for="acc in fxAccounts" :key="acc.accountNumber" :value="acc.accountNumber">
                {{ acc.accountNumber }} [외화출금]
              </option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">잔액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">{{ formatCurrency(fxBalance, 'USD') }}</span>
            <button type="button" @click="fetchBalance('FX')" class="action-button-v4 small-button">
              잔액조회
            </button>
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="fx-amount" class="input-label-v4">출금 금액 (외화)</label>
          <input
              type="number"
              id="fx-amount"
              v-model.number="localFxAmount"
              class="input-field-v4 text-right"
              placeholder="0"
          />
        </div>

        <div class="info-row-v4 input-row">
          <label for="fx-password" class="input-label-v4">외화출금계좌 비밀번호</label>
          <input
              type="password"
              id="fx-password"
              v-model="localFxPassword"
              maxlength="4"
              class="input-field-v4 text-right"
              placeholder="숫자 4자리"
          />
        </div>
      </div>

      <div class="fee-withdraw-form">
        <div class="info-row-v4 select-row">
          <label for="fee-account-select" class="input-label-v4">수수료출금계좌</label>
          <div class="select-wrapper-v4">
            <select
                id="fee-account-select"
                v-model="localSelectedFeeAccount"
                class="select-field-v4"
            >
              <option value="" disabled>계좌를 선택하세요</option>
              <option v-for="acc in feeAccounts" :key="acc.accountNumber" :value="acc.accountNumber">
                {{ acc.accountNumber }} [수수료출금]
              </option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">잔액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">{{ formatCurrency(feeBalance, '원') }}</span>
            <button type="button" @click="fetchBalance('FEE')" class="action-button-v4 small-button">
              잔액조회
            </button>
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="fee-password" class="input-label-v4">수수료출금계좌 비밀번호</label>
          <input
              type="password"
              id="fee-password"
              v-model="localFeePassword"
              maxlength="4"
              class="input-field-v4 text-right"
              placeholder="숫자 4자리"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, toRefs, onMounted } from 'vue'

const props = defineProps({
  // 부모로부터 받는 v-model props
  withdrawAccountType: {
    type: String,
    default: 'KRW',
  },
  selectedWithdrawAccount: {
    type: String,
    default: '',
  },
  withdrawAmount: {
    type: Number,
    default: 0,
  },
  withdrawAccountPassword: {
    type: String,
    default: '',
  },
  isValid: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:withdrawAccountType',
  'update:selectedWithdrawAccount',
  'update:withdrawAmount',
  'update:withdrawAccountPassword',
  'update:isValid',
  'checkBalance',
  'openCalculator',
])

const { withdrawAccountType, selectedWithdrawAccount, withdrawAmount, withdrawAccountPassword, isValid } = toRefs(props)

// 내부 상태를 위한 로컬 ref
const localWithdrawAccountType = ref(withdrawAccountType.value)
const localSelectedKrwAccount = ref('')
const localSelectedFxAccount = ref('')
const localSelectedFeeAccount = ref('')

// 각 계좌 리스트 (샘플 데이터)
const krwAccounts = ref([
  { accountNumber: '001-000550-1231' },
  { accountNumber: '001-000550-4567' },
])
const fxAccounts = ref([
  { accountNumber: '001-000550-1232' },
  { accountNumber: '001-000550-8901' },
])
const feeAccounts = ref([
  { accountNumber: '001-000550-1233' },
  { accountNumber: '001-000550-2345' },
])

// 잔액 (초기값 0)
const krwBalance = ref(0)
const fxBalance = ref(0)
const feeBalance = ref(0)

// 출금 금액 및 비밀번호
const krwAmountInput = ref(0)
const localFxAmount = ref(0)
const localKrwPassword = ref('')
const localFxPassword = ref('')
const localFeePassword = ref('')

// 원화기준 / 외화기준
const krwBasis = ref('USD')

// 폼이 한 번이라도 제출 시도되었는지 여부 (에러 메시지 표시 시점 제어)
// 빨간색 테두리를 없애려면 이 변수가 더 이상 is-invalid 클래스에 사용되지 않습니다.
const formSubmitted = ref(false)


// ====================================================================
// Computed 속성들을 여기, 모든 ref 변수 선언 직후에 배치합니다.
// 이들이 다른 watch나 로직보다 먼저 정의되어야 합니다.
// ====================================================================

// 각 필드 유효성 검사 (Computed)
const isKrwAccountValid = computed(() => !!localSelectedKrwAccount.value)
const isKrwAmountValid = computed(() => krwAmountInput.value > 0)
const isKrwPasswordValid = computed(() => localKrwPassword.value.length === 4)

const isFxAccountValid = computed(() => !!localSelectedFxAccount.value)
const isFxAmountValid = computed(() => localFxAmount.value > 0)
const isFxPasswordValid = computed(() => localFxPassword.value.length === 4)

const isFeeAccountValid = computed(() => !!localSelectedFeeAccount.value)
const isFeePasswordValid = computed(() => localFeePassword.value.length === 4)


// 폼 전체 유효성 검사 (Computed)
const isFormValid = computed(() => {
  let valid = true;

  if (localWithdrawAccountType.value === 'KRW') {
    valid = isKrwAccountValid.value && isKrwAmountValid.value && isKrwPasswordValid.value;
  } else if (localWithdrawAccountType.value === 'FX') {
    valid = isFxAccountValid.value && isFxAmountValid.value && isFxPasswordValid.value;
  } else if (localWithdrawAccountType.value === 'BOTH') {
    valid = (isKrwAccountValid.value && isKrwAmountValid.value && isKrwPasswordValid.value) &&
        (isFxAccountValid.value && isFxAmountValid.value && isFxPasswordValid.value);
  } else {
    valid = false;
  }

  valid = valid && isFeeAccountValid.value && isFeePasswordValid.value;
  return valid;
})

// 부모에게 전달할 최종 값 결정 (v-model 연결용)
// 이 computed는 내부 ref에 의존하고, watch를 통해 부모로 emit됩니다.
const currentSelectedWithdrawAccount = computed(() => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    return localSelectedKrwAccount.value;
  } else if (localWithdrawAccountType.value === 'FX') {
    return localSelectedFxAccount.value;
  }
  return '';
});

const currentWithdrawAmount = computed(() => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    return krwAmountInput.value;
  } else if (localWithdrawAccountType.value === 'FX') {
    return localFxAmount.value;
  }
  return 0;
});

const currentWithdrawAccountPassword = computed(() => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    return localKrwPassword.value;
  } else if (localWithdrawAccountType.value === 'FX') {
    return localFxPassword.value;
  }
  return '';
});

// ====================================================================
// Computed 속성 위치 조정 완료
// ====================================================================


// 컴포넌트 마운트 시 또는 계좌 목록 로드 후 기본 선택
// 이 watch는 local 계좌 ref가 변경될 때마다 실행되며,
// computed 변수를 직접 참조하지 않고, local ref에만 의존합니다.
watch([krwAccounts, fxAccounts, feeAccounts], ([newKrw, newFx, newFee]) => {
  if (newKrw.length > 0 && !localSelectedKrwAccount.value) {
    localSelectedKrwAccount.value = newKrw[0].accountNumber;
  }
  if (newFx.length > 0 && !localSelectedFxAccount.value) {
    localSelectedFxAccount.value = newFx[0].accountNumber;
  }
  if (newFee.length > 0 && !localSelectedFeeAccount.value) {
    localSelectedFeeAccount.value = newFee[0].accountNumber;
  }
}, { immediate: true });


// Watchers for emitting updates to parent
// 이제 이 emit들은 currentSelectedWithdrawAccount 등의 computed에 의존하지 않고,
// 해당 값을 구성하는 local ref 또는 computed 값을 직접 watch하여 emit합니다.
watch(localWithdrawAccountType, (newVal) => {
  emit('update:withdrawAccountType', newVal);
  // formSubmitted.value = false; // 빨간색 테두리 없애므로 이 초기화는 더 이상 필요 없습니다.
});

// localSelectedKrwAccount 또는 localSelectedFxAccount가 변경될 때마다 부모에게 업데이트
watch([localSelectedKrwAccount, localSelectedFxAccount, localWithdrawAccountType], () => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    emit('update:selectedWithdrawAccount', localSelectedKrwAccount.value);
  } else if (localWithdrawAccountType.value === 'FX') {
    emit('update:selectedWithdrawAccount', localSelectedFxAccount.value);
  } else {
    emit('update:selectedWithdrawAccount', ''); // 선택된 타입이 없으면 빈 값 전달
  }
});

// krwAmountInput 또는 localFxAmount가 변경될 때마다 부모에게 업데이트
watch([krwAmountInput, localFxAmount, localWithdrawAccountType], () => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    emit('update:withdrawAmount', krwAmountInput.value);
  } else if (localWithdrawAccountType.value === 'FX') {
    emit('update:withdrawAmount', localFxAmount.value);
  } else {
    emit('update:withdrawAmount', 0); // 선택된 타입이 없으면 0 전달
  }
});

// localKrwPassword 또는 localFxPassword가 변경될 때마다 부모에게 업데이트
watch([localKrwPassword, localFxPassword, localWithdrawAccountType], () => {
  if (localWithdrawAccountType.value === 'KRW' || localWithdrawAccountType.value === 'BOTH') {
    emit('update:withdrawAccountPassword', localKrwPassword.value);
  } else if (localWithdrawAccountType.value === 'FX') {
    emit('update:withdrawAccountPassword', localFxPassword.value);
  } else {
    emit('update:withdrawAccountPassword', ''); // 선택된 타입이 없으면 빈 값 전달
  }
});


// 폼 유효성 변경 시 부모에게 전달
watch(isFormValid, (newVal) => {
  emit('update:isValid', newVal);
}, { immediate: true });

// Watch props to update local refs if parent changes them (for initial load or external changes)
watch(withdrawAccountType, (val) => { localWithdrawAccountType.value = val; });

// 잔액 조회 함수 (임시 예시)
function fetchBalance(accountType) {
  // formSubmitted.value = true; // 빨간색 테두리 없애므로 이 설정은 더 이상 필요 없습니다.

  if (accountType === 'KRW') {
    if (isKrwAccountValid.value) {
      krwBalance.value = 5000000;
    } else {
      krwBalance.value = 0;
    }
  } else if (accountType === 'FX') {
    if (isFxAccountValid.value) {
      fxBalance.value = 1200;
    } else {
      fxBalance.value = 0;
    }
  } else if (accountType === 'FEE') {
    if (isFeeAccountValid.value) {
      feeBalance.value = 10000;
    } else {
      feeBalance.value = 0;
    }
  }
}

// 금액 포맷팅 헬퍼 함수
function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined) return `0 ${currency}`;
  return `${amount.toLocaleString()} ${currency}`;
}

const triggerValidation = () => {
  formSubmitted.value = true; // 이 함수를 계속 사용한다면, formSubmitted는 여전히 유용할 수 있습니다.
  // 예를 들어, 필드에 빨간색 테두리 대신 경고 메시지를 표시할 때 사용될 수 있습니다.
  // 현재는 빨간색 테두리를 없애는 목적이므로, 이 부분의 영향은 없습니다.
  return isFormValid.value;
}

defineExpose({
  triggerValidation
});

</script>

<style scoped>
/* (이전과 동일한 CSS 스타일) */
/* 섹션 공통 스타일 */
.withdraw-info-section-v4 {
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

/* 정보 테이블 공통 스타일 */
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

/* '출금 계좌 선택' 첫 번째 info-row-v4의 border-bottom 제거 (이것이 이제 첫 번째 행) */
.info-table-v4 .info-row-v4:first-child {
  border-bottom: none;
}


/* 입력 필드 라벨 */
.input-label-v4 {
  font-size: 15px;
  color: #666666;
  font-weight: 500;
  flex-basis: 40%;
  flex-shrink: 0;
  text-align: left;
}

/* 일반 텍스트/숫자 입력 필드 */
.input-field-v4, .select-field-v4 {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
  color: #333333;
  width: auto;
  box-sizing: border-box;
  text-align: right; /* 기본적으로 오른쪽 정렬 */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field-v4:focus, .select-field-v4:focus {
  outline: none;
  border-color: #3d9970;
  box-shadow: 0 0 0 3px rgba(61, 153, 112, 0.1);
}

.input-field-v4.text-right {
  text-align: right; /* 숫자 입력 필드용 */
}

/* 라디오 버튼 그룹 */
.radio-group-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.radio-group-wrapper-v4 {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  justify-content: flex-end;
  flex-grow: 1;
}

/* '출금 계좌 선택' 라디오 버튼을 한 줄로 */
.radio-group-row.compact-radio-group-row .radio-group-wrapper-v4 {
  flex-wrap: nowrap; /* 줄바꿈 방지 */
  gap: 10px; /* 라디오 버튼 간 간격 줄임 */
  overflow-x: auto; /* 내용이 넘칠 경우 스크롤 허용 */
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
  padding-bottom: 5px; /* 스크롤바 공간 확보 (스크롤바 표시될 경우) */
}

.radio-group-row.compact-radio-group-row .radio-label-v4 {
  flex-shrink: 0; /* 라디오 버튼이 줄어들지 않도록 */
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

/* 셀렉트 박스 스타일 */
.select-wrapper-v4 {
  flex-grow: 1;
  display: flex; /* 내부 select를 flex로 감싸서 정렬 */
  justify-content: flex-end; /* 오른쪽 정렬 */
}

.select-field-v4 {
  /* 기존 스타일 유지 */
  max-width: 250px; /* 최대 너비 유지 */
  background-color: #ffffff;
  cursor: pointer;
  appearance: none; /* 기본 화살표 제거 */
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%23666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
}


/* 잔액 조회 버튼 및 잔액 표시 */
.action-row {
  justify-content: space-between;
}

.action-display-group-v4 {
  display: flex;
  align-items: center;
  gap: 15px; /* 잔액과 버튼 사이 간격 */
  flex-grow: 1;
  justify-content: flex-end; /* 오른쪽 정렬 */
}

.balance-display-v4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a7a4f; /* 초록색으로 잔액 강조 */
  white-space: nowrap; /* 줄 바꿈 방지 */
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.action-button-v4.small-button {
  padding: 7px 12px; /* 잔액조회 버튼 크기 조정 */
  font-size: 14px;
  min-width: auto;
}

.action-button-v4:hover {
  background-color: #2e8b57;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 설명 텍스트 */
.description-row {
  justify-content: flex-end; /* 텍스트를 오른쪽으로 정렬 */
  align-items: flex-start; /* 상단 정렬 (여러 줄일 경우) */
  padding-top: 5px; /* 위쪽 행과의 간격 */
  padding-bottom: 5px; /* 아래쪽 행과의 간격 */
  border-bottom: none; /* 설명 문구 아래에는 선 없음 */
}

.description-text-v4 {
  font-size: 13px;
  color: #777777;
  margin: 0;
  padding-left: 10px; /* 불릿 포인트와의 간격 */
  text-align: right;
  flex-basis: 60%; /* 오른쪽 영역에서 차지할 비율 */
  line-height: 1.5;
  position: relative;
}

.description-text-v4 .bullet-point {
  display: inline-block;
  width: 5px;
  height: 5px;
  background-color: #777777;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 8px; /* 텍스트 중간에 맞추기 */
}

/* 각 폼 그룹 (KRW, FX, FEE) 간의 간격 */
.krw-withdraw-form, .fx-withdraw-form, .fee-withdraw-form {
  border-top: 1px solid #e0e0e0; /* 각 폼 시작에 구분선 */
  margin-top: 20px;
  padding-top: 10px;
}

/* 특정 폼의 상단 테두리 제거 (조건부) */
/* 선택된 출금 계좌 타입에 따라 첫 번째로 나타나는 폼의 상단 테두리 제거 */
.krw-withdraw-form.no-top-border,
.fx-withdraw-form.no-top-border {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}


/* 미디어 쿼리 - 모바일 최적화 */
@media (max-width: 768px) {
  .withdraw-info-section-v4 {
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

  /* 모바일에서 첫 번째 info-row-v4의 border-bottom 제거 */
  .info-table-v4 .info-row-v4:first-child {
    border-bottom: none;
  }


  .input-label-v4 {
    flex-basis: auto;
    width: 100%;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .input-field-v4,
  .select-field-v4 {
    width: 100%;
    text-align: left; /* 모바일에서는 왼쪽 정렬 */
    font-size: 15px;
    padding: 10px 12px;
    max-width: none; /* 모바일에서 최대 너비 제한 해제 */
  }

  /* '출금 계좌 선택' 라디오 버튼 모바일 */
  .radio-group-row.compact-radio-group-row .radio-group-wrapper-v4 {
    flex-wrap: nowrap; /* 줄바꿈 방지 */
    width: 100%; /* 전체 너비 사용 */
    justify-content: flex-start; /* 왼쪽 정렬 */
    gap: 10px;
  }

  .radio-group-wrapper-v4 {
    width: 100%;
    justify-content: flex-start;
    margin-top: 8px;
    gap: 10px 15px;
  }

  .action-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-display-group-v4 {
    width: 100%;
    justify-content: space-between; /* 잔액과 버튼 양 끝 정렬 */
    margin-top: 8px;
    gap: 0; /* 모바일에서 간격 재설정 */
  }

  .balance-display-v4 {
    font-size: 15px;
  }

  .action-button-v4 {
    padding: 8px 15px;
    font-size: 14px;
    width: auto;
    min-width: 80px; /* 버튼 최소 너비 유지 */
  }

  .action-button-v4.small-button {
    padding: 8px 15px; /* 모바일에서는 일관된 크기 */
    font-size: 14px;
  }

  .description-row {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .description-text-v4 {
    width: 100%;
    text-align: left;
    padding-left: 15px; /* 불릿 포인트와 텍스트 간격 */
    font-size: 13px;
    line-height: 1.4;
  }

  .description-text-v4 .bullet-point {
    left: 5px;
    top: 6px;
  }

  .krw-withdraw-form, .fx-withdraw-form, .fee-withdraw-form {
    margin-top: 15px;
    padding-top: 15px;
  }

  /* 모바일에서 첫 번째 폼의 border-top 제거 */
  .krw-withdraw-form.no-top-border,
  .fx-withdraw-form.no-top-border {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
  }
}
</style>