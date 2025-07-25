<template>
  <footer class="footer-bar">
    <div class="footer-top">
      <div class="footer-links-texts">
        <span>사고신고</span>
        <span>인증센터</span>
        <span>손님의소리(칭찬/불만/제안 등)</span>
        <span>상담센터</span>
        <span class="bold">개인정보처리방침</span>
        <span>영업점 찾기</span>

        <div class="footer-copy">
        © Korex. All rights reserved.
      </div>
      </div>



      <div class="footer-customer">
        <div>
          <span class="label">고객센터</span>
          <span class="number">5173-1111 / 8080-1111</span>
        </div>
      </div>
   
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
  padding: 10px 0 0 0;
  font-family: 'Noto Sans KR', Arial, sans-serif;
  color: #222;
  font-size: 1rem;
}

.footer-top {
  display: flex;
  /* flex-direction: column; 기존의 column 설정 제거. customer 위치 유지를 위해 이 부분이 중요합니다. */
  justify-content: space-between;
  align-items: flex-start;
  padding: 3px 0px 3px 4px;
  flex-wrap: wrap;
  gap: 20px;
  font-family: 'Noto Sans KR', Arial, sans-serif;
  color: #222;
  font-size: 1rem;
  background: #fff;
}

.footer-links-texts {
  display: flex;
  flex-wrap: wrap;
  gap: 15px 25px;
  max-width: 60vw;
  min-width: 250px;
  line-height: 2;
  color: #444;
}
.footer-links-texts span {
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s;
}
.footer-links-texts span:hover {
  color: #009490;
}
.footer-links-texts .bold {
  font-weight: 700;
  color: #009490;
}

.footer-customer {
  text-align: right;
  min-width: 220px;
  /* 기존 margin-top 제거 또는 조정 */
  margin-top: 0;
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


.footer-copy {
  color: #888;
  font-size: 0.9rem;
  min-width: 180px;
  white-space: nowrap;
  /* footer-links-texts 아래에 오도록 margin-top 추가 및 정렬 조정 */
  margin: 0;
  line-height: 1.8;
  user-select: none;
  text-align: left; /* 왼쪽 정렬 유지 */
  /* flex 아이템으로 작동할 때 공간을 차지하지 않도록 추가 설정 */
  flex-basis: 100%; /* 부모 너비 전체 차지 */
  order: 2; /* 두 번째 순서로 배치 */
}

/* 기존 CSS는 그대로 유지하거나 위에서 수정된 내용에 따라 조정됩니다. */
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

/* 반응형 미디어 쿼리는 그대로 유지됩니다. */
@media (max-width: 900px) {
  .footer-top {
    flex-direction: column; /* 작은 화면에서는 여전히 세로로 정렬 */
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
  .footer-copy {
    flex-basis: auto; /* 작은 화면에서는 flex-basis 재설정 */
    order: unset; /* 작은 화면에서는 order 재설정 */
  }
}
</style>