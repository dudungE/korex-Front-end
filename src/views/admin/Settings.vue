<template>
  <div class="settings-page">
    <h2 class="page-title">설정</h2>
    <p class="page-subtitle">송금 및 환전 수수료를 설정하세요.</p>

    <a-card class="fee-card" title="친구송금 수수료">
      <a-form layout="inline">
        <a-form-item label="수수료 (%)">
          <a-input-number
            v-model:value="fees.domestic"
            :min="0"
            :max="100"
            :step="0.1"
            style="width: 120px"
          />
        </a-form-item>
        <a-button type="primary" @click="saveFee('domestic')">저장</a-button>
      </a-form>
    </a-card>

    <a-card class="fee-card" title="해외송금 수수료">
      <a-form layout="inline">
        <a-form-item label="수수료 (%)">
          <a-input-number
            v-model:value="fees.foreign"
            :min="0"
            :max="100"
            :step="0.1"
            style="width: 120px"
          />
        </a-form-item>
        <a-button type="primary" @click="saveFee('foreign')">저장</a-button>
      </a-form>
    </a-card>

    <a-card class="fee-card" title="환전 수수료">
      <a-form layout="inline">
        <a-form-item label="수수료 (%)">
          <a-input-number
            v-model:value="fees.exchange"
            :min="0"
            :max="100"
            :step="0.1"
            style="width: 120px"
          />
        </a-form-item>
        <a-button type="primary" @click="saveFee('exchange')">저장</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { message } from "ant-design-vue";

const fees = reactive({
  domestic: 0,
  foreign: 0,
  exchange: 0,
});

const saveFee = (type) => {
  message.success(`${type} 수수료가 저장되었습니다: ${fees[type]}%`);
  // 실제 API 연동 시 여기에서 axios.post('/api/fees', { type, value: fees[type] })
};
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.page-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.fee-card {
  margin-bottom: 16px;
  border-radius: 12px;
}
</style>
