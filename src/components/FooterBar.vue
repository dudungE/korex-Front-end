<template>
  <footer class="footer-bar">
    <div class="footer-top">
      <div class="footer-links">
        <span>사고신고</span>
        <span>상품 공시실</span>
        <span>보호금융상품등록부</span>
        <span>경영공시</span>
        <span>인증센터</span>
        <span>원격지원상담</span>
        <span>손님의소리(칭찬/불만/제안 등)</span>
        <span>상담센터</span>
        <span class="bold">개인정보처리방침</span>
        <span>신용정보활용체제</span>
        <span>본인정보이용 제공현황</span>
        <span>그룹사간 고객정보 제공내역조회</span>
        <span>영업점 찾기</span>
        <span>원큐 금융 상담서비스</span>
      </div>
      <div class="footer-customer">
        <div>
          <span class="label">고객센터</span>
          <span class="number">1588-1111 / 1599-1111</span>
        </div>
        <!-- <div>
          <span class="label">고객센터(해외)</span>
          <span class="number">+82-42-520-2500</span>
        </div> -->
      </div>
    </div>
    <div class="footer-middle">

      <div class="footer-copy">© Hana Bank. All rights reserved.</div>
    </div>
    <div class="footer-bottom">


    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterBar',
};
</script>

<style scoped>
.footer-bar {
  background: #fff;
  border-top: 1.5px solid #e0e0e0;
  padding: 32px 0 0 0;
  font-family: 'Noto Sans KR', Arial, sans-serif;
  color: #222;
  font-size: 1rem;
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 48px;
  flex-wrap: wrap;
}
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  line-height: 2;
  max-width: 70vw;
}
.footer-links .bold {
  font-weight: bold;
  color: #009490;
}
.footer-customer {
  text-align: right;
  min-width: 220px;
}
.footer-customer .label {
  display: block;
  color: #009490;
  font-size: 0.98rem;
  margin-bottom: 2px;
}
.footer-customer .number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #222;
}
.footer-middle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 48px 0 48px;
}

.footer-copy {
  color: #888;
  font-size: 1rem;
}
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px 0 48px;
}

.consumer-btn {
  background: #f7f7f7;
  border: none;
  border-radius: 16px;
  padding: 10px 24px;
  font-size: 1.1rem;
  color: #009490;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.consumer-btn:hover {
  background: #e0f7f4;
}
@media (max-width: 900px) {
  .footer-top, .footer-middle, .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 16px;
  }
  .footer-customer {
    text-align: left;
    margin-top: 16px;
  }
  .footer-middle, .footer-bottom {
    padding-top: 16px;
  }
}
</style> 