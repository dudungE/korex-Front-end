<template>
  <div class="confirm-section">
    <h4>받는 분 정보 확인</h4>
    <table class="form-table confirm-table">
      <tr>
        <th>이름</th>
        <td>{{ data.recipientName }}</td>
      </tr>
      <tr>
        <th>핸드폰 번호</th>
        <td>{{ data.recipientPhone }}</td>
      </tr>
      <tr>
        <th>계좌명 / 계좌번호</th>
        <td>{{ data.recipientAccountName }} / {{ data.recipientAccountNumber }}</td>
      </tr>
      <tr>
        <th>주소</th>
        <td>{{ formattedRecipientAddress }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object,
})

const formattedRecipientAddress = computed(() => {
  if (!props.data) return ''
  return [props.data.recipientCountry, props.data.recipientCity, props.data.recipientDetailAddress]
    .filter(Boolean)
    .join(', ')
})
</script>