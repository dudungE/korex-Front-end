<template>
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
        <h2 class="page-title">계좌 조회</h2>

        <div class="dashboard-grid">
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
                            <circle cx="100" cy="100" r="80" fill="none" 
                                   stroke="#f1f3f4" stroke-width="25"/>
                            
                            <!-- 각 통화별 도넛 조각 -->
                            <circle v-for="(segment, index) in chartSegments" 
                                   :key="segment.id"
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
                            <div class="chart-currencies">
                                {{ currencyWallets.length }}개 통화
                                <span v-if="currencyWallets.length > 4" class="other-count">
                                    (상위 4개 표시)
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 범례 -->
                    <div class="chart-legend">
                        <div v-for="(segment, index) in chartSegments" 
                             :key="segment.id" 
                             class="legend-item"
                             :class="{ highlighted: highlightedIndex === index }">
                            <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
                            <div class="legend-info">
                                <div class="legend-currency">
                                    {{ segment.flag }} {{ segment.name }}
                                    <span v-if="segment.isOther" class="other-detail">
                                        ({{ segment.otherCount }}개 통화)
                                    </span>
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

            <!-- 통화별 지갑 -->
            <div class="currency-wallets-section">
                <div class="section-header">
                    <h3>통화별 계좌</h3>
                    <div class="currency-controls">
                        <!-- 통화 선택 드롭다운 -->
                        <select class="currency-selector" 
                                v-model="selectedCurrencyFilter"
                                @change="filterCurrency">
                            <option v-for="wallet in sortedWallets" 
                                    :key="wallet.currency" 
                                    :value="wallet.currency">
                                {{ wallet.flag }} {{ wallet.name }} ({{ wallet.currency }})
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
                                <div class="currency-code-large">{{ selectedCurrencyWallet.currency }}</div>
                            </div>
                        </div>
                        <div class="currency-balance-large">
                            {{ formatCurrencyAmount(selectedCurrencyWallet.balance, selectedCurrencyWallet.currency) }}
                        </div>
                        <div class="currency-krw-large">
                            ≈ {{ formatAmount(convertToKRW(selectedCurrencyWallet.balance, selectedCurrencyWallet.rate)) }}
                        </div>
                        <div class="currency-actions">
                            <button class="action-btn exchange-btn" @click="goToExchange(selectedCurrencyWallet.currency)">
                                환전하기
                            </button>
                            <button class="action-btn detail-btn" @click="goToWalletDetail(selectedCurrencyWallet.currency)">
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
                    <div v-for="account in favoriteAccounts" :key="account.id" 
                         class="favorite-account-item" 
                         :class="{ 'manage-mode': isManagingFavorites }"
                         @click="!isManagingFavorites && openTransferModal(account)">
                        <div class="account-avatar">
                            <span class="avatar-icon">{{ account.icon }}</span>
                        </div>
                        <div class="account-details">
                            <div class="account-name">{{ account.nickname }}</div>
                            <div class="account-info">
                                <span class="real-name">{{ account.realName }}</span>
                                <span class="account-number">{{ account.phoneNumber }}</span>
                            </div>
                            <div class="last-transfer">{{ account.lastTransfer }}</div>
                        </div>
                        <div class="quick-actions">
                            <button v-if="!isManagingFavorites" 
                                    class="quick-transfer-btn" 
                                    @click.stop="openTransferModal(account)">
                                💸 송금
                            </button>
                            <button v-else 
                                    class="delete-btn" 
                                    @click.stop="deleteFavorite(account.id)">
                                🗑️ 삭제
                            </button>
                        </div>
                    </div>
                </div>
                
                <button v-if="favoriteAccounts.length < 4" 
                        class="add-favorite-btn" 
                        @click="openAddModal">
                    + 자주 쓰는 계좌 추가
                </button>
                <div v-else class="max-favorites-notice">
                    최대 4명까지 등록 가능합니다
                </div>
            </div>

            <!-- 거래 내역 (최근 4개만) -->
            <div class="transaction-history">
                <div class="section-header">
                    <h3>최근 거래 내역</h3>
                    <button class="more-btn" @click="goToTransactionHistory">전체보기</button>
                </div>
                <div class="transaction-list">
                    <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
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

        <!-- 친구 추가 모달 -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>친구 추가</h3>
                    <button class="close-btn" @click="closeAddModal">×</button>
                </div>
                
                <form @submit.prevent="addFriend" class="add-friend-form">
                    <div class="form-group">
                        <label for="friendNickname">닉네임</label>
                        <input 
                            type="text" 
                            id="friendNickname"
                            v-model="newFriend.nickname" 
                            placeholder="표시할 닉네임을 입력하세요 (예: 엄마, 딸래미, 친구 등)"
                            :class="{ error: errors.nickname }"
                            required>
                        <span v-if="errors.nickname" class="error-message">{{ errors.nickname }}</span>
                    </div>

                    <div class="form-group">
                        <label for="friendName">친구 이름</label>
                        <input 
                            type="text" 
                            id="friendName"
                            v-model="newFriend.name" 
                            placeholder="친구의 실제 이름을 입력하세요"
                            :class="{ error: errors.name }"
                            required>
                        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="friendPhone">전화번호</label>
                        <input 
                            type="tel" 
                            id="friendPhone"
                            v-model="newFriend.phoneNumber" 
                            placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                            :class="{ error: errors.phoneNumber }"
                            maxlength="13"
                            @input="formatPhoneNumber"
                            required>
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
                    <h3>{{ selectedAccount?.nickname }}에게 송금</h3>
                    <button class="close-btn" @click="closeTransferModal">×</button>
                </div>
                
                <div class="transfer-form">
                    <!-- 통화 선택 -->
                    <div class="form-group">
                        <label>송금할 통화 선택</label>
                        <div class="currency-selection">
                            <div v-for="wallet in availableWallets" 
                                 :key="wallet.currency"
                                 class="currency-card"
                                 :class="{ selected: selectedCurrency === wallet.currency }"
                                 @click="selectCurrency(wallet)">
                                <div class="currency-info">
                                    <span class="currency-flag">{{ wallet.flag }}</span>
                                    <div class="currency-details">
                                        <div class="currency-name">{{ wallet.name }}</div>
                                        <div class="currency-code">{{ wallet.currency }}</div>
                                    </div>
                                </div>
                                <div class="currency-balance">
                                    <div class="balance-amount">{{ formatCurrencyAmount(wallet.balance, wallet.currency) }}</div>
                                    <div class="balance-krw">{{ formatAmount(convertToKRW(wallet.balance, wallet.rate)) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 송금 금액 입력 -->
                    <div class="form-group">
                        <label>송금 금액</label>
                        <div class="amount-input-container">
                            <input 
                                type="number" 
                                v-model="transferAmount" 
                                :placeholder="`${selectedCurrency}로 입력`"
                                class="amount-input"
                                min="0"
                                step="0.01">
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
                        <input 
                            type="password" 
                            v-model="accountPassword" 
                            placeholder="계좌 비밀번호 6자리를 입력하세요"
                            class="password-input"
                            maxlength="6"
                            pattern="[0-9]{6}"
                            @input="validatePassword"
                            required>
                        <div class="password-dots">
                            <span v-for="i in 6" :key="i" 
                                  class="password-dot" 
                                  :class="{ filled: accountPassword.length >= i }"></span>
                        </div>
                        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
                    </div>

                    <!-- 송금 확인 정보 -->
                    <div v-if="transferAmount && selectedCurrency && accountPassword.length === 6" class="transfer-summary">
                        <div class="summary-title">송금 정보</div>
                        <div class="summary-row">
                            <span>받는 사람</span>
                            <span>{{ selectedAccount?.nickname }} ({{ selectedAccount?.realName }})</span>
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
                        <button type="button" 
                                class="confirm-btn transfer-confirm-btn" 
                                :disabled="!canTransfer"
                                @click="confirmTransfer">
                            송금하기
                        </button>
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
        
        const highlightedIndex = ref(-1)
        const selectedCurrencyFilter = ref('KRW') // 디폴트로 KRW 설정

        // 관리 모드 상태
        const isManagingFavorites = ref(false)
        
        // 친구 추가 모달 관련 상태
        const showAddModal = ref(false)
        const isVerifying = ref(false)
        const newFriend = ref({
            nickname: '',
            name: '',
            phoneNumber: ''
        })
        const errors = ref({
            nickname: '',
            name: '',
            phoneNumber: ''
        })

        // 송금 모달 관련 상태
        const showTransferModal = ref(false)
        const selectedAccount = ref(null)
        const selectedCurrency = ref('KRW')
        const transferAmount = ref('')
        const accountPassword = ref('')
        const passwordError = ref('')

        // 가상의 친구 데이터베이스 (모든 통화 지원)
        const friendDatabase = ref([
            { 
                name: '김지연', 
                phoneNumber: '010-1234-2845'
            },
            { 
                name: '김민수', 
                phoneNumber: '010-5678-1234'
            },
            { 
                name: '박영희', 
                phoneNumber: '010-9999-7777'
            },
            { 
                name: '이철수', 
                phoneNumber: '010-1111-2222'
            },
            { 
                name: '최영수', 
                phoneNumber: '010-3333-4444'
            }
        ])

        // 통화별 지갑 (많은 통화를 시뮬레이션)
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
            },
            {
                currency: 'CNY',
                name: '위안',
                flag: '🇨🇳',
                balance: 1520.30,
                rate: 177.82,
                color: '#dc3545'
            },
            {
                currency: 'GBP',
                name: '파운드',
                flag: '🇬🇧',
                balance: 890.75,
                rate: 1634.12,
                color: '#0d6efd'
            },
            {
                currency: 'CAD',
                name: '캐나다달러',
                flag: '🇨🇦',
                balance: 1120.40,
                rate: 956.78,
                color: '#198754'
            },
            {
                currency: 'AUD',
                name: '호주달러',
                flag: '🇦🇺',
                balance: 765.20,
                rate: 866.45,
                color: '#ffc107'
            },
            {
                currency: 'CHF',
                name: '스위스프랑',
                flag: '🇨🇭',
                balance: 445.60,
                rate: 1456.78,
                color: '#6610f2'
            }
        ])

        // 총 보유 금액 계산
        const totalBalance = computed(() => {
            return currencyWallets.value.reduce((total, wallet) => {
                return total + convertToKRW(wallet.balance, wallet.rate)
            }, 0)
        })

        // 통화를 KRW 환산 금액 기준으로 정렬
        const sortedWallets = computed(() => {
            return [...currencyWallets.value].sort((a, b) => {
                const aKrw = convertToKRW(a.balance, a.rate)
                const bKrw = convertToKRW(b.balance, b.rate)
                return bKrw - aKrw
            })
        })

        // 상위 4개 지갑 (차트용)
        const topWallets = computed(() => sortedWallets.value.slice(0, 4))

        // 기타 지갑들 (차트용)
        const otherWallets = computed(() => sortedWallets.value.slice(4))

        // 기타 지갑들의 총합
        const otherWalletsTotal = computed(() => {
            return otherWallets.value.reduce((total, wallet) => {
                return total + convertToKRW(wallet.balance, wallet.rate)
            }, 0)
        })

        // 선택된 통화 지갑
        const selectedCurrencyWallet = computed(() => {
            return currencyWallets.value.find(wallet => wallet.currency === selectedCurrencyFilter.value)
        })

        // 차트 세그먼트 계산 (상위 4개 + 기타)
        const chartSegments = computed(() => {
            const total = totalBalance.value
            const circumference = 2 * Math.PI * 80
            let currentOffset = 0
            const segments = []
            
            // 상위 4개 통화
            topWallets.value.forEach((wallet, index) => {
                const krwAmount = convertToKRW(wallet.balance, wallet.rate)
                const percentage = (krwAmount / total) * 100
                const dashArray = (percentage / 100) * circumference
                
                segments.push({
                    id: wallet.currency,
                    currency: wallet.currency,
                    name: wallet.name,
                    flag: wallet.flag,
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

        // 송금 가능한 지갑 (잔액이 있는 지갑만)
        const availableWallets = computed(() => {
            return currencyWallets.value.filter(wallet => wallet.balance > 0)
        })

        // 선택된 통화의 잔액
        const selectedWalletBalance = computed(() => {
            const wallet = currencyWallets.value.find(w => w.currency === selectedCurrency.value)
            return wallet ? wallet.balance : 0
        })

        // 송금 가능 여부
        const canTransfer = computed(() => {
            const amount = parseFloat(transferAmount.value)
            return amount > 0 && 
                   amount <= selectedWalletBalance.value &&
                   selectedAccount.value &&
                   accountPassword.value.length === 6 &&
                   !passwordError.value
        })

        // 거래 내역 (확장된 데이터)
        const transactions = ref([
            {
                id: 1,
                type: 'expense',
                category: 'exchange',
                description: 'KRW → JPY 환전',
                date: '08월 26일 2025',
                amount: 89000,
                currency: 'JPY',
                originalAmount: 10000
            },
            {
                id: 2,
                type: 'income',
                category: 'deposit',
                description: '원화 충전',
                date: '08월 25일 2025',
                amount: 3200000,
                currency: 'KRW',
                originalAmount: 3200000
            },
            {
                id: 3,
                type: 'expense',
                category: 'transfer',
                description: 'USD 친구송금 (민수)',
                date: '08월 24일 2025',
                amount: 64667,
                currency: 'USD',
                originalAmount: 50
            },
            {
                id: 4,
                type: 'expense',
                category: 'transfer',
                description: 'KRW 친구송금 (지연)',
                date: '08월 23일 2025',
                amount: 100000,
                currency: 'KRW',
                originalAmount: 100000
            },
            {
                id: 5,
                type: 'expense',
                category: 'exchange',
                description: 'USD → EUR 환전',
                date: '08월 22일 2025',
                amount: 129333,
                currency: 'EUR',
                originalAmount: 100
            },
            {
                id: 6,
                type: 'income',
                category: 'deposit',
                description: 'USD 충전',
                date: '08월 21일 2025',
                amount: 1293330,
                currency: 'USD',
                originalAmount: 1000
            }
        ])

        // 최근 4개 거래내역만
        const recentTransactions = computed(() => {
            return transactions.value
                .sort((a, b) => new Date(b.date.replace(/년|월|일/g, '').replace(/ /g, '/')) - new Date(a.date.replace(/년|월|일/g, '').replace(/ /g, '/')))
                .slice(0, 4)
        })

        // 세그먼트 하이라이트
        const highlightSegment = (index) => {
            highlightedIndex.value = index
        }

        const unhighlightSegment = () => {
            highlightedIndex.value = -1
        }

        // 자주 쓰는 계좌 즐겨찾기 데이터 (닉네임 추가, usualAmount 제거)
        const favoriteAccounts = ref([
            {
                id: 1,
                nickname: '딸래미',
                realName: '김지연',
                phoneNumber: '010-***-2845',
                icon: '👧',
                lastTransfer: '3일 전 송금'
            },
            {
                id: 3,
                nickname: '민수',
                realName: '김민수',
                phoneNumber: '010-***-1234',
                icon: '👦',
                lastTransfer: '5일 전 송금'
            }
        ])

        // 통화 필터링
        const filterCurrency = () => {
            // 드롭다운 선택에 따른 처리는 computed에서 자동으로 됨
        }

        // 비밀번호 검증
        const validatePassword = () => {
            const password = accountPassword.value
            if (password.length > 0 && !/^\d+$/.test(password)) {
                passwordError.value = '숫자만 입력 가능합니다'
            } else if (password.length > 6) {
                accountPassword.value = password.slice(0, 6)
                passwordError.value = ''
            } else {
                passwordError.value = ''
            }
        }

        // 전화번호 포맷팅
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
        }

        // 관리 모드 토글
        const toggleManageMode = () => {
            isManagingFavorites.value = !isManagingFavorites.value
        }

        // 즐겨찾기 삭제
        const deleteFavorite = (accountId) => {
            if (confirm('정말로 즐겨찾기에서 삭제하시겠습니까?')) {
                favoriteAccounts.value = favoriteAccounts.value.filter(account => account.id !== accountId)
            }
        }

        // 친구 추가 모달 열기/닫기
        const openAddModal = () => {
            showAddModal.value = true
            resetForm()
        }

        const closeAddModal = () => {
            showAddModal.value = false
            resetForm()
        }

        // 송금 모달 열기/닫기
        const openTransferModal = (account) => {
            selectedAccount.value = account
            selectedCurrency.value = 'KRW' // 기본값
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

        // 통화 선택
        const selectCurrency = (wallet) => {
            selectedCurrency.value = wallet.currency
        }

        // 송금 확인
        const confirmTransfer = () => {
            if (!canTransfer.value) return

            // 간단한 비밀번호 검증 (실제로는 서버에서)
            if (accountPassword.value !== '123456') {
                passwordError.value = '비밀번호가 올바르지 않습니다'
                return
            }

            if (confirm(`${selectedAccount.value.nickname}님에게 ${formatCurrencyAmount(parseFloat(transferAmount.value), selectedCurrency.value)}를 송금하시겠습니까?`)) {
                // 잔액에서 차감
                const walletIndex = currencyWallets.value.findIndex(w => w.currency === selectedCurrency.value)
                if (walletIndex !== -1) {
                    currencyWallets.value[walletIndex].balance -= parseFloat(transferAmount.value)
                }

                // 거래 내역 추가
                const newTransaction = {
                    id: Date.now(),
                    type: 'expense',
                    category: 'transfer',
                    description: `${selectedCurrency.value} 친구송금 (${selectedAccount.value.nickname})`,
                    date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '월').replace(/\s/g, '').replace(/월월/g, '월 ') + '일',
                    amount: parseFloat(transferAmount.value) * (selectedCurrency.value === 'KRW' ? 1 : currencyWallets.value.find(w => w.currency === selectedCurrency.value)?.rate || 1),
                    currency: selectedCurrency.value,
                    originalAmount: parseFloat(transferAmount.value)
                }
                transactions.value.unshift(newTransaction)

                alert('송금이 완료되었습니다!')
                closeTransferModal()
            }
        }

        // 폼 리셋
        const resetForm = () => {
            newFriend.value = {
                nickname: '',
                name: '',
                phoneNumber: ''
            }
            errors.value = {
                nickname: '',
                name: '',
                phoneNumber: ''
            }
        }

        // 전화번호 유효성 검사
        const validatePhoneNumber = (phoneNumber) => {
            const phoneRegex = /^010-\d{4}-\d{4}$/
            return phoneRegex.test(phoneNumber)
        }

        // 친구 검증 및 추가
        const addFriend = async () => {
            // 에러 초기화
            errors.value = {
                nickname: '',
                name: '',
                phoneNumber: ''
            }

            // 기본 유효성 검사
            if (!newFriend.value.nickname.trim()) {
                errors.value.nickname = '닉네임을 입력해주세요'
                return
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
                // 친구 데이터베이스에서 검증 (실제로는 API 호출)
                const friend = friendDatabase.value.find(f => 
                    f.name === newFriend.value.name.trim()
                )

                if (!friend) {
                    errors.value.name = '등록되지 않은 사용자입니다'
                    return
                }

                // 전화번호 일치 검사
                if (friend.phoneNumber !== newFriend.value.phoneNumber) {
                    errors.value.phoneNumber = '이름과 전화번호가 일치하지 않습니다'
                    return
                }

                // 이미 즐겨찾기에 있는지 확인 (실제 이름으로)
                const isDuplicate = favoriteAccounts.value.some(account => 
                    account.realName === friend.name
                )

                if (isDuplicate) {
                    errors.value.name = '이미 즐겨찾기에 등록된 친구입니다'
                    return
                }

                // 성공: 즐겨찾기에 추가
                const newId = Math.max(...favoriteAccounts.value.map(a => a.id), 0) + 1
                const icons = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵']
                const randomIcon = icons[Math.floor(Math.random() * icons.length)]

                favoriteAccounts.value.push({
                    id: newId,
                    nickname: newFriend.value.nickname.trim(),
                    realName: friend.name,
                    phoneNumber: `010-***-${friend.phoneNumber.slice(-4)}`,
                    icon: randomIcon,
                    lastTransfer: '방금 추가됨'
                })

                alert(`${newFriend.value.nickname}님이 즐겨찾기에 추가되었습니다!`)
                closeAddModal()

            } catch (error) {
                alert('친구 추가 중 오류가 발생했습니다. 다시 시도해주세요.')
            } finally {
                isVerifying.value = false
            }
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

        // 헬퍼 함수들
        const formatAmount = (amount) => {
            return new Intl.NumberFormat('ko-KR').format(Math.floor(amount)) + '원'
        }

        const formatCurrencyAmount = (amount, currency) => {
            if (currency === 'KRW') {
                return new Intl.NumberFormat('ko-KR').format(Math.floor(amount)) + '원'
            }
            return new Intl.NumberFormat('ko-KR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount) + ' ' + currency
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
            highlightedIndex,
            totalBalance,
            currencyWallets,
            sortedWallets,
            topWallets,
            otherWallets,
            otherWalletsTotal,
            selectedCurrencyFilter,
            selectedCurrencyWallet,
            chartSegments,
            highlightSegment,
            unhighlightSegment,
            favoriteAccounts,
            transactions,
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
            getTransactionIcon,
            goToWalletDetail,
            goToExchange,
            goToTransactionHistory
        }
    }
}
</script>

<style scoped>
/* 기존 스타일들과 새로운 스타일 추가 */
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

.other-count {
    font-size: 0.7rem;
    color: #6c757d;
    font-weight: 400;
    display: block;
    margin-top: 0.125rem;
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

.other-detail {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 400;
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
    font-weight: 700;
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 1.05rem;
}

.account-info {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
}

.real-name {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
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
}

.transfer-confirm-btn:disabled {
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
