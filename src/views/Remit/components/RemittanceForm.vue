<template>
  <div class="content-section search-box">
    <div class="section-header">
      <span class="section-icon"></span>
      <h3 class="section-title">송금 및 송금액 정보</h3>
    </div>
    <table class="form-table">
      <colgroup>
        <col style="width: 150px">
        <col>
      </colgroup>
      <tbody>
        <tr>
          <th>원금출금계좌<span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <select class="input-select">
                <option>선택하세요</option>
              </select>
              <button class="btn-balance">잔액조회</button>
            </div>
            <div class="account-selection">
              <label><input type="radio" name="account-type" checked> 원화출금계좌</label>
              <label><input type="radio" name="account-type"> 외화출금계좌</label>
              <label><input type="radio" name="account-type"> 원화+외화출금계좌</label>
              <button class="usage-info-btn">송금 이용시간안내</button>
            </div>
          </td>
        </tr>
        <tr>
          <th>원화계좌기준 <br>출금금액 <span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <div class="radio-group">
                <label><input type="radio" name="currency-type" checked> 외화</label>
                <label><input type="radio" name="currency-type"> 원화(KRW)</label>
              </div>
              <input type="text" class="input-text">
              <p class="guide-text">
                외화기준: 원화로 환전한 금액이 계좌에서 출금되어 송금<br>
                원화기준: 입력한 원화금액 출금 후 외화로 환전하여 송금
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <th>원금출금계좌 <br>비밀번호<span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <input type="password" class="input-password" placeholder="(4자리 입력)">
            </div>
          </td>
        </tr>
        <tr>
          <th>수수료출금계좌<span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <select class="input-select">
                <option>선택하세요</option>
              </select>
              <button class="btn-balance">잔액조회</button>
            </div>
          </td>
        </tr>
        <tr>
          <th>수수료출금계좌 <br>비밀번호<span class="highlight"> *</span></th>
          <td>
            <div class="input-group">
              <input type="password" class="input-password" placeholder="(4자리 입력)">
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="form-table summary-table">
      <colgroup>
        <col style="width: 150px">
        <col>
      </colgroup>
      <tbody>
        <tr>
          <th>출금금액(원화)</th>
          <td>
            <div class="value-group">
              <span class="value">KRW 0</span>
              <button class="btn-calculator">금융계산기</button>
            </div>
          </td>
        </tr>
        <tr>
          <th>출금금액(외화)</th>
          <td>
            <span class="value">통화구분 미선택 0</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'RemittanceForm',
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
.highlight {
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
.input-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.input-select,
.input-text,
.input-password {
  border: 1px solid #ccc;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  max-width: 250px;
  box-sizing: border-box;
}
.input-password {
  max-width: 120px;
}
.btn-balance {
  background: none;
  border: none;
  text-decoration: underline;
  color: #009490;
  cursor: pointer;
  font-size: 14px;
}
.account-selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 15px;
}
.account-selection label {
  font-size: 14px;
}
.account-selection input[type="radio"] {
  margin-right: 5px;
}
.usage-info-btn {
  background: #e0f7f4;
  border: 1px solid #009490;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: #009490;
  cursor: pointer;
  font-weight: 600;
}
.radio-group {
  display: flex;
  align-items: center;
  gap: 15px;
}
.radio-group label {
  font-size: 14px;
}
.radio-group input[type="radio"] {
  margin-right: 5px;
}
.guide-text {
  font-size: 13px;
  color: #777;
  line-height: 1.4;
  margin-top: 10px;
}
.summary-table {
  border-bottom: 1px solid #e0e0e0;
  margin-top: 30px;
}
.summary-table th, .summary-table td {
  border-top: none;
}
.summary-table tr:first-child th, .summary-table tr:first-child td {
  border-top: 1px solid #e0e0e0;
}
.summary-table th {
  font-weight: bold;
  white-space: nowrap;
}
.value-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.value {
  font-weight: bold;
  color: #1565c0;
}
.btn-calculator {
  background: #e0f7f4;
  border: 1px solid #009490;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #009490;
  font-weight: 600;
}
@media (max-width: 768px) {
  .form-table th, .form-table td {
    display: block;
    width: 100%;
  }
  .input-select, .input-text, .input-password {
    max-width: 100%;
  }
  .account-selection {
    flex-direction: column;
    align-items: flex-start;
  }
  .value-group {
    flex-direction: column;
    align-items: flex-start;
  }
  .btn-calculator, .usage-info-btn {
    margin-top: 10px;
  }
}
</style>