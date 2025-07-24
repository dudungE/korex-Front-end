<template>
  <div class="confirm-section">
    <h4>보내는 분 정보 확인</h4>
    <table class="form-table confirm-table">
      <tr>
        <th>이름</th>
        <td>{{ data.senderName }}</td>
      </tr>
      <tr>
        <th>주소</th>
        <td>{{ formattedAddress }}</td>
      </tr>
      <tr>
        <th>송금 사유</th>
        <td>{{ remitReasonText }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object
})

const remitReasonMap = {
  reason1: '미화 5천불 상당액 이하 증빙서류 미제출 송금',
  reason2: '해외유학생의 학비 송금',
  reason3: '외국인 및 비거주자의 외화 예금 인출 송금',
  reason4: '해외체재자의 해외 체재비 송금',
  reason5: '비거주자 자유해외예금 인출송금',
}

const formattedAddress = computed(() => {
  if (!props.data) return ''
  return [props.data.senderAddressFloor, props.data.senderAddressStreet, props.data.senderAddressTown]
    .filter(Boolean)
    .join(', ')
})

const remitReasonText = computed(() => {
  if (!props.data) return ''
  return remitReasonMap[props.data.remittanceReason] || ''
})
</script>
