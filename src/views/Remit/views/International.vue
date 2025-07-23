<template>
  <div class="recipient-page forex-style">
    <div class="page-header">
      <h1 class="page-title">해외송금</h1>
      <div class="step-indicator">
        <span class="step active">01</span>
        <span class="step">02</span>
        <span class="step">03</span>
      </div>
    </div>

    <div class="info-box result-box">
      <ul>
        <li>
          <i class="bullet"></i> 처음 이용하시거나 해외송금과 관련하여 궁금한 사항이 있으시면 <a href="#" class="link">해외송금안내</a>를 참고해 주세요. <button class="btn-info">해외송금안내</button>
        </li>
        <li>
          <i class="asterisk">*</i> 항목은 필수 입력 항목입니다.
        </li>
      </ul>
    </div>

    <RemittanceForm />

    <RecipientInfoForm />

    <div class="btn-group">
      <button class="btn-primary">다음</button>
    </div>
  </div>
</template>

<script>
import RemittanceForm from '@/views/Remit/components/RemittanceForm.vue';

export default {
  name: 'International',
  components: {
    RemittanceForm,
    RecipientInfoForm
  }
};
</script>

<style scoped>
.forex-style {
  font-family: 'Noto Sans KR', Arial, sans-serif;
  color: #222;
}
.recipient-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #009490;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.page-title {
  font-size: 28px;
  font-weight: bold;
}
.step-indicator {
  display: flex;
}
.step {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #fff;
  font-weight: bold;
  margin-left: 5px;
}
.step.active {
  background-color: #009490;
}
.info-box {
  padding: 20px;
  margin-bottom: 20px;
}
.result-box {
  background: #f2f8f7;
  border: 1px solid #f2f8f7;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: none;
}
.info-box p {
  font-size: 15px;
  line-height: 1.5;
}
.info-box ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  font-size: 14px;
}
.info-box li {
  position: relative;
  padding-left: 15px;
  margin-bottom: 5px;
}
.bullet {
  display: inline-block;
  width: 5px;
  height: 5px;
  background-color: #333;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 15px;
}
.asterisk {
  color: red;
  font-weight: bold;
  font-style: normal;
  position: absolute;
  left: 0;
  top: 4px;
}
.highlight_r {
  font-weight: bold;
  color: red;
}
.highlight {
  font-weight: bold;
  color: #009490;
}
.link {
  color: #009490;
  text-decoration: underline;
}
.btn-info {
  background: #e0f7f4;
  border: 1px solid #009490;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  margin-left: 10px;
  color: #009490;
  cursor: pointer;
  font-weight: 600;
}
.btn-info:hover {
  background-color: #009490;
  color: #fff;
}
.btn-group {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.btn-primary {
  background: #009490;
  color: #fff;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-primary:hover {
  background: #007c7a;
}
</style>