<template>
  <a-modal
    :title="isEdit ? '여행 수정' : '새 여행 추가'"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
    okText="저장"
    cancelText="취소"
  >
    <!-- 여행지 입력 -->
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">여행 목적지 *</label>
      <a-input 
        v-model:value="formData.destination" 
        placeholder="도시명 또는 국가명을 입력하세요"
        size="large"
      >
        <template #prefix>
          <a-icon type="environment" />
        </template>
      </a-input>
    </div>

    <!-- 여행 날짜 -->
    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">출발일 *</label>
        <a-input 
          v-model:value="formData.startDate" 
          type="date" 
          size="large" 
          style="width: 100%"
        />
      </div>
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">도착일 *</label>
        <a-input 
          v-model:value="formData.endDate" 
          type="date" 
          size="large" 
          style="width: 100%"
        />
      </div>
    </div>

    <!-- 통화 및 예산 -->
    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
      <div style="flex: 0 0 120px;">
        <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">통화</label>
        <a-select v-model:value="formData.currency" size="large" style="width: 100%">
          <a-select-option value="KRW">🇰🇷 KRW</a-select-option>
          <a-select-option value="USD">🇺🇸 USD</a-select-option>
          <a-select-option value="JPY">🇯🇵 JPY</a-select-option>
          <a-select-option value="EUR">🇪🇺 EUR</a-select-option>
          <a-select-option value="CNY">🇨🇳 CNY</a-select-option>
        </a-select>
      </div>
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">예산 *</label>
        <a-input-number
          v-model:value="formData.budget"
          :min="0"
          placeholder="예산 입력"
          size="large"
          style="width: 100%"
        />
      </div>
    </div>

    <!-- 메모 -->
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; color: #1976d2; font-weight: 500;">메모 (선택사항)</label>
      <a-textarea
        v-model:value="formData.memo"
        placeholder="여행에 대한 간단한 메모를 작성해보세요"
        :rows="3"
      />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'CreateTravelModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        destination: '',
        startDate: '',
        endDate: '',
        currency: 'KRW',
        budget: null,
        memo: ''
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.editData
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.isEdit && this.editData) {
          // 수정 모드일 때 기존 데이터 설정
          this.formData = {
            destination: this.editData.destination || '',
            startDate: this.editData.startDate || '',
            endDate: this.editData.endDate || '',
            currency: this.editData.currency || 'KRW',
            budget: this.editData.budget || null,
            memo: this.editData.memo || ''
          }
        } else {
          // 새로 추가할 때 초기화
          this.resetForm()
        }
      }
    }
  },
  methods: {
    handleSubmit() {
      // 간단한 유효성 검사
      if (!this.formData.destination) {
        this.$message.error('여행지를 입력해주세요!')
        return
      }
      if (!this.formData.startDate) {
        this.$message.error('출발일을 선택해주세요!')
        return
      }
      if (!this.formData.endDate) {
        this.$message.error('도착일을 선택해주세요!')
        return
      }
      if (!this.formData.budget) {
        this.$message.error('예산을 입력해주세요!')
        return
      }

      this.loading = true
      
      // 데이터 전송 시뮬레이션
      setTimeout(() => {
        this.$emit('submit', { ...this.formData })
        this.loading = false
      }, 500)
    },
    
    handleCancel() {
      this.$emit('cancel')
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        destination: '',
        startDate: '',
        endDate: '',
        currency: 'KRW',
        budget: null,
        memo: ''
      }
    }
  }
}
</script>

<style>
.ant-modal-header {
  background: linear-gradient(90deg, #2196f3, #03a9f4);
  border-radius: 6px 6px 0 0;
}

.ant-modal-title {
  color: white;
  font-weight: 600;
}
</style>
