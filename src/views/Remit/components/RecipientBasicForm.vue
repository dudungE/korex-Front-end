<template>
  <div class="section-box">
    <h3>1. 수취인 기본 정보</h3>
    <div class="form-row">
      <div class="form-group">
        <label>수취인 유형</label>
        <div class="radio-group">
          <label><input type="radio" v-model="form.type" value="personal" checked /> 개인</label>
          <label><input type="radio" v-model="form.type" value="corporate" /> 법인</label>
        </div>
      </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'RecipientBasicForm',
  data() {
    return {
      form: {
        type: 'personal',
        name: '',
        birthdate: '',
        phone: '',
        email: '',
      },
    };
  },
  watch: {
    form: {
      deep: true,
      handler(newVal) {
        // 부모 컴포넌트로 데이터 전달
        this.$emit('update:basic-info', newVal);
      },
    },
  },
};
</script>