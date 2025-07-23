<template>
  <div class="section-box">
    <h3>2. 수취인 상세 정보</h3>
    <div class="form-row">
      <div class="form-group">
        <label for="swift-code">SWIFT CODE</label>
        <input type="text" id="swift-code" v-model="form.swiftCode" placeholder="SWIFT CODE" />
      </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'RecipientDetailForm',
  data() {
    return {
      form: {
        nationalCode: '',
        swiftCode: '',
        address: '',
        accountNumber: '',
      },
    };
  },
  watch: {
    form: {
      deep: true,
      handler(newVal) {
        // 부모 컴포넌트로 데이터 전달
        this.$emit('update:detail-info', newVal);
      },
    },
  },
};
</script>