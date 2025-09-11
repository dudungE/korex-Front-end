<template>
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
        <h2 class="page-title">계좌 조회</h2>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner">로딩 중...</div>
        </div>

        <!-- 데이터가 없을 때 -->
        <div v-else-if="!balanceData || balanceData.length === 0" class="no-account-data">
            <p>계좌 정보를 불러올 수 없습니다.</p>
            <button @click="loadInitialData" class="retry-btn">다시 시도</button>
        </div>

        <div v-else class="dashboard-grid">
            <!-- 총 보유 금액 - 도넛 차트 -->
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
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f3f4" stroke-width="25" />

                            <!-- 각 통화별 도넛 조각 -->
                            <circle v-for="(segment, index) in chartSegments" :key="segment.id" cx="100" cy="100" r="80"
                                fill="none" :stroke="segment.color" stroke-width="25"
                                :stroke-dasharray="`${segment.dashArray} ${502 - segment.dashArray}`"
                                :stroke-dashoffset="segment.offset" transform="rotate(-90 100 100)"
                                class="chart-segment" @mouseover="highlightSegment(index)"
                                @mouseout="unhighlightSegment" />
                        </svg>

                        <!-- 중앙 텍스트 -->
                        <div class="chart-center">
                            <div class="chart-total">총 보유</div>
                            <div class="chart-currencies">
                                {{ availableWalletsCount }}개 통화
                                <span v-if="availableWalletsCount > 4" class="other-count">
                                    (상위 4개 표시)
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 원본 통화 금액과 원화 환산 금액 함께 표시 -->
                    <div class="chart-legend">
                        <div v-for="(segment, index) in chartSegments" :key="segment.id" class="legend-item"
                            :class="{ highlighted: highlightedIndex === index }">
                            <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
                            <div class="legend-info">
                                <div class="legend-currency">
                                    {{ segment.flag }} {{ segment.name }}
                                    <span v-if="segment.isOther" class="other-detail">
                                        ({{ segment.otherCount }}개 통화)
                                    </span>
                                </div>
                                <!-- 원본 통화 금액 표시 추가 -->
                                <div v-if="!segment.isOther" class="legend-original-amount">
                                    {{ formatCurrencyAmount(segment.originalAmount, segment.currency) }}
                                </div>
                                <div class="legend-krw-amount">
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

            <!-- 거래 내역 (동적 개수) -->
            <div class="transaction-history">
                <div class="section-header">
                    <h3>최근 거래 내역</h3>
                    <button class="more-btn" @click="goToTransactionHistory">전체보기</button>
                </div>

                <!-- 거래내역이 없을 때 -->
                <div v-if="!recentTransactions || recentTransactions.length === 0" class="no-transaction-data">
                    <div class="no-transaction-message">
                        <div class="no-transaction-icon">📋</div>
                        <div class="no-transaction-text">최근 거래내역이 없습니다</div>
                    </div>
                </div>

                <!-- 거래내역이 있을 때 -->
                <div v-else class="transaction-list">
                    <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
                        <div class="transaction-icon" :class="getTransactionType(transaction)">
                            {{ getTransactionIcon(transaction) }}
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-desc">{{ getTransactionDescription(transaction) }}</div>
                            <div class="transaction-date">{{ formatTransactionDate(transaction.createdAt) }}</div>
                        </div>
                        <!-- 통화별로 올바르게 표시 -->
                        <div class="transaction-amount" :class="getTransactionType(transaction)">
                            {{ getTransactionType(transaction) === 'expense' ? '-' : '+' }}{{
                                getFormattedTransactionAmount(transaction) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
    name: 'AccountDashboard',
    setup() {
        const router = useRouter()

        // 상태 관리
        const isLoading = ref(true)
        const highlightedIndex = ref(-1)

        // 데이터 - DTO는 4개 필드만, 환율은 별도 관리
        const balanceData = ref([]) // DTO: code, name, amount, flag 만
        const exchangeRates = ref({}) // 통화별 환율 저장
        const allTransactions = ref([]) // 모든 거래 저장
        const userId = localStorage.getItem('userId')

        // API 설정
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ko-forex.shop'

        // Axios 기본 설정
        axios.defaults.baseURL = API_BASE_URL
        axios.defaults.withCredentials = true

        // API 함수들
        const api = {
            // 사용자 잔액 조회 (4개 필드만: code, name, amount, flag)
            async getUserBalances(userId) {
                try {
                    const response = await axios.get(`/api/balance/${userId}`)
                    return response.data
                } catch (error) {
                    console.error('Balance API Error:', error)
                    throw error
                }
            },

            // 특정 통화의 실시간 환율 조회
            async getExchangeRate(currencyCode) {
                try {
                    const response = await axios.get(`/api/exchange/realtime/${currencyCode}`)
                    const rateData = response.data

                    if (rateData && rateData.length > 0 && rateData[0].base_rate) {
                        const baseRateStr = rateData[0].base_rate  // "1,396.40"
                        const cleanRate = baseRateStr.replace(/,/g, '')  // "1396.40"
                        let rate = parseFloat(cleanRate)  // 1396.40

                        // JPY는 100단위 통화이므로 환율을 100으로 나눔
                        if (currencyCode === 'JPY') {
                            rate = rate / 100
                        }
                        return rate
                    }

                    // 기본값 반환
                    return currencyCode === 'KRW' ? 1 : (currencyCode === 'JPY' ? 9.4 : 1300)
                } catch (error) {
                    console.error(`Exchange Rate API Error for ${currencyCode}:`, error)
                    return currencyCode === 'KRW' ? 1 : (currencyCode === 'JPY' ? 9.4 : 1300)
                }
            },

            // 거래내역 조회
            async getTransactionHistory(userId) {
                try {
                    const response = await axios.get(`/api/transaction/history/${userId}`)
                    return response.data
                } catch (error) {
                    console.error('Transaction History API Error:', error)
                    throw error
                }
            }
        }

        // 환율 정보 로드
        const loadExchangeRates = async (currencyCodes) => {
            const ratePromises = currencyCodes.map(async (code) => {
                if (code === 'KRW') {
                    return { code, rate: 1 }
                }

                try {
                    const rate = await api.getExchangeRate(code)
                    return { code, rate }
                } catch (error) {
                    console.error(`Failed to load exchange rate for ${code}:`, error)
                    return { code, rate: code === 'JPY' ? 9.4 : 1300 } // 기본값
                }
            })

            const rates = await Promise.all(ratePromises)
            const rateMap = {}
            rates.forEach(({ code, rate }) => {
                rateMap[code] = rate
            })

            exchangeRates.value = rateMap
            console.log("로드된 환율 정보:", rateMap)
        }

        // Computed Properties - DTO와 환율 정보 결합
        const currencyWallets = computed(() => {
            return balanceData.value.map(balance => {
                const exchangeRate = exchangeRates.value[balance.code] || 1
                const krwAmount = convertToKRW(balance.amount, exchangeRate)

                return {
                    code: balance.code,        // DTO 필드
                    name: balance.name,        // DTO 필드
                    amount: balance.amount,    // DTO 필드
                    flag: balance.flag,        // DTO 필드
                    exchangeRate: exchangeRate, // 실시간 환율 API에서 가져온 값
                    krwAmount: krwAmount,
                    color: getCurrencyColor(balance.code)
                }
            })
        })

        const totalBalance = computed(() => {
            return currencyWallets.value.reduce((total, wallet) => {
                return total + wallet.krwAmount
            }, 0)
        })

        // 잔액이 있는 지갑만 정렬 (KRW 우선순위 제거, 원화 환산 금액 기준)
        const sortedWallets = computed(() => {
            return [...currencyWallets.value]
                .filter(wallet => parseCleanFloat(wallet.amount) > 0) // 잔액이 0보다 큰 지갑만
                .sort((a, b) => b.krwAmount - a.krwAmount) // 원화 환산 금액 기준으로만 정렬
        })

        // 잔액이 있는 지갑 개수
        const availableWalletsCount = computed(() => sortedWallets.value.length)

        // 상위 4개 지갑 (차트용)
        const topWallets = computed(() => sortedWallets.value.slice(0, 4))

        // 기타 지갑들 (차트용)
        const otherWallets = computed(() => sortedWallets.value.slice(4))

        // 기타 지갑들의 총합
        const otherWalletsTotal = computed(() => {
            return otherWallets.value.reduce((total, wallet) => {
                return total + wallet.krwAmount
            }, 0)
        })

        // 차트 세그먼트 계산 - 원본 통화 금액 포함
        const chartSegments = computed(() => {
            const total = totalBalance.value
            if (total === 0) {
                const krwWallet = currencyWallets.value.find(wallet => wallet.code === 'KRW')
                if (krwWallet) {
                    return [{
                        id: 'KRW',
                        currency: 'KRW',
                        name: krwWallet.name,
                        flag: krwWallet.flag,
                        originalAmount: 0,
                        krwAmount: 0,
                        percentage: 100,
                        color: getCurrencyColor('KRW'),
                        dashArray: 2 * Math.PI * 80, // 전체 원둘레
                        offset: 0,
                        isOther: false
                    }]
                }
                return []
            }
            const circumference = 2 * Math.PI * 80
            let currentOffset = 0
            const segments = []

            // 상위 4개 통화
            topWallets.value.forEach((wallet) => {
                const krwAmount = wallet.krwAmount
                const percentage = (krwAmount / total) * 100
                const dashArray = (percentage / 100) * circumference

                segments.push({
                    id: wallet.code,
                    currency: wallet.code,
                    name: wallet.name,
                    flag: wallet.flag,
                    originalAmount: wallet.amount,  // 원본 통화 금액 추가
                    krwAmount,
                    percentage,
                    color: wallet.color,
                    dashArray,
                    offset: -currentOffset,
                    isOther: false
                })

                currentOffset += dashArray
            })

            // 기타 통화들 (5개 이상일 때만)
            if (otherWallets.value.length > 0) {
                const otherKrwAmount = otherWalletsTotal.value
                const otherPercentage = (otherKrwAmount / total) * 100
                const otherDashArray = (otherPercentage / 100) * circumference

                segments.push({
                    id: 'others',
                    currency: 'OTHERS',
                    name: '기타',
                    flag: '📊',
                    krwAmount: otherKrwAmount,
                    percentage: otherPercentage,
                    color: '#6c757d',
                    dashArray: otherDashArray,
                    offset: -currentOffset,
                    isOther: true,
                    otherCount: otherWallets.value.length
                })
            }

            return segments
        })

        // **핵심 추가**: 차트 범례 개수에 따른 동적 거래내역 표시
        const recentTransactions = computed(() => {
            const chartSegmentsCount = chartSegments.value.length
            
            // 차트 범례 개수에 따라 거래내역 표시 개수 조정
            // 기본 4개, 범례가 5개면 6개, 범례가 6개면 8개 표시
            let displayCount = Math.max(4, chartSegmentsCount + 1)
            
            // 최대 8개까지만 표시
            displayCount = Math.min(displayCount, 8)
            
            return allTransactions.value.slice(0, displayCount)
        })

        // 데이터 로드 - 잔액 DTO와 환율을 분리해서 로드
        const loadBalanceData = async () => {
            try {
                // 1. 잔액 정보 먼저 로드 (4개 필드만: code, name, amount, flag)
                const data = await api.getUserBalances(userId)
                balanceData.value = Array.isArray(data) ? data : []
                console.log("계좌 정보 (4개 필드)", balanceData.value)

                // 2. 통화 코드 목록 추출
                const currencyCodes = balanceData.value.map(item => item.code)

                // 3. 각 통화별 환율 정보를 실시간 API에서 로드
                if (currencyCodes.length > 0) {
                    await loadExchangeRates(currencyCodes)
                }

            } catch (error) {
                console.error('Failed to load balance data:', error)
                balanceData.value = []
                exchangeRates.value = { 'KRW': 1 }
                alert('계좌 정보를 불러오는데 실패했습니다.')
            }
        }

        const loadTransactionHistory = async () => {
            try {
                const data = await api.getTransactionHistory(userId)
                let transactions = []

                if (Array.isArray(data)) {
                    transactions = data
                } else if (data && Array.isArray(data.transactions)) {
                    transactions = data.transactions
                } else if (data && Array.isArray(data.data)) {
                    transactions = data.data
                }

                // **수정**: 모든 거래를 저장하고 computed에서 동적으로 처리
                allTransactions.value = transactions
            } catch (error) {
                console.error('Failed to load transaction history:', error)
            }
        }

        // 초기 데이터 로드
        const loadInitialData = async () => {
            isLoading.value = true
            try {
                await Promise.all([
                    loadBalanceData(), // 잔액과 환율 정보를 함께 로드
                    loadTransactionHistory()
                ])
            } catch (error) {
                console.error('Failed to load initial data:', error)
            } finally {
                isLoading.value = false
            }
        }

        // 이벤트 핸들러들
        const highlightSegment = (index) => {
            highlightedIndex.value = index
        }

        const unhighlightSegment = () => {
            highlightedIndex.value = -1
        }

        // 네비게이션 함수들
        const goToTransactionHistory = () => {
            router.push({
                path: '/account/detail',
                query: { 
                    currencyCode: 'KRW'  // 기본값을 KRW로 설정
                }
            })
        }

        // 핵심 헬퍼 함수들
        // 콤마가 포함된 문자열을 안전하게 숫자로 변환
        const parseCleanFloat = (value) => {
            if (typeof value === 'number') return value
            if (typeof value === 'string') {
                return parseFloat(value.replace(/,/g, ''))
            }
            return parseFloat(value) || 0
        }

        const formatAmount = (amount) => {
            return new Intl.NumberFormat('ko-KR').format(Math.floor(amount)) + '원'
        }

        const formatCurrencyAmount = (amount, currency) => {
            const cleanAmount = parseCleanFloat(amount)

            if (currency === 'KRW') {
                return new Intl.NumberFormat('ko-KR').format(Math.floor(cleanAmount)) + '원'
            }
            return new Intl.NumberFormat('ko-KR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(cleanAmount) + ' ' + currency
        }

        // 핵심 수정: convertToKRW 함수
        const convertToKRW = (amount, rate) => {
            // 콤마 제거 후 파싱
            const cleanAmount = parseCleanFloat(amount)
            // 환율 적용
            const result = Math.floor(cleanAmount * rate)

            return result
        }

        const getCurrencyColor = (currencyCode) => {
            const colors = {
                'KRW': '#20c997', 'USD': '#fd7e14', 'JPY': '#6f42c1',
                'EUR': '#e83e8c', 'CNY': '#dc3545', 'GBP': '#0d6efd',
                'CAD': '#198754', 'AUD': '#ffc107', 'CHF': '#6610f2'
            }
            return colors[currencyCode] || '#6c757d'
        }

        // 거래내역 관련 헬퍼 함수들
        const getTransactionType = (transaction) => {
            if (transaction.fromUserId && transaction.fromUserId === parseInt(userId)) {
                return 'expense'
            } else if (transaction.toUserId && transaction.toUserId === parseInt(userId)) {
                return 'income'
            }
            return 'expense'
        }

        const getTransactionIcon = (transaction) => {
            const type = transaction.transactionType
            const icons = {
                'EXCHANGE': '💱',
                'DEPOSIT': '💰',
                'TRANSFER': '💸',
                'WITHDRAW': '🏧'
            }
            return icons[type] || '💳'
        }

        const getTransactionDescription = (transaction) => {
            const type = transaction.transactionType
            const isExpense = getTransactionType(transaction) === 'expense'

            switch (type) {
                case 'TRANSFER':
                    if (isExpense) {
                        return `${transaction.fromCurrencyCode} 친구송금 (${transaction.toUserName})`
                    } else {
                        return `${transaction.toCurrencyCode} 친구송금 받음 (${transaction.fromUserName})`
                    }
                case 'EXCHANGE':
                    return `${transaction.fromCurrencyCode} → ${transaction.toCurrencyCode} 환전`
                case 'DEPOSIT':
                    return `${transaction.toCurrencyCode} 충전`
                case 'WITHDRAW':
                    return `${transaction.fromCurrencyCode} 출금`
                default:
                    return '기타 거래'
            }
        }

        const getTransactionAmount = (transaction) => {
            const isExpense = getTransactionType(transaction) === 'expense'
            if (isExpense) {
                return transaction.totalDeductedAmount || transaction.sendAmount
            } else {
                return transaction.receiveAmount
            }
        }

        // 새로 추가된 함수 - 거래내역 금액을 올바른 통화로 포맷팅
        const getFormattedTransactionAmount = (transaction) => {
            const amount = getTransactionAmount(transaction)
            const isExpense = getTransactionType(transaction) === 'expense'

            // 거래 타입에 따라 적절한 통화 코드 선택
            let currencyCode
            if (isExpense) {
                // 지출: fromCurrencyCode 사용
                currencyCode = transaction.fromCurrencyCode
            } else {
                // 수입: toCurrencyCode 사용
                currencyCode = transaction.toCurrencyCode
            }

            // 통화 코드로 포맷팅
            return formatCurrencyAmount(amount, currencyCode)
        }

        const formatTransactionDate = (dateString) => {
            const date = new Date(dateString)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()

            return `${year}년 ${month}월 ${day}일`
        }

        // 컴포넌트 마운트
        onMounted(() => {
            loadInitialData()
        })

        return {
            // 상태
            isLoading,
            highlightedIndex,
            balanceData,
            exchangeRates,
            currencyWallets,
            sortedWallets,
            totalBalance,
            availableWalletsCount,
            topWallets,
            otherWallets,
            otherWalletsTotal,
            chartSegments,
            recentTransactions, // computed로 변경
            allTransactions,    // 추가

            // 메소드
            highlightSegment,
            unhighlightSegment,
            formatAmount,
            formatCurrencyAmount,
            convertToKRW,
            getCurrencyColor,
            getTransactionType,
            getTransactionIcon,
            getTransactionDescription,
            getTransactionAmount,
            getFormattedTransactionAmount,
            formatTransactionDate,
            goToTransactionHistory,
            loadInitialData
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
    padding: 40px 48px;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 2rem;
}

.loading-container,
.no-account-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
    gap: 1rem;
}

.loading-spinner {
    font-size: 1.2rem;
    color: #20c997;
    font-weight: 600;
}

.retry-btn {
    background: #20c997;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
}

.retry-btn:hover {
    background: #17a2b8;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

/* **핵심 추가**: 양쪽 카드의 최소 높이를 동일하게 맞춤 */
.total-balance-card,
.transaction-history {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    min-height: 600px; /* 최소 높이 설정 */
    display: flex;
    flex-direction: column;
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

.currency-chart-container {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex: 1; /* 남은 공간 모두 사용 */
}

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

.other-count {
    font-size: 0.7rem;
    color: #6c757d;
    font-weight: 400;
    display: block;
    margin-top: 0.125rem;
}

.chart-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow: hidden auto; /* 내용이 길어지면 스크롤 */
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

.other-detail {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 400;
}

.legend-original-amount {
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 0.25rem;
    font-weight: 600;
}

.legend-krw-amount {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.125rem;
}

.legend-percentage {
    font-size: 1.1rem;
    font-weight: 700;
    color: #20c997;
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

.more-btn {
    background: none;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    color: #20c997;
    cursor: pointer;
    transition: all 0.2s;
}

.more-btn:hover {
    background: #f8f9fa;
}

.no-transaction-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 1rem;
    flex: 1; /* 남은 공간 모두 사용 */
}

.no-transaction-message {
    text-align: center;
    color: #6c757d;
}

.no-transaction-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
}

.no-transaction-text {
    font-size: 1rem;
    font-weight: 500;
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1; /* 남은 공간 모두 사용 */
    overflow-y: auto; /* 내용이 많아지면 스크롤 */
}

.transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.2s;
    flex-shrink: 0; /* 아이템 크기 고정 */
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

@media (max-width: 1200px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .currency-chart-container {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .total-balance-card,
    .transaction-history {
        min-height: auto; /* 모바일에서는 최소 높이 제거 */
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 2rem 1rem;
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
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

    .total-balance-card,
    .transaction-history {
        padding: 1.5rem;
        min-height: auto;
    }
}
</style>
