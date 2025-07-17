<template>
  <div class="account-view">
    <!-- (전역) 헤더는 앱 레이아웃에서 불러온다고 가정 -->
    <main class="container">
      <!-- 1) 총 자산 영역 -->
      <section class="asset-summary">
        <div class="summary-left">
          <h2 class="label">총 자산</h2>
          <p class="amount">
            {{ isBalanceVisible ? toWon(totalBalance) : '••••••' }}
          </p>
          <p class="diff" :class="balanceChange >= 0 ? 'up' : 'down'">
            {{ prefix }}{{ toWon(balanceChange) }}
            <span class="percent">
              ({{ prefix }}{{ balanceChangePercent }}%)
            </span>
          </p>
        </div>

        <button class="eye-btn" @click="toggleBalance">
          {{ isBalanceVisible ? '👁️' : '👁️‍🗨️' }}
        </button>
      </section>

      <!-- 2) 계좌 카드 -->
      <section class="accounts-section">
        <h3 class="section-title">내 계좌</h3>
        <div 
          v-for="account in accounts" 
          :key="account.id" 
          class="account-card"
          @click="selectAccount(account)"
        >
          <div class="acc-info">
            <span class="logo">{{ account.bankLogo }}</span>
            <div>
              <p class="bank">{{ account.bankName }}</p>
              <p class="no">{{ account.accountNumber }}</p>
            </div>
          </div>
          <p class="acc-bal">{{ toWon(account.balance) }}</p>
        </div>
      </section>

      <!-- 3) 액션 버튼 -->
      <section class="actions">
        <button v-for="act in actions" :key="act.text" @click="act.fn">
          <span class="icon">{{ act.icon }}</span>
          <span>{{ act.text }}</span>
        </button>
      </section>

      <!-- 4) 최근 거래 -->
      <section class="transactions">
        <header>
          <h3>최근 거래</h3>
          <button class="more" @click="showAll">전체보기</button>
        </header>

        <article v-for="tx in recent" :key="tx.id" class="tx-row">
          <span class="tx-icon">{{ tx.type === 'income' ? '💰' : '💸' }}</span>
          <div class="tx-desc">
            <p class="title">{{ tx.title }}</p>
            <p class="time">{{ ago(tx.time) }}</p>
          </div>
          <p class="tx-amt" :class="tx.type">
            {{ tx.type === 'income' ? '+' : '-' }}{{ toWon(tx.amount) }}
          </p>
        </article>
      </section>
    </main>

    <!-- (전역) 푸터 역시 레이아웃에서 그대로 사용 -->
  </div>
</template>

<script>
export default {
  name: 'AccountView',
  data() {
    return {
      isBalanceVisible: true,
      accounts: [
        {
          id: 1,
          bankName: '주거래통장',
          bankLogo: '🏦',
          accountNumber: '100-1234-5678',
          balance: 1_547_300
        },
        {
          id: 2,
          bankName: '글로벌통장',
          bankLogo: '🏛️',
          accountNumber: '100-456-789012',
          balance: 850_000
        },
        {
          id: 3,
          bankName: '적금통장',
          bankLogo: '🏢',
          accountNumber: '100-987-654321',
          balance: 150_000
        }
      ],
      balanceChange: 23_500,
      balanceChangePercent: 0.95,
      actions: [
        { text: '송금', icon: '💸', fn: () => alert('송금') },
        { text: '충전', icon: '💳', fn: () => alert('충전') },
        { text: '결제', icon: '💰', fn: () => alert('결제') },
        { text: '투자', icon: '📈', fn: () => alert('투자') }
      ],
      recent: [
        { id: 1, title: '스타벅스', amount: 4500, type: 'expense', time: Date.now() - 1.8e6 },
        { id: 2, title: '월급', amount: 3_200_000, type: 'income', time: Date.now() - 7.2e6 },
        { id: 3, title: '편의점', amount: 1200, type: 'expense', time: Date.now() - 1.8e7 }
      ]
    };
  },
  computed: {
    prefix() { return this.balanceChange >= 0 ? '+' : ''; },
    totalBalance() {
      return this.accounts.reduce((sum, accounts) => sum + accounts.balance, 0);
    }
  },
  methods: {
    toggleBalance() { this.isBalanceVisible = !this.isBalanceVisible; },
    toWon(v) { return new Intl.NumberFormat('ko-KR').format(v) + '원'; },
    ago(t) {
      const m = Math.floor((Date.now() - t) / 6e4);
      if (m < 60) return `${m}분 전`;
      if (m < 1440) return `${Math.floor(m / 60)}시간 전`;
      return `${Math.floor(m / 1440)}일 전`;
    },
    showAll() { alert('전체 거래내역'); },
    selectAccount(account) { 
      alert(`${account.bankName}이 선택되었습니다.`);
    }
  }
};
</script>

