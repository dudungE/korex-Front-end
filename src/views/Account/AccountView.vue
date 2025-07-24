<template>
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
        <h2 class="page-title">계좌 조회</h2>

        <div class="dashboard-grid">
            <!-- 총 보유 금액 -->
            <div class="total-balance-card">
                <div class="balance-header">
                    <span class="balance-title">총 보유 금액</span>
                    <select class="period-selector" v-model="selectedPeriod">
                        <option value="monthly">월별</option>
                        <option value="weekly">주별</option>
                        <option value="daily">일별</option>
                    </select>
                </div>
                <div class="total-amount">{{ formatAmount(totalBalance) }}</div>
                
                <!-- 세로 바 차트 (3개월) -->
                <div class="balance-vertical-bars">
                    <div class="vertical-chart-container">
                        <div v-for="month in monthlyData" :key="month.month" class="vertical-bar-item">
                            <div class="vertical-bar-wrapper">
                                <div class="vertical-bar" 
                                     :style="{ height: (month.amount / maxAmount * 100) + '%', backgroundColor: month.color }">
                                </div>
                            </div>
                            <div class="month-label">{{ month.month }}</div>
                            <div class="amount-label">{{ formatShortAmount(month.amount) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 자주 쓰는 계좌 즐겨찾기 카드 (새로 교체) -->
            <div class="favorite-accounts-card">
                <div class="favorite-header">
                    <h3>⭐ 즐겨찾기</h3>
                    <button class="manage-btn" @click="manageFavorites">관리</button>
                </div>
                
                <div class="favorite-accounts-list">
                    <div v-for="account in favoriteAccounts" :key="account.id" 
                         class="favorite-account-item" 
                         @click="quickTransfer(account)">
                        <div class="account-avatar">
                            <span class="avatar-icon">{{ account.icon }}</span>
                        </div>
                        <div class="account-details">
                            <div class="account-name">{{ account.name }}</div>
                            <div class="account-info">
                                <span class="bank-name">{{ account.bank }}</span>
                                <span class="account-number">{{ account.accountNumber }}</span>
                            </div>
                            <div class="last-transfer">{{ account.lastTransfer }}</div>
                        </div>
                        <div class="quick-actions">
                            <button class="quick-transfer-btn" @click.stop="quickTransfer(account)">
                                💸 송금
                            </button>
                            <div class="transfer-amount">{{ account.usualAmount }}</div>
                        </div>
                    </div>
                </div>
                
                <button class="add-favorite-btn" @click="addFavorite">
                    + 자주 쓰는 계좌 추가
                </button>
            </div>

            <!-- 통화별 지갑 -->
            <div class="currency-wallets-section">
                <div class="section-header">
                    <h3>통화별 지갑</h3>
                    <button class="more-btn">더보기</button>
                </div>
                <div class="wallet-grid">
                    <div v-for="wallet in currencyWallets" :key="wallet.currency" class="wallet-card clickable"
                        @click="goToWalletDetail(wallet.currency)">
                        <div class="wallet-header">
                            <div class="currency-flag">{{ wallet.flag }}</div>
                            <div class="currency-name">{{ wallet.name }}</div>
                        </div>
                        <div class="wallet-balance">
                            {{ formatCurrencyAmount(wallet.balance, wallet.currency) }}
                        </div>
                        <div class="wallet-krw">
                            ≈ {{ formatAmount(convertToKRW(wallet.balance, wallet.rate)) }}
                        </div>
                        <div class="wallet-arrow">→</div>
                    </div>
                </div>
            </div>

            <!-- 거래 내역 -->
            <div class="transaction-history">
                <div class="section-header">
                    <h3>최근 거래 내역</h3>
                    <select class="sort-selector" v-model="sortBy">
                        <option value="date">날짜순</option>
                        <option value="amount">금액순</option>
                    </select>
                </div>
                <div class="transaction-list">
                    <div v-for="transaction in sortedTransactions" :key="transaction.id" class="transaction-item">
                        <div class="transaction-icon" :class="transaction.type">
                            {{ getTransactionIcon(transaction.category) }}
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-desc">{{ transaction.description }}</div>
                            <div class="transaction-date">{{ transaction.date }}</div>
                        </div>
                        <div class="transaction-amount" :class="transaction.type">
                            {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatAmount(transaction.amount) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'AccountDashboard',
    setup() {
        const router = useRouter()
        
        const selectedPeriod = ref('monthly')
        const sortBy = ref('date')

        // 총 보유 금액
        const totalBalance = ref(25847500)

        // 월별 데이터 (최근 3개월만)
        const monthlyData = ref([
            { month: '8월', amount: 26200000, color: '#20c997' },
            { month: '9월', amount: 24900000, color: '#20c997' },
            { month: '10월', amount: 25847500, color: '#17a2b8' }
        ])

        const maxAmount = computed(() => {
            return Math.max(...monthlyData.value.map(item => item.amount))
        })

        // 금액을 짧게 표시하는 함수 (예: 2,620만원)
        const formatShortAmount = (amount) => {
            if (amount >= 10000000) {
                return Math.round(amount / 10000) + '만원'
            } else if (amount >= 10000) {
                return Math.round(amount / 10000) + '만원'
            }
            return new Intl.NumberFormat('ko-KR').format(amount) + '원'
        }

        // 자주 쓰는 계좌 즐겨찾기 데이터
        const favoriteAccounts = ref([
            {
                id: 1,
                name: '김지연 (딸)',
                bank: '국민은행',
                accountNumber: '***-***-2845',
                icon: '👧',
                lastTransfer: '3일 전 송금',
                usualAmount: '보통 200만원'
            },
            {
                id: 2,
                name: '하버드대학교',
                bank: 'Chase Bank',
                accountNumber: '***-***-9876',
                icon: '🏫',
                lastTransfer: '1주 전 송금',
                usualAmount: '보통 $8,000'
            },
            {
                id: 3,
                name: '김민수 (아들)',
                bank: '신한은행',
                accountNumber: '***-***-1234',
                icon: '👦',
                lastTransfer: '5일 전 송금',
                usualAmount: '보통 150만원'
            }
        ])

        // 통화별 지갑
        const currencyWallets = ref([
            {
                currency: 'KRW',
                name: '원화',
                flag: '🇰🇷',
                balance: 12547000,
                rate: 1
            },
            {
                currency: 'JPY',
                name: '엔화',
                flag: '🇯🇵',
                balance: 850000,
                rate: 8.95
            },
            {
                currency: 'USD',
                name: '달러',
                flag: '🇺🇸',
                balance: 8420.50,
                rate: 1293.33
            },
            {
                currency: 'EUR',
                name: '유로',
                flag: '🇪🇺',
                balance: 3250.80,
                rate: 1410.25
            }
        ])

        // 거래 내역
        const transactions = ref([
            {
                id: 1,
                type: 'expense',
                category: 'salary',
                description: 'KRW → JPY 환전',
                date: '07월 22일 2024',
                amount: 89000
            },
            {
                id: 2,
                type: 'income',
                category: 'salary',
                description: '원화 충전',
                date: '07월 20일 2024',
                amount: 3200000
            },
            {
                id: 3,
                type: 'expense',
                category: 'salary',
                description: 'USD → KRW',
                date: '07월 19일 2024',
                amount: 50000
            },
            {
                id: 4,
                type: 'expense',
                category: 'salary',
                description: 'KRW → KRW 송금',
                date: '07월 19일 2024',
                amount: 100000
            }
        ])

        // 정렬된 거래 내역
        const sortedTransactions = computed(() => {
            const sorted = [...transactions.value]
            if (sortBy.value === 'date') {
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
            } else {
                return sorted.sort((a, b) => b.amount - a.amount)
            }
        })

        // 즐겨찾기 관련 함수들
        const manageFavorites = () => {
            console.log('즐겨찾기 관리 페이지로 이동')
            // router.push('/account/favorites/manage')
        }

        const quickTransfer = (account) => {
            alert(`${account.name}에게 송금`, account)
            // router.push(`/transfer/quick/${account.id}`)
        }

        const addFavorite = () => {
            alert('새 즐겨찾기 계좌 추가')
            // router.push('/account/favorites/add')
        }

        // 지갑 상세페이지로 이동
        const goToWalletDetail = (currency) => {
            router.push(`/account/detail/${currency}`)
        }

        // 헬퍼 함수들
        const formatAmount = (amount) => {
            return new Intl.NumberFormat('ko-KR').format(amount) + '원'
        }

        const formatCurrencyAmount = (amount, currency) => {
            return new Intl.NumberFormat('ko-KR').format(amount) + ' ' + currency
        }

        const convertToKRW = (amount, rate) => {
            return Math.floor(amount * rate)
        }

        const getTransactionIcon = (category) => {
            const icons = {
                shopping: '🛍️',
                salary: '💰',
                food: '🍽️',
                transport: '🚇',
                investment: '📈'
            }
            return icons[category] || '💳'
        }

        return {
            selectedPeriod,
            sortBy,
            totalBalance,
            monthlyData,
            maxAmount,
            formatShortAmount,
            favoriteAccounts,
            transactions,
            currencyWallets,
            sortedTransactions,
            manageFavorites,
            quickTransfer,
            addFavorite,
            formatAmount,
            formatCurrencyAmount,
            convertToKRW,
            getTransactionIcon,
            goToWalletDetail
        }
    }
}
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 0 2rem;
}

.main-content {
    flex: 1;
    margin: 5rem;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 2rem;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

/* 총 보유 금액 카드 */
.total-balance-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
}

.balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.balance-title {
    font-weight: 600;
    color: #6c757d;
}

.period-selector {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
}

.total-amount {
    font-size: 2.5rem;
    font-weight: bold;
    color: #20c997;
    margin-bottom: 1.5rem;
}

/* 세로 바 차트 스타일 */.balance-vertical-bars {
    width: 100%;
    margin-top: 10rem;
}

.vertical-chart-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 100px; /* 차트 높이 증가 */
    margin-bottom: 1rem;
    padding: 0 2rem; /* 좌우 패딩 증가 */
}

