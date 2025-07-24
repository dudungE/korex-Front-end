<template>
  <div class="confirm-section">
    <h4>송금 정보 확인</h4>
    <table class="form-table confirm-table">
      <tr>
        <th>송금 통화/금액</th>
        <td>
          {{ accountTypeLabel }} /
          {{ data.withdrawAmountKRW }} KRW, {{ data.withdrawAmountFX }} FX
        </td>
      </tr>
      <tr>
        <th>고시환율</th>
        <td>{{ data.exchangeRate }}</td>
      </tr>
      <tr>
        <th>적용환율</th>
        <td>{{ data.applyExchangeRate }}</td>
      </tr>
      <tr>
        <th>출금계좌번호</th>
        <td>{{ data.selectedAccountNumber }}</td>
      </tr>
      <tr>
        <th>송금 수수료 + 전신료 (외화)</th>
        <td>{{ data.remittanceFee }}</td>
      </tr>
      <tr>
        <th>결제은행 수수료 (외화)</th>
        <td>{{ data.bankFee }}</td>
      </tr>
      <tr>
        <th>출금합계</th>
        <td>{{ data.totalWithdrawAmount }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object,
})

const accountTypeMap = {
  KRW: '원금',
  FX: '외화',
  BOTH: '원금+외화',
}

const accountTypeLabel = computed(() => accountTypeMap[props.data.selectedAccountType] || '')
</script>
