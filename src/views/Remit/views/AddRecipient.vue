<template>
  <div class="recipient-register-page">
    <h2>수취인 등록</h2>
    
    <RecipientBasicForm @update:basic-info="updateBasicInfo" />
    <RecipientDetailForm @update:detail-info="updateDetailInfo" />
    <RemittanceForm @submit="handleRemittanceSubmit" />

    <div class="button-group">
      <button class="btn btn-primary" @click="submitPage">다음</button>
    </div>
  </div>
</template>

<script>
import RecipientBasicForm from '@/views/Remit/components/RecipientBasicForm.vue';
import RecipientDetailForm from '@/views/Remit/components/RecipientDetailForm.vue';
import RemittanceForm from '@/views/Remit/components/RemittanceForm.vue';

export default {
  name: 'RecipientRegisterPage',
  components: {
    RecipientBasicForm,
    RecipientDetailForm,
    RemittanceForm,
  },
  data() {
    return {
      recipientBasic: null,
      recipientDetail: null,
      remittance: null,
    };
  },
  methods: {
    updateBasicInfo(data) {
      this.recipientBasic = data;
    },
    updateDetailInfo(data) {
      this.recipientDetail = data;
    },
    handleRemittanceSubmit(data) {
      this.remittance = data;
    },
    submitPage() {
      // 모든 컴포넌트의 데이터를 합쳐서 최종 제출
      const finalData = {
        recipient: {
          ...this.recipientBasic,
          ...this.recipientDetail,
        },
        remittance: this.remittance,
      };
      console.log('최종 제출 데이터:', finalData);
      // API 호출 로직 ...
    },
  },
};
</script>