.vertical-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 80px; /* 최대 너비 증가 */
}

.vertical-bar-wrapper {
    height: 80px; /* 바 영역 높이 증가 */
    width: 36px; /* 바 너비 크게 증가 */
    background-color: #f8f9fa;
    border-radius: 18px; /* 둥근 모서리도 비례해서 증가 */
    display: flex;
    align-items: flex-end;
    margin-bottom: 0.75rem; /* 하단 마진 증가 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 약간의 그림자 추가 */
}

.vertical-bar {
    width: 100%;
    border-radius: 18px; /* 실제 바의 모서리도 증가 */
    transition: height 0.6s ease;
    min-height: 6px; /* 최소 높이도 증가 */
}

.month-label {
    font-size: 0.95rem; /* 폰트 크기 증가 */
    color: #6c757d;
    font-weight: 600; /* 폰트 굵기 증가 */
    margin-bottom: 0.3rem;
}

.amount-label {
    font-size: 0.85rem; /* 폰트 크기 증가 */
    color: #333;
    font-weight: 700; /* 폰트 굵기 증가 */
}

/* 자주 쓰는 계좌 즐겨찾기 카드 */
.favorite-accounts-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
}

.favorite-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.favorite-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.manage-btn {
    background: none;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 0.25rem 0.75rem;
    font-size: 0.9rem;
    color: #20c997;
    cursor: pointer;
    transition: all 0.2s;
}

