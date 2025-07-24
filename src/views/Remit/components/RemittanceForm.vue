<template>
  <div class="content-section search-box">
    <div class="section-header">
      <span class="section-icon"></span>
      <h3 class="section-title">출금 및 송금금액 정보</h3>
    </div>
    <table class="form-table">
      <colgroup><col style="width: 150px" /><col /></colgroup>
      <tbody>
        <tr>
          <th>출금계좌선택<span class="highlight"> *</span></th>
          <td>
            <label v-for="item in accountTypes" :key="item.value" style="margin-right: 20px;">
              <input type="radio" name="accountType" :value="item.value" v-model="localFormData.selectedAccountType" />
              {{ item.label }}
            </label>
          </td>
        </tr>
        <tr>
          <th>출금계좌번호<span class="highlight"> *</span></th>
          <td>
            <select v-model="localFormData.selectedAccountNumber" class="input-select">
              <option value="">선택하세요</option>
              <option v-for="acc in accountNumberList" :key="acc" :value="acc">{{ acc }}</option>
            </select>
            <button type="button" class="btn-info" @click="checkBalance">잔액조회</button>
          </td>
        </tr>
        <tr>
          <th>출금금액 (원화)<span class="highlight"> *</span></th>
          <td>
            <input type="number" min="0" v-model.number="localFormData.withdrawAmountKRW" class="input-text small" />
            <button type="button" class="btn-info">금융계산기</button>
          </td>
        </tr>
        <tr>
          <th>출금금액 (외화)<span class="highlight"> *</span></th>
          <td>
            <input type="number" min="0" v-model.number="localFormData.withdrawAmountFX" class="input-text small" />
          </td>
        </tr>
        <tr>
          <th>계좌 비밀번호<span class="highlight"> *</span></th>
          <td>
            <input type="password" maxlength="4" v-model="localFormData.accountPassword" class="input-text small" />
          </td>
        </tr>
        <tr>
          <th>직원 전달사항</th>
          <td>
            <textarea v-model="localFormData.staffNote" rows="3" class="input-text full-width" placeholder="SWIFT 코드 및 전달사항 입력"></textarea>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="balance !== null" style="margin-top:10px;">
      <strong>잔액:</strong> {{ balance }} 원
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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

const accountTypes = [
  { value: 'KRW', label: '원금' },
  { value: 'FX', label: '외화' },
  { value: 'BOTH', label: '원금+외화' },
]

const accountNumberList = [
  '111-111-111',
  '222-222-222',
  '333-333-333',
]

const balance = ref(null)

function checkBalance() {
  // 예시로 랜덤 잔액 생성(실제 API 호출 시 교체)
  balance.value = Math.floor(Math.random() * 10000000)
}
</script>
