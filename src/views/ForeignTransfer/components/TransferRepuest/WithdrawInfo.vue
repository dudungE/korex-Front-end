<template>
  <section class="withdraw-info-section-v4">
    <h2 class="section-title-v4">출금 및 송금금액 정보</h2>

    <div class="info-table-v4">
      <!-- 출금 계좌 선택 -->
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
        </div>
      </div>

      <!-- KRW 출금폼 -->
      <div v-if="localWithdrawAccountType === 'KRW'" class="krw-withdraw-form no-top-border">
        <div class="info-row-v4 select-row">
          <label for="krw-bank-select" class="input-label-v4">출금 은행</label>
          <div class="select-wrapper-v4">
            <select id="krw-bank-select" v-model="selectedKrwBank" class="select-field-v4">
              <option value="" disabled>은행 선택</option>
              <option v-for="bank in krwBanks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 select-row">
          <label for="krw-account-select" class="input-label-v4">출금 계좌</label>
          <div class="select-wrapper-v4">
            <select id="krw-account-select" v-model="localSelectedKrwAccount" class="select-field-v4">
              <option value="" disabled>계좌를 선택하세요</option>
              <option v-for="acc in krwAccounts" :key="acc.accountNumber" :value="acc.accountNumber">
                {{ acc.accountNumber }} [원화출금]
              </option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">잔액</span>
          <div class="action-display-group-v4">
            <span v-if="krwBalanceVisible" class="balance-display-v4">
              {{ formatCurrency(krwBalance, 'KRW') }}
            </span>
            <button type="button" @click="fetchBalance('KRW')" class="action-button-v4 small-button">
              잔액조회
            </button>
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="krw-amount" class="input-label-v4">
            출금 금액 ({{ recipientCurrency }})
          </label>
          <input type="number" id="krw-amount" v-model.number="krwAmountInput"
                 class="input-field-v4 text-right" placeholder="0" />
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">예상 환전 금액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">
              {{ formatCurrency((krwAmountInput * exchangeRate) || 0, 'KRW') }}
            </span>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">수수료 금액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">5000원</span>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">환율</span>
          <div class="action-display-group-v4">
            1 {{ recipientCurrency }} = {{ exchangeRate.toLocaleString() }} KRW
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="krw-password" class="input-label-v4">계좌 비밀번호</label>
          <input type="password" id="krw-password" v-model="localKrwPassword"
                 maxlength="4" class="input-field-v4 text-right" placeholder="숫자 4자리" />
        </div>
      </div>

      <!-- FX 출금폼 -->
      <div v-if="localWithdrawAccountType === 'FX'" class="fx-withdraw-form no-top-border">
        <div class="info-row-v4 select-row">
          <label for="fx-bank-select" class="input-label-v4">출금 은행</label>
          <div class="select-wrapper-v4">
            <select id="fx-bank-select" v-model="selectedFxBank" class="select-field-v4">
              <option value="" disabled>은행 선택</option>
              <option v-for="bank in fxBanks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
            </select>
          </div>
        </div>

        <div class="info-row-v4 select-row">
          <label for="fx-account-select" class="input-label-v4">출금 계좌</label>
          <div class="select-wrapper-v4">
            <select id="fx-account-select" v-model="localSelectedFxAccount" class="select-field-v4">
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
            <span v-if="fxBalanceVisible" class="balance-display-v4">
              {{ formatCurrency(fxBalance, recipientCurrency) }}
            </span>
            <button type="button" @click="fetchBalance('FX')" class="action-button-v4 small-button">
              잔액조회
            </button>
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="fx-amount" class="input-label-v4">
            출금 금액 ({{ recipientCurrency }})
          </label>
          <input type="number" id="fx-amount" v-model.number="fxAmountInput"
                 class="input-field-v4 text-right" placeholder="0" />
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">예상 환전 금액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">
              {{ formatCurrency((fxAmountInput * exchangeRate) || 0, 'KRW') }}
            </span>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">수수료 금액</span>
          <div class="action-display-group-v4">
            <span class="balance-display-v4">5000원</span>
          </div>
        </div>

        <div class="info-row-v4 action-row">
          <span class="info-label-v4">환율</span>
          <div class="action-display-group-v4">
            1 {{ recipientCurrency }} = {{ exchangeRate.toLocaleString() }} KRW
          </div>
        </div>

        <div class="info-row-v4 input-row">
          <label for="fx-password" class="input-label-v4">계좌 비밀번호</label>
          <input type="password" id="fx-password" v-model="localFxPassword"
                 maxlength="4" class="input-field-v4 text-right" placeholder="숫자 4자리" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  withdrawAccountType: { type: String, default: 'KRW' },
  recipientCurrency: { type: String, default: 'USD' },
});

const emit = defineEmits(['update:isValid']);

const localWithdrawAccountType = ref(props.withdrawAccountType);
const krwAccounts = ref([{ accountNumber: '123-456-7890' }]);
const fxAccounts = ref([{ accountNumber: '987-654-3210' }]);
const krwBanks = ref([{ code: '001', name: 'KOREX BANK' }]);
const fxBanks = ref([{ code: '002', name: 'KOREX BANK' }]);

const localSelectedKrwAccount = ref('');
const localSelectedFxAccount = ref('');
const selectedKrwBank = ref('');
const selectedFxBank = ref('');

const krwAmountInput = ref(0);
const fxAmountInput = ref(0);
const localKrwPassword = ref('');
const localFxPassword = ref('');
const krwBalanceVisible = ref(false);
const fxBalanceVisible = ref(false);

const exchangeRates = ref({ USD: 1350, EUR: 1450, JPY: 9.8 });
const exchangeRate = computed(() => exchangeRates.value[props.recipientCurrency] || 1);

const krwBalance = ref(5000000);
const fxBalance = ref(1200);

function formatCurrency(amount, currency) {
  if (!amount || isNaN(amount)) return `0 ${currency}`;
  return `${amount.toLocaleString()} ${currency}`;
}

function fetchBalance(type) {
  if (type === 'KRW' && localSelectedKrwAccount.value) krwBalanceVisible.value = true;
  else if (type === 'FX' && localSelectedFxAccount.value) fxBalanceVisible.value = true;
}

watch(() => props.withdrawAccountType, val => localWithdrawAccountType.value = val);

// ✅ 부모 호출 가능한 검증
function triggerValidation() {
  let isValid = false;

  if (localWithdrawAccountType.value === 'KRW') {
    isValid = !!(
        selectedKrwBank.value &&
        localSelectedKrwAccount.value &&
        krwAmountInput.value > 0 &&
        localKrwPassword.value.trim()
    );
  } else if (localWithdrawAccountType.value === 'FX') {
    isValid = !!(
        selectedFxBank.value &&
        localSelectedFxAccount.value &&
        fxAmountInput.value > 0 &&
        localFxPassword.value.trim()
    );
  }

  emit('update:isValid', isValid);
  return isValid;
}

defineExpose({ triggerValidation });
</script>

<style scoped>
/* (이전과 동일한 CSS 스타일) */
/* 섹션 공통 스타일 */
.description-text-v4 {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 4px;
}

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
  color: #008681; /* Deeper Green */
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
  border-color: #008681;
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
  accent-color: #008681;
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
  color: #008681; /* 초록색으로 잔액 강조 */
  white-space: nowrap; /* 줄 바꿈 방지 */
  flex-shrink: 0;
}

.action-button-v4 {
  padding: 10px 18px;
  background-color: #009b99;
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
  background-color: #008681;
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