.manage-btn:hover {
    background-color: #20c997;
    color: white;
}

.favorite-accounts-list {
    margin-bottom: 1.5rem;
}

.favorite-account-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    background: #f8f9fa;
    margin-bottom: 0.75rem;
    transition: all 0.2s;
    cursor: pointer;
}

.favorite-account-item:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.account-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.account-details {
    flex: 1;
}

.account-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.account-info {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.bank-name {
    font-size: 0.85rem;
    color: #6c757d;
}

.account-number {
    font-size: 0.85rem;
    color: #6c757d;
}

.last-transfer {
    font-size: 0.8rem;
    color: #20c997;
}

.quick-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
}

.quick-transfer-btn {
    background: #20c997;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.quick-transfer-btn:hover {
    background: #17a2b8;
}

.transfer-amount {
    font-size: 0.75rem;
    color: #6c757d;
}

.add-favorite-btn {
    width: 100%;
    background: none;
    border: 2px dashed #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.add-favorite-btn:hover {
    border-color: #20c997;
    color: #20c997;
    background: rgba(32, 201, 151, 0.05);
}

/* 통화별 지갑 섹션 */
.currency-wallets-section {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.more-btn,
.sort-selector {
    background: none;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 0.25rem 0.75rem;
    font-size: 0.9rem;
    color: #20c997;
    cursor: pointer;
}

.wallet-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.wallet-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    background: #f8f9fa;
    transition: transform 0.2s;
    cursor: pointer;
}

.wallet-card:hover {
    transform: translateY(-1px);
}

.wallet-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
}

.currency-flag {
    font-size: 1.8rem;
}

.currency-name {
    font-weight: 600;
    color: #333;
    font-size: 0.8rem;
    margin-top: 0.25rem;
}

.wallet-balance {
    flex: 1;
    font-size: 1.1rem;
    font-weight: bold;
    color: #20c997;
}

.wallet-krw {
    font-size: 0.8rem;
    color: #6c757d;
    text-align: right;
}

.wallet-arrow {
    color: #6c757d;
    font-size: 1.2rem;
}

/* 거래 내역 */
.transaction-history {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    background: #f8f9fa;
}

.transaction-icon {
    font-size: 1.5rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: white;
}

.transaction-info {
    flex: 1;
}

.transaction-desc {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.transaction-date {
    font-size: 0.8rem;
    color: #6c757d;
}

.transaction-amount {
    font-weight: 600;
}

.transaction-amount.expense {
    color: #dc3545;
}

.transaction-amount.income {
    color: #20c997;
}

/* 반응형 */
@media (max-width: 1200px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }

    .wallet-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .main-content {
        margin: 2rem;
    }

    .wallet-grid {
        grid-template-columns: 1fr;
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
    }

    .quick-actions {
        flex-direction: row;
        align-items: center;
    }
}
</style>
