<template>
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
        <h2 class="page-title">계좌 조회</h2>

        <div class="dashboard-grid">
            <!-- 총 보유 금액 - 도넛 차트로 변경 -->
            <div class="total-balance-card">
                <div class="balance-header">
                    <span class="balance-title">총 보유 금액</span>
                </div>
                <div class="total-amount">{{ formatAmount(totalBalance) }}</div>
                
                <!-- 도넛 차트 -->
                <div class="currency-chart-container">
                    <div class="donut-chart">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <!-- 배경 원 -->
                            <circle cx="100" cy="100" r="80" fill="none" 
                                   stroke="#f1f3f4" stroke-width="25"/>
                            
                            <!-- 각 통화별 도넛 조각 -->
                            <circle v-for="(segment, index) in chartSegments" 
                                   :key="segment.currency"
                                   cx="100" cy="100" r="80" 
                                   fill="none" 
                                   :stroke="segment.color" 
                                   stroke-width="25"
                                   :stroke-dasharray="`${segment.dashArray} ${502 - segment.dashArray}`"
                                   :stroke-dashoffset="segment.offset"
                                   transform="rotate(-90 100 100)"
                                   class="chart-segment"
                                   @mouseover="highlightSegment(index)"
                                   @mouseout="unhighlightSegment"/>
                        </svg>
                        
                        <!-- 중앙 텍스트 -->
                        <div class="chart-center">
                            <div class="chart-total">총 보유</div>
                            <div class="chart-currencies">{{ currencyWallets.length }}개 통화</div>
                        </div>
                    </div>
                    
                    <!-- 범례 -->
                    <div class="chart-legend">
                        <div v-for="(segment, index) in chartSegments" 
                             :key="segment.currency" 
                             class="legend-item"
                             :class="{ highlighted: highlightedIndex === index }">
                            <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
                            <div class="legend-info">
                                <div class="legend-currency">
                                    {{ segment.flag }} {{ segment.name }}
                                </div>
                                <div class="legend-amount">
                                    {{ formatAmount(segment.krwAmount) }}
                                </div>
                                <div class="legend-percentage">
                                    {{ segment.percentage.toFixed(1) }}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 자주 쓰는 계좌 즐겨찾기 카드 -->
            <div class="favorite-accounts-card">
                <div class="favorite-header">
                    <h3>⭐ 친구 즐겨찾기</h3>
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
                    <h3>통화별 계좌</h3>
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
        
        const selectedPeriod = ref('currency')
        const sortBy = ref('date')
        const highlightedIndex = ref(-1)

        // 통화별 지갑
        const currencyWallets = ref([
            {
                currency: 'KRW',
                name: '원화',
                flag: '🇰🇷',
                balance: 12547000,
                rate: 1,
                color: '#20c997'
            },
            {
                currency: 'USD',
                name: '달러',
                flag: '🇺🇸',
                balance: 8420.50,
                rate: 1293.33,
                color: '#fd7e14'
            },
            {
                currency: 'JPY',
                name: '엔화',
                flag: '🇯🇵',
                balance: 850000,
                rate: 8.95,
                color: '#6f42c1'
            },
            {
                currency: 'EUR',
                name: '유로',
                flag: '🇪🇺',
                balance: 3250.80,
                rate: 1410.25,
                color: '#e83e8c'
            }
        ])

        // 총 보유 금액 계산
        const totalBalance = computed(() => {
            return currencyWallets.value.reduce((total, wallet) => {
                return total + convertToKRW(wallet.balance, wallet.rate)
            }, 0)
        })

        // 차트 세그먼트 계산
        const chartSegments = computed(() => {
            const total = totalBalance.value
            const circumference = 2 * Math.PI * 80 // 반지름 80인 원의 둘레
            let currentOffset = 0
            
            return currencyWallets.value
                .map(wallet => {
                    const krwAmount = convertToKRW(wallet.balance, wallet.rate)
                    const percentage = (krwAmount / total) * 100
                    const dashArray = (percentage / 100) * circumference
                    
                    const segment = {
                        currency: wallet.currency,
                        name: wallet.name,
                        flag: wallet.flag,
                        krwAmount,
                        percentage,
                        color: wallet.color,
                        dashArray,
                        offset: -currentOffset
                    }
                    
                    currentOffset += dashArray
                    return segment
                })
                .sort((a, b) => b.percentage - a.percentage)
        })

        // 세그먼트 하이라이트
        const highlightSegment = (index) => {
            highlightedIndex.value = index
        }

        const unhighlightSegment = () => {
            highlightedIndex.value = -1
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
            // {
            //     id: 2,
            //     name: '하버드대학교',
            //     bank: 'Chase Bank',
            //     accountNumber: '***-***-9876',
            //     icon: '🏫',
            //     lastTransfer: '1주 전 송금',
            //     usualAmount: '보통 $8,000'
            // },
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

        // 거래 내역
        const transactions = ref([
            {
                id: 1,
                type: 'expense',
                category: 'exchange',
                description: 'KRW → JPY 환전',
                date: '07월 22일 2024',
                amount: 89000
            },
            {
                id: 2,
                type: 'income',
                category: 'deposit',
                description: '원화 충전',
                date: '07월 20일 2024',
                amount: 3200000
            },
            {
                id: 3,
                type: 'expense',
                category: 'exchange',
                description: 'USD → KRW',
                date: '07월 19일 2024',
                amount: 50000
            },
            {
                id: 4,
                type: 'expense',
                category: 'transfer',
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
            alert('즐겨찾기 관리 페이지로 이동')
        }

        const quickTransfer = (account) => {
            alert(`${account.name}에게 송금`, account)
        }

        const addFavorite = () => {
            alert('새 즐겨찾기 계좌 추가')
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
                exchange: '💱',
                deposit: '💰',
                transfer: '💸',
                withdraw: '🏧',
                investment: '📈'
            }
            return icons[category] || '💳'
        }

        return {
            selectedPeriod,
            sortBy,
            totalBalance,
            currencyWallets,
            chartSegments,
            highlightedIndex,
            highlightSegment,
            unhighlightSegment,
            favoriteAccounts,
            transactions,
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
    margin: 3rem;
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
    font-size: 1rem;
}

.total-amount {
    font-size: 2.2rem;
    font-weight: 700;
    color: #20c997;
    margin-bottom: 2rem;
}

/* 도넛 차트 컨테이너 */
.currency-chart-container {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
}

/* 도넛 차트 */
.donut-chart {
    position: relative;
    width: 200px;
    height: 200px;
    flex-shrink: 0;
}

.chart-segment {
    transition: all 0.3s ease;
    cursor: pointer;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.chart-segment:hover {
    stroke-width: 30;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.chart-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: white;
    border-radius: 50%;
    width: 90px;
    height: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-total {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.chart-currencies {
    font-size: 0.9rem;
    font-weight: 700;
    color: #333;
}

/* 범례 */
.chart-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    cursor: pointer;
}

.legend-item:hover,
.legend-item.highlighted {
    background: #e9ecef;
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-info {
    flex: 1;
}

.legend-currency {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.legend-amount {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.125rem;
}

.legend-percentage {
    font-size: 1.1rem;
    font-weight: 700;
    color: #20c997;
}

/* 자주 쓰는 계좌 즐겨찾기 카드 */
.favorite-accounts-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    color: #20c997;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
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
    padding: 1.25rem;
    border-radius: 12px;
    background: #f8f9fa;
    margin-bottom: 0.75rem;
    transition: all 0.2s;
    cursor: pointer;
}

.favorite-account-item:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.account-details {
    flex: 1;
}

.account-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 1rem;
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
    font-weight: 500;
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
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.quick-transfer-btn:hover {
    background: #17a2b8;
    transform: scale(1.05);
}

.transfer-amount {
    font-size: 0.75rem;
    color: #6c757d;
}

.add-favorite-btn {
    width: 100%;
    background: none;
    border: 2px dashed #e9ecef;
    border-radius: 12px;
    padding: 1.25rem;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    color: #20c997;
    cursor: pointer;
    transition: all 0.2s;
}

.more-btn:hover,
.sort-selector:hover {
    background: #f8f9fa;
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
    padding: 1.25rem;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.2s;
    cursor: pointer;
}

.wallet-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #e9ecef;
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
    font-weight: 700;
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
    transition: transform 0.2s;
}

.wallet-card:hover .wallet-arrow {
    transform: translateX(4px);
}

/* 거래 내역 */
.transaction-history {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
    padding: 1.25rem;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.2s;
}

.transaction-item:hover {
    background: #e9ecef;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-icon {
    font-size: 1.5rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transaction-info {
    flex: 1;
}

.transaction-desc {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #333;
}

.transaction-date {
    font-size: 0.8rem;
    color: #6c757d;
}

.transaction-amount {
    font-weight: 700;
    font-size: 1rem;
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

    .currency-chart-container {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }
}

@media (max-width: 768px) {
    .main-content {
        margin: 1rem;
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .wallet-grid {
        grid-template-columns: 1fr;
    }

    .currency-chart-container {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .donut-chart {
        width: 180px;
        height: 180px;
    }

    .chart-center {
        width: 80px;
        height: 80px;
    }

    .quick-actions {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .total-balance-card,
    .favorite-accounts-card,
    .currency-wallets-section,
    .transaction-history {
        padding: 1.5rem;
    }
}
</style>
