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

                    <!-- 🔥 범례 - 원본 통화 금액과 원화 환산 금액 함께 표시 -->
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
                                <!-- 🔥 원본 통화 금액 표시 추가 -->
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

            <!-- 통화별 지갑 -->
            <div class="currency-wallets-section">
                <div class="section-header">
                    <h3>통화별 계좌</h3>
                    <div class="currency-controls">
                        <!-- 통화 선택 드롭다운 -->
                        <select class="currency-selector" v-model="selectedCurrencyFilter" @change="filterCurrency">
                            <option v-for="wallet in sortedWallets" :key="wallet.code" :value="wallet.code">
                                {{ wallet.flag }} {{ wallet.name }} ({{ wallet.code }})
                            </option>
                        </select>
                    </div>
                </div>

                <!-- 선택된 통화 상세 정보 -->
                <div v-if="selectedCurrencyWallet" class="selected-currency-detail">
                    <div class="currency-detail-card">
                        <div class="currency-header-large">
                            <div class="currency-flag-large">{{ selectedCurrencyWallet.flag }}</div>
                            <div class="currency-info-large">
                                <div class="currency-name-large">{{ selectedCurrencyWallet.name }}</div>
                                <div class="currency-code-large">{{ selectedCurrencyWallet.code }}</div>
                            </div>
                        </div>
                        <div class="currency-balance-large">
                            {{ formatCurrencyAmount(selectedCurrencyWallet.amount, selectedCurrencyWallet.code) }}
                        </div>
                        <div class="currency-krw-large">
                            ≈ {{ formatAmount(convertToKRW(selectedCurrencyWallet.amount,
                            selectedCurrencyWallet.exchangeRate)) }}
                        </div>
                        <div class="currency-actions">
                            <button class="action-btn exchange-btn" @click="goToExchange(selectedCurrencyWallet.code)">
                                환전하기
                            </button>
                            <button class="action-btn detail-btn"
                                @click="goToWalletDetail(selectedCurrencyWallet.code)">
                                상세보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 자주 쓰는 계좌 즐겨찾기 카드 -->
            <div class="favorite-accounts-card">
                <div class="favorite-header">
                    <h3>⭐ 친구 즐겨찾기</h3>
                    <button class="manage-btn" @click="toggleManageMode">
                        {{ isManagingFavorites ? '완료' : '관리' }}
                    </button>
                </div>

                <div class="favorite-accounts-list">
                    <div v-for="account in favoriteAccounts" :key="account.favoriteId" class="favorite-account-item"
                        :class="{ 'manage-mode': isManagingFavorites }"
                        @click="!isManagingFavorites && openTransferModal(account)">
                        <div class="account-avatar">
                            <span class="avatar-icon">{{ account.icon }}</span>
                        </div>
                        <div class="account-details">
                            <div class="account-name">{{ account.realName }}</div>
                            <div class="account-info">
                                <span class="account-number">{{ account.phoneNumber }}</span>
                            </div>
                            <div class="last-transfer">{{ account.lastTransfer }}</div>
                        </div>
                        <div class="quick-actions">
                            <button v-if="!isManagingFavorites" class="quick-transfer-btn"
                                @click.stop="openTransferModal(account)">
                                💸 송금
                            </button>
                            <button v-else class="delete-btn" @click.stop="deleteFavorite(account.favoriteId)">
                                🗑️ 삭제
                            </button>
                        </div>
                    </div>
                </div>

                <button v-if="favoriteAccounts.length < 4" class="add-favorite-btn" @click="openAddModal">
                    + 자주 쓰는 계좌 추가
                </button>
                <div v-else class="max-favorites-notice">
                    최대 4명까지 등록 가능합니다
                </div>
            </div>

            <!-- 🔥 거래 내역 (최근 4개만) - 빈 상태 처리 추가 -->
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
                        <div class="transaction-amount" :class="getTransactionType(transaction)">
                            {{ getTransactionType(transaction) === 'expense' ? '-' : '+' }}{{
                                formatAmount(getTransactionAmount(transaction)) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 친구 추가 모달 -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>친구 추가</h3>
                    <button class="close-btn" @click="closeAddModal">×</button>
                </div>

                <form @submit.prevent="addFriend" class="add-friend-form">
                    <div class="form-group">
                        <label for="friendName">친구 이름</label>
                        <input type="text" id="friendName" v-model="newFriend.name" placeholder="친구 이름을 입력하세요"
                            :class="{ error: errors.name }" required>
                        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                    </div>

                    <div class="form-group">
                        <label for="friendPhone">전화번호</label>
                        <input type="tel" id="friendPhone" v-model="newFriend.phoneNumber"
                            placeholder="전화번호를 입력하세요 (예: 010-1234-5678)" :class="{ error: errors.phoneNumber }"
                            maxlength="13" @input="formatPhoneNumber" required>
                        <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="cancel-btn" @click="closeAddModal">취소</button>
                        <button type="submit" class="confirm-btn" :disabled="isVerifying">
                            {{ isVerifying ? '확인 중...' : '추가' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 송금 모달 -->
        <div v-if="showTransferModal" class="modal-overlay" @click="closeTransferModal">
            <div class="modal-content transfer-modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ selectedAccount?.realName }}에게 송금</h3>
                    <button class="close-btn" @click="closeTransferModal">×</button>
                </div>

                <div class="transfer-form">
                    <!-- 통화 선택 -->
                    <div class="form-group">
                        <label>송금할 통화 선택</label>
                        <div class="currency-selection">
                            <div v-for="wallet in availableWallets" :key="wallet.code" class="currency-card"
                                :class="{ selected: selectedCurrency === wallet.code }" @click="selectCurrency(wallet)">
                                <div class="currency-info">
                                    <span class="currency-flag">{{ wallet.flag }}</span>
                                    <div class="currency-details">
                                        <div class="currency-name">{{ wallet.name }}</div>
                                        <div class="currency-code">{{ wallet.code }}</div>
                                    </div>
                                </div>
                                <div class="currency-balance">
                                    <div class="balance-amount">{{ formatCurrencyAmount(wallet.amount, wallet.code) }}
                                    </div>
                                    <div class="balance-krw">{{ formatAmount(convertToKRW(wallet.amount,
                                        wallet.exchangeRate)) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 송금 금액 입력 -->
                    <div class="form-group">
                        <label>송금 금액</label>
                        <div class="amount-input-container">
                            <input type="number" v-model="transferAmount" :placeholder="`${selectedCurrency}로 입력`"
                                class="amount-input" min="0" step="0.01">
                            <span class="currency-symbol">{{ selectedCurrency }}</span>
                        </div>
                        <div class="balance-info">
                            사용 가능한 잔액: {{ formatCurrencyAmount(selectedWalletBalance, selectedCurrency) }}
                        </div>
                        <div v-if="transferAmount && parseFloat(transferAmount) > selectedWalletBalance"
                            class="error-message">
                            잔액이 부족합니다
                        </div>
                    </div>

                    <!-- 계좌 비밀번호 입력 -->
                    <div class="form-group">
                        <label>계좌 비밀번호</label>
                        <input type="password" v-model="accountPassword" placeholder="계좌 비밀번호 4자리를 입력하세요"
                            class="password-input" maxlength="6" pattern="[0-9]{6}" @input="validatePassword" required>
                        <div class="password-dots">
                            <span v-for="i in 4" :key="i" class="password-dot"
                                :class="{ filled: accountPassword.length >= i }"></span>
                        </div>
                        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
                    </div>

                    <!-- 송금 확인 정보 -->
                    <div v-if="transferAmount && selectedCurrency && accountPassword.length === 4"
                        class="transfer-summary">
                        <div class="summary-title">송금 정보</div>
                        <div class="summary-row">
                            <span>받는 사람</span>
                            <span>{{ selectedAccount?.realName }}</span>
                        </div>
                        <div class="summary-row">
                            <span>송금 금액</span>
                            <span>{{ formatCurrencyAmount(parseFloat(transferAmount), selectedCurrency) }}</span>
                        </div>
                        <div class="summary-row">
                            <span>수수료</span>
                            <span class="free">무료</span>
                        </div>
                        <div class="summary-row total">
                            <span>총 차감 금액</span>
                            <span>{{ formatCurrencyAmount(parseFloat(transferAmount), selectedCurrency) }}</span>
                        </div>
                    </div>

                    <!-- 송금 버튼 -->
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn" @click="closeTransferModal">취소</button>
                        <button type="button" class="confirm-btn transfer-confirm-btn" :disabled="!canTransfer"
                            @click="confirmTransfer">
                            {{ isTransferring ? '송금 중...' : '송금하기' }}
                        </button>
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
        const isTransferring = ref(false)
        const highlightedIndex = ref(-1)
        const selectedCurrencyFilter = ref('KRW')
        const isManagingFavorites = ref(false)

        // 친구 추가 모달 관련 상태
        const showAddModal = ref(false)
        const isVerifying = ref(false)
        const newFriend = ref({
            name: '',
            phoneNumber: ''
        })
        const errors = ref({
            name: '',
            phoneNumber: ''
        })

        // 전화번호 전달용 
        const rawPhone = ref('')

        // 송금 모달 관련 상태
        const showTransferModal = ref(false)
        const selectedAccount = ref(null)
        const selectedCurrency = ref('KRW')
        const transferAmount = ref('')
        const accountPassword = ref('')
        const passwordError = ref('')

        // 데이터 - DTO는 4개 필드만, 환율은 별도 관리
        const balanceData = ref([]) // DTO: code, name, amount, flag 만
        const exchangeRates = ref({}) // 통화별 환율 저장
        const favoriteAccounts = ref([])
        const recentTransactions = ref([])
        const supportedCurrencies = ref([])
        const userId = localStorage.getItem('userId')

        // API 설정
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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

            // 즐겨찾기 목록 조회
            async getFavorites() {
                try {
                    const response = await axios.get('/api/favorites')
                    return response.data
                } catch (error) {
                    console.error('Favorites API Error:', error)
                    throw error
                }
            },

            // 즐겨찾기 추가
            async addFavorite(friendData) {
                try {
                    const response = await axios.post('/api/favorites', friendData)
                    return response.data
                } catch (error) {
                    console.error('Add Favorite API Error:', error)
                    throw error
                }
            },

            // 즐겨찾기 삭제
            async deleteFavorite(favoriteId) {
                try {
                    await axios.delete(`/api/favorites/${favoriteId}`)
                } catch (error) {
                    console.error('Delete Favorite API Error:', error)
                    throw error
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
            },

            // 지원 통화 목록 조회
            async getSupportedCurrencies() {
                try {
                    const response = await axios.get('/api/transfer/currencies')
                    return response.data
                } catch (error) {
                    console.error('Supported Currencies API Error:', error)
                    throw error
                }
            },

            // 송금 실행
            async executeTransfer(transferData) {
                try {
                    const response = await axios.post('/api/transfer/execute', transferData, {
                        headers: {
                            'X-User-Id': userId
                        }
                    })
                    return response.data
                } catch (error) {
                    console.error('Transfer API Error:', error)
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

        // 🔥 잔액이 있는 지갑만 정렬 (잔액 0인 지갑 제외)
        const sortedWallets = computed(() => {
            return [...currencyWallets.value]
                .filter(wallet => parseCleanFloat(wallet.amount) > 0) // 🔥 잔액이 0보다 큰 지갑만
                .sort((a, b) => {
                    if (a.code === 'KRW') return -1
                    if (b.code === 'KRW') return 1
                    return b.krwAmount - a.krwAmount
                })
        })

        // 🔥 잔액이 있는 지갑 개수
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

        // 선택된 통화 지갑
        const selectedCurrencyWallet = computed(() => {
            return currencyWallets.value.find(wallet => wallet.code === selectedCurrencyFilter.value)
        })

        // 🔥 차트 세그먼트 계산 - 원본 통화 금액 포함
        const chartSegments = computed(() => {
            const total = totalBalance.value
            if (total === 0) return []

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
                    originalAmount: wallet.amount,  // 🔥 원본 통화 금액 추가
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

        // 송금 가능한 지갑
        const availableWallets = computed(() => {
            return currencyWallets.value.filter(wallet => parseCleanFloat(wallet.amount) > 0)
        })

        // 선택된 통화의 잔액
        const selectedWalletBalance = computed(() => {
            const wallet = currencyWallets.value.find(w => w.code === selectedCurrency.value)
            return wallet ? parseCleanFloat(wallet.amount) : 0
        })

        // 송금 가능 여부
        const canTransfer = computed(() => {
            const amount = parseFloat(transferAmount.value)
            return amount > 0 &&
                amount <= selectedWalletBalance.value &&
                selectedAccount.value &&
                accountPassword.value.length === 4 &&
                !passwordError.value &&
                !isTransferring.value
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

                // 4. 기본 선택 통화 설정 - 잔액이 있는 지갑 중에서 선택
                setTimeout(() => {
                    if (sortedWallets.value.length > 0) {
                        selectedCurrencyFilter.value = sortedWallets.value[0].code
                    } else {
                        // 잔액이 있는 지갑이 없으면 첫 번째 지갑 선택
                        selectedCurrencyFilter.value = balanceData.value[0]?.code || 'KRW'
                    }
                }, 100)

            } catch (error) {
                console.error('Failed to load balance data:', error)
                balanceData.value = []
                exchangeRates.value = { 'KRW': 1 }
                alert('계좌 정보를 불러오는데 실패했습니다.')
            }
        }

        const loadFavorites = async () => {
            try {
                const data = await api.getFavorites()
                favoriteAccounts.value = data
            } catch (error) {
                console.error('Failed to load favorites:', error)
            }
        }

        const loadTransactionHistory = async () => {
            try {
                const data = await api.getTransactionHistory(userId)
                recentTransactions.value = data.slice(0, 4)
            } catch (error) {
                console.error('Failed to load transaction history:', error)
            }
        }

        const loadSupportedCurrencies = async () => {
            try {
                const data = await api.getSupportedCurrencies()
                supportedCurrencies.value = data
            } catch (error) {
                console.error('Failed to load supported currencies:', error)
            }
        }

        // 초기 데이터 로드
        const loadInitialData = async () => {
            isLoading.value = true
            try {
                await Promise.all([
                    loadBalanceData(), // 잔액과 환율 정보를 함께 로드
                    loadFavorites(),
                    loadTransactionHistory(),
                    loadSupportedCurrencies()
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

        const filterCurrency = () => {
            // 드롭다운 선택에 따른 처리는 computed에서 자동으로 됨
        }

        const validatePassword = () => {
            const password = accountPassword.value
            if (password.length > 0 && !/^\d+$/.test(password)) {
                passwordError.value = '숫자만 입력 가능합니다'
            } else if (password.length > 4) {
                accountPassword.value = password.slice(0, 4)
                passwordError.value = ''
            } else {
                passwordError.value = ''
            }
        }

        const formatPhoneNumber = (event) => {
            let value = event.target.value.replace(/\D/g, '')

            if (value.length <= 3) {
                value = value
            } else if (value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3)
            } else {
                value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
            }
            newFriend.value.phoneNumber = value
            rawPhone.value = value.replace(/\D/g, '').slice(0, 11)
        }

        const toggleManageMode = () => {
            isManagingFavorites.value = !isManagingFavorites.value
        }

        const deleteFavorite = async (favoriteId) => {
            if (confirm('정말로 즐겨찾기에서 삭제하시겠습니까?')) {
                try {
                    await api.deleteFavorite(favoriteId)
                    await loadFavorites()
                    alert('즐겨찾기에서 삭제되었습니다.')
                } catch (error) {
                    if (error.response?.data?.message) {
                        alert(error.response.data.message)
                    } else {
                        alert('삭제 중 오류가 발생했습니다.')
                    }
                }
            }
        }

        // 모달 관리
        const openAddModal = () => {
            showAddModal.value = true
            console.log("지갑", currencyWallets.value)
            resetForm()
        }

        const closeAddModal = () => {
            showAddModal.value = false
            resetForm()
        }

        const openTransferModal = (account) => {
            selectedAccount.value = account
            selectedCurrency.value = 'KRW'
            transferAmount.value = ''
            accountPassword.value = ''
            passwordError.value = ''
            showTransferModal.value = true
        }

        const closeTransferModal = () => {
            showTransferModal.value = false
            selectedAccount.value = null
            selectedCurrency.value = 'KRW'
            transferAmount.value = ''
            accountPassword.value = ''
            passwordError.value = ''
        }

        const selectCurrency = (wallet) => {
            selectedCurrency.value = wallet.code
        }

        // 친구 추가
        const addFriend = async () => {
            errors.value = {
                name: '',
                phoneNumber: ''
            }

            if (!newFriend.value.name.trim()) {
                errors.value.name = '친구 이름을 입력해주세요'
                return
            }

            if (!newFriend.value.phoneNumber.trim()) {
                errors.value.phoneNumber = '전화번호를 입력해주세요'
                return
            }

            if (!validatePhoneNumber(newFriend.value.phoneNumber)) {
                errors.value.phoneNumber = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
                return
            }

            isVerifying.value = true
            try {
                const friendData = {
                    name: newFriend.value.name.trim(),
                    phoneNumber: rawPhone.value
                }

                await api.addFavorite(friendData)
                await loadFavorites()
                alert(`${friendData.name}님이 즐겨찾기에 추가되었습니다!`)
                closeAddModal()

            } catch (error) {
                if (error.response?.status === 400) {
                    const message = error.response.data.message || '잘못된 요청입니다.'
                    if (message.includes('사용자를 찾을 수 없습니다') || message.includes('등록되지 않은 사용자')) {
                        errors.value.name = '등록되지 않은 사용자입니다'
                    } else if (message.includes('이미 즐겨찾기') || message.includes('중복')) {
                        errors.value.name = '이미 즐겨찾기에 등록된 친구입니다'
                    } else if (message.includes('최대') || message.includes('4명')) {
                        alert('최대 4명까지만 등록할 수 있습니다')
                    } else {
                        alert(message)
                    }
                } else {
                    alert('친구 추가 중 오류가 발생했습니다. 다시 시도해주세요.')
                }
            } finally {
                isVerifying.value = false
            }
        }

        // 송금 확인
        const confirmTransfer = async () => {
            if (!canTransfer.value) return

            const transferData = {
                recipientName: selectedAccount.value.realName,
                recipientPhone: selectedAccount.value.phoneNumber,
                fromCurrencyCode: selectedCurrency.value,
                toCurrencyCode: selectedCurrency.value,
                sendAmount: parseFloat(transferAmount.value),
                transactionPassword: accountPassword.value
            }

            if (confirm(`${selectedAccount.value.realName}님에게 ${formatCurrencyAmount(transferData.sendAmount, selectedCurrency.value)}를 송금하시겠습니까?`)) {
                isTransferring.value = true

                try {
                    await api.executeTransfer(transferData)

                    await Promise.all([
                        loadBalanceData(),
                        loadFavorites(),
                        loadTransactionHistory()
                    ])

                    alert('송금이 완료되었습니다!')
                    closeTransferModal()

                } catch (error) {
                    let errorMessage = '송금 중 오류가 발생했습니다. 다시 시도해주세요.'

                    if (error.response?.data?.message) {
                        const message = error.response.data.message
                        if (message.includes('비밀번호') || message.includes('password')) {
                            passwordError.value = '계좌 비밀번호가 올바르지 않습니다'
                            return
                        } else if (message.includes('잔액') || message.includes('balance')) {
                            errorMessage = '잔액이 부족합니다'
                        } else if (message.includes('사용자') || message.includes('user')) {
                            errorMessage = '받는 사람을 찾을 수 없습니다'
                        } else {
                            errorMessage = message
                        }
                    }

                    alert(errorMessage)
                } finally {
                    isTransferring.value = false
                }
            }
        }

        const resetForm = () => {
            newFriend.value = {
                name: '',
                phoneNumber: ''
            }
            errors.value = {
                name: '',
                phoneNumber: ''
            }
        }

        const validatePhoneNumber = (phoneNumber) => {
            const phoneRegex = /^010-\d{4}-\d{4}$/
            return phoneRegex.test(phoneNumber)
        }

        // 네비게이션 함수들
        const goToWalletDetail = (currency) => {
            router.push(`/account/detail/${currency}`)
        }

        const goToExchange = (currency) => {
            router.push(`/exchange?from=${currency}`)
        }

        const goToTransactionHistory = () => {
            router.push('/account/transactions')
        }

        // 🔥 핵심 헬퍼 함수 수정
        
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

        // 🔥 핵심 수정: convertToKRW 함수
        const convertToKRW = (amount, rate) => {
            // console.log(`convertToKRW 호출: amount="${amount}", rate=${rate}`)
            
            // 콤마 제거 후 파싱
            const cleanAmount = parseCleanFloat(amount)
            // console.log(`cleanAmount: ${cleanAmount}`)
            
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
            if (transaction.fromUser && transaction.fromUser.id === userId) {
                return 'expense'
            } else if (transaction.toUser && transaction.toUser.id === userId) {
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
                        return `${transaction.fromCurrencyCode?.code} 친구송금 (${transaction.toUser?.name})`
                    } else {
                        return `${transaction.toCurrencyCode?.code} 친구송금 받음 (${transaction.fromUser?.name})`
                    }
                case 'EXCHANGE':
                    return `${transaction.fromCurrencyCode?.code} → ${transaction.toCurrencyCode?.code} 환전`
                case 'DEPOSIT':
                    return `${transaction.toCurrencyCode?.code} 충전`
                case 'WITHDRAW':
                    return `${transaction.fromCurrencyCode?.code} 출금`
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

        const formatTransactionDate = (dateString) => {
            const date = new Date(dateString)
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\./g, '월').replace(/\s/g, '').replace(/월월/g, '월 ') + '일'
        }

        // 컴포넌트 마운트
        onMounted(() => {
            loadInitialData()
        })

        return {
            // 상태
            isLoading,
            isTransferring,
            highlightedIndex,
            balanceData,
            exchangeRates,
            currencyWallets,
            sortedWallets,
            selectedCurrencyFilter,
            selectedCurrencyWallet,
            totalBalance,
            availableWalletsCount, // 🔥 추가
            topWallets,
            otherWallets,
            otherWalletsTotal,
            chartSegments,
            favoriteAccounts,
            recentTransactions,
            isManagingFavorites,
            showAddModal,
            newFriend,
            errors,
            isVerifying,
            showTransferModal,
            selectedAccount,
            selectedCurrency,
            transferAmount,
            accountPassword,
            passwordError,
            availableWallets,
            selectedWalletBalance,
            canTransfer,

            // 메소드
            highlightSegment,
            unhighlightSegment,
            filterCurrency,
            validatePassword,
            toggleManageMode,
            deleteFavorite,
            openAddModal,
            closeAddModal,
            openTransferModal,
            closeTransferModal,
            selectCurrency,
            confirmTransfer,
            addFriend,
            formatPhoneNumber,
            formatAmount,
            formatCurrencyAmount,
            convertToKRW,
            getCurrencyColor,
            getTransactionType,
            getTransactionIcon,
            getTransactionDescription,
            getTransactionAmount,
            formatTransactionDate,
            goToWalletDetail,
            goToExchange,
            goToTransactionHistory,
            loadInitialData
        }
    }
}
</script>

<style scoped>
/* 🔥 범례 스타일 수정 */
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

.other-detail {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 400;
}

/* 🔥 원본 통화 금액 스타일 추가 */
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

/* 🔥 거래내역 빈 상태 스타일 추가 */
.no-transaction-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 1rem;
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

/* 기존 CSS는 모두 그대로 유지... */
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

/* 로딩 및 에러 상태 */
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

.other-count {
    font-size: 0.7rem;
    color: #6c757d;
    font-weight: 400;
    display: block;
    margin-top: 0.125rem;
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

.currency-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.currency-selector {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 180px;
}

.currency-selector:hover,
.currency-selector:focus {
    outline: none;
    border-color: #20c997;
    box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
}

/* 선택된 통화 상세 정보 */
.selected-currency-detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.currency-detail-card {
    background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
    padding: 2rem;
    border-radius: 16px;
    color: white;
    text-align: center;
}

.currency-header-large {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.currency-flag-large {
    font-size: 3rem;
}

.currency-info-large {
    text-align: left;
}

.currency-name-large {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.currency-code-large {
    font-size: 1rem;
    opacity: 0.8;
}

.currency-balance-large {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.currency-krw-large {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

.currency-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.action-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid white;
    border-radius: 8px;
    background: transparent;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: white;
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

/* 관리 모드 스타일 */
.favorite-account-item.manage-mode {
    background: #fff3cd !important;
    border: 1px solid #ffeaa7;
}

.favorite-account-item.manage-mode:hover {
    background: #fff3cd !important;
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

.account-number {
    font-size: 0.85rem;
    color: #6c757d;
}

.last-transfer {
    font-size: 0.8rem;
    color: #6c757d;
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

.delete-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.delete-btn:hover {
    background: #c82333;
    transform: scale(1.05);
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

.max-favorites-notice {
    text-align: center;
    padding: 1.25rem;
    color: #6c757d;
    font-size: 0.9rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px dashed #e9ecef;
}

/* 거래 내역 */
.transaction-history {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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

/* 모달 스타일 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.transfer-modal {
    max-width: 600px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.close-btn:hover {
    color: #dc3545;
}

.add-friend-form,
.transfer-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.form-group input,
.form-group select {
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #20c997;
    box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
}

.form-group input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 0.8rem;
    font-weight: 500;
}

/* 비밀번호 입력 스타일 */
.password-input {
    text-align: center;
    font-size: 1.2rem;
    letter-spacing: 0.5rem;
    font-family: monospace;
}

.password-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.password-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e9ecef;
    transition: all 0.2s;
}

.password-dot.filled {
    background: #20c997;
    transform: scale(1.2);
}

/* 송금 모달 전용 스타일 */
.currency-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.currency-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.currency-card:hover {
    border-color: #20c997;
    background: rgba(32, 201, 151, 0.05);
}

.currency-card.selected {
    border-color: #20c997;
    background: rgba(32, 201, 151, 0.1);
}

.currency-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.currency-flag {
    font-size: 1.5rem;
}

.currency-details {
    display: flex;
    flex-direction: column;
}

.currency-name {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.currency-code {
    font-size: 0.8rem;
    color: #6c757d;
}

.currency-balance {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.balance-amount {
    font-weight: 700;
    color: #20c997;
    font-size: 1rem;
}

.balance-krw {
    font-size: 0.8rem;
    color: #6c757d;
}

.amount-input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.amount-input {
    flex: 1;
    padding-right: 4rem;
}

.currency-symbol {
    position: absolute;
    right: 1rem;
    color: #6c757d;
    font-weight: 600;
    font-size: 0.9rem;
}

.balance-info {
    font-size: 0.85rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.transfer-summary {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.summary-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-row.total {
    font-weight: 700;
    color: #333;
    font-size: 1.05rem;
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 2px solid #e9ecef;
}

.free {
    color: #20c997;
    font-weight: 600;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.cancel-btn,
.confirm-btn {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    color: #6c757d;
}

.cancel-btn:hover {
    background: #e9ecef;
}

.confirm-btn {
    background: #20c997;
    border: none;
    color: white;
}

.confirm-btn:hover:not(:disabled) {
    background: #17a2b8;
}

.confirm-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}

/* 반응형 */
@media (max-width: 1200px) {
    .dashboard-grid {
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

    .modal-content {
        max-width: 95%;
        margin: 1rem;
    }

    .currency-card {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .currency-actions {
        flex-direction: column;
    }

    .currency-selector {
        min-width: auto;
        width: 100%;
    }
}
</style>
