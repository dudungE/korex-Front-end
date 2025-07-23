<template>
  <div class="content-section search-box">
    <div class="section-header">
      <span class="section-icon"></span>
      <h3 class="section-title">받는 분 정보</h3>
      <p class="section-description">
        <span class="highlight_r">*</span> 사기거래 예방을 위해 받는 분과 입금은행의 소재국가가 동일한지 확인해 주시기 바랍니다.
      </p>
    </div>
    
    <table class="form-table">
      <colgroup>
        <col style="width: 180px">
        <col>
      </colgroup>
      <tbody>
        <tr>
          <th>받는 분 성명</th>
          <td></td>
        </tr>
        <tr>
          <th>받는 분 주소</th>
          <td></td>
        </tr>
        <tr>
          <th>도시 / 주 / 국가</th>
          <td></td>
        </tr>
        <tr>
          <th>전화번호</th>
          <td></td>
        </tr>
        <tr>
          <th>입금은행명</th>
          <td></td>
        </tr>
        <tr>
          <th>입금계좌번호</th>
          <td></td>
        </tr>
        <tr>
          <th>입금은행 주소</th>
          <td></td>
        </tr>
        <tr>
          <th>송금인과의 관계<span class="highlight_r"> *</span></th>
          <td>
            <select class="input-select">
              <option>선택하세요</option>
              <option>가족</option>
              <option>친구</option>
              <option>사업관계</option>
              <option>기타</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'RecipientInfoForm',
};
</script>

<style scoped>
.content-section {
  margin-bottom: 30px;
}
.search-box {
  background: #fff;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.section-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #009490;
  border-radius: 50%;
  margin-right: 10px;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
}
.section-description {
  font-size: 14px;
  color: #555;
  margin-left: 18px;
}
.highlight_r {
  font-weight: bold;
  color: red;
}
.form-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  table-layout: fixed;
}
.form-table th, .form-table td {
  border-top: 1px solid #e0e0e0;
  padding: 10px;
  text-align: left;
  font-size: 14px;
  word-break: break-word;
}
.form-table th {
  background-color: #f7f9fc;
  font-weight: 500;
  vertical-align: top;
  white-space: nowrap;
}
.input-select {
  border: 1px solid #ccc;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  max-width: 250px;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .form-table th, .form-table td {
    display: block;
    width: 100%;
  }
  .input-select {
    max-width: 100%;
  }
}
</style>