<style scoped>
/* 공통 색상 */
:root {
  --primary:#009e60;          /* 하나은행 계열 녹색 */
  --bg:#ffffff;
  --text:#222;
  --line:#e5e8eb;
}

/* 전체 레이아웃 */
.account-view {background:var(--bg);color:var(--text);}
.container{
  max-width:1200px;   /* PC에서는 1200px, 모바일은 auto */
  margin:0 auto;
  padding:40px 24px 80px;
}

/* 1. 총 자산 섹션 */
.asset-summary{
  display:flex;justify-content:space-between;align-items:center;
  border:1px solid var(--line);border-radius:12px;
  padding:24px;margin-bottom:32px;background:#f9fafb;
}
.summary-left .label{font-size:15px;color:#666;margin-bottom:4px;}
.amount{font-size:32px;font-weight:700;margin-bottom:6px;}
.diff{font-size:14px;}
.diff.up{color:var(--primary);} .diff.down{color:#e53e3e;}
.percent{margin-left:4px;color:#666;font-weight:400;}
.eye-btn{
  background:none;border:none;font-size:22px;cursor:pointer;
  padding:6px;border-radius:6px;
}
.eye-btn:hover{background:rgba(0,0,0,.05);}

/* 2. 계좌 카드 */
.account-card{
  display:flex;justify-content:space-between;align-items:center;
  padding:24px;border:1px solid var(--line);border-radius:12px;
  margin-bottom:40px;background:#fff;
}
.acc-info{display:flex;align-items:center;}
.logo{font-size:30px;margin-right:14px;}
.bank{font-weight:600;} .no{font-size:13px;color:#666;}
.acc-bal{font-weight:600;font-size:18px;}

/* 3. 액션 버튼 */
.actions{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));
  gap:16px;margin-bottom:48px;
}
.actions button{
  background:#fff;border:1px solid var(--line);border-radius:8px;
  padding:20px 0;display:flex;flex-direction:column;align-items:center;
  cursor:pointer;transition:0.15s;
}
.actions button:hover{border-color:var(--primary);box-shadow:0 4px 10px rgba(0,0,0,0.05);}
.icon{font-size:26px;margin-bottom:6px;}
.actions span{font-size:14px;color:#444;}

/* 4. 거래내역 */
.transactions header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:12px;
}
.transactions h3{font-size:18px;font-weight:700;}
.more{
  background:none;border:none;color:var(--primary);font-size:14px;cursor:pointer;
}
.tx-row{
  display:flex;align-items:center;padding:18px 0;border-bottom:1px solid var(--line);
}
.tx-icon{font-size:22px;margin-right:14px;}
.tx-desc{flex:1;}
.title{font-size:14px;font-weight:500;margin-bottom:4px;}
.time{font-size:12px;color:#666;}
.tx-amt{font-weight:600;}
.tx-amt.income{color:var(--primary);} .tx-amt.expense{color:#555;}

/* 모바일 보완 */
@media (max-width:768px){
  .container{padding:24px 16px 60px;}
  .asset-summary{flex-direction:column;align-items:flex-start;}
  .eye-btn{align-self:flex-end;margin-top:-32px;}
  .amount{font-size:26px;}
}
</style>
