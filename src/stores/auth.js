import { defineStore } from 'pinia'
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    const userInfo = ref(null)
    const isRefreshing = ref(false) // 리프레시 토큰 중복 요청 방지
    const SEND_CODE_MSG_KEY = 'send-email';

    /**
     * 토큰을 localStorage에 저장하고 axios 기본 헤더에 설정
     */
    function setToken(token) {
        localStorage.setItem('accessToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('✅ 토큰 설정 완료:', `Bearer ${token.substring(0, 20)}...`)
    }

    /**
     * 토큰을 제거하고 axios 헤더에서도 제거
     */
    function clearToken() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('loginId') // loginId도 함께 제거
        delete axios.defaults.headers.common['Authorization']
        console.log('🗑️ 토큰 및 loginId 제거 완료')
    }

    /**
     * localStorage에서 토큰을 가져와서 axios 헤더에 설정
     */
    function loadToken() {
        const token = localStorage.getItem('accessToken')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            console.log('🔄 저장된 토큰 로드 완료')
            return token
        }
        return null
    }

    /**
     * 현재 토큰 반환 (localStorage와 axios 헤더 동기화)
     */
    function getToken() {
        const token = localStorage.getItem('accessToken')
        
        // localStorage와 axios 헤더 동기화
        if (token) {
            // 토큰이 있으면 axios 헤더에도 설정
            if (!axios.defaults.headers.common['Authorization']) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                console.log('🔄 axios 헤더에 토큰 동기화 완료')
            }
        } else {
            // 토큰이 없으면 axios 헤더에서도 제거
            if (axios.defaults.headers.common['Authorization']) {
                delete axios.defaults.headers.common['Authorization']
                console.log('🗑️ axios 헤더에서 토큰 제거 완료')
            }
        }
        
        return token
    }

    /**
     * 서버에 로그인 요청을 보냅니다.
     * @returns 로그인 성공 여부 (boolean)
     */
    
    async function login(loginData) {
        const FAIL_KEY = (id) => `fc:${id}`
        const getFailCount = (id) => Number(localStorage.getItem(FAIL_KEY(id)) || '0')
        const setFailCount = (id, n) => localStorage.setItem(FAIL_KEY(id), String(n))
        const incFailCount = (id) => { const n = getFailCount(id) + 1; setFailCount(id, n); return n }
        const resetFailCount = (id) => localStorage.removeItem(FAIL_KEY(id))
        try {
            console.log('🚀 로그인 요청 시작')
            console.log('📋 요청 데이터:', {
                loginId: loginData.loginId,
                password: '***' // 비밀번호는 로그에 노출하지 않음
            })
            console.log('🌐 요청 URL:', '/api/auth/login')

            const requestPayload = {
                loginId: loginData.loginId,
                password: loginData.password,
            }

            console.log('📤 실제 전송 데이터:', {
                ...requestPayload,
                password: '***' // 비밀번호 마스킹
            })

            const response = await axios.post('/api/auth/login', requestPayload, {
                withCredentials: true
            })

            console.log('📡 서버 응답 상태:', response.status)
            console.log('📡 서버 응답 헤더:', response.headers)
            console.log('📡 서버 응답 데이터:', response.data)

            if (response.status === 200 && response.data.authenticated) {
                // 응답 헤더에서 토큰 추출
                const tokenHeader = response.headers?.authorization || response.headers?.Authorization
                const token = tokenHeader || response.data.accessToken
                //const token = response.headers['authorization'] || response.data.accessToken
                console.log('🔑 토큰 추출 결과:', token ? `${token.substring(0, 20)}...` : '토큰 없음')

                if (token) {
                    // Bearer 접두사 제거 (필요한 경우)
                    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
                    setToken(cleanToken)
                } else {
                    console.warn('⚠️ 서버 응답에 토큰이 없습니다.')
                }

                isAuthenticated.value = true
                userInfo.value = response.data.userInfo

                resetFailCount(loginData.loginId)

                if (userInfo.value?.loginId) {
                    localStorage.setItem('loginId', userInfo.value.loginId)
                    console.log('💾 loginId 저장 완료:', userInfo.value.loginId)
                }

                console.log('✅ 로그인 성공:', userInfo.value)
                return true
            } else {
                console.log('❌ 로그인 실패 - 인증되지 않음')
                console.log('- response.status:', response.status)
                console.log('- response.data.authenticated:', response.data.authenticated)
                return false
            }
        } catch (error) {
            console.error('💥 로그인 요청 중 오류 발생:', error)

            if (axios.isAxiosError(error)) {
                console.error('📡 Axios 오류 상세:')
                console.error('- 상태 코드:', error.response?.status)
                console.error('- 응답 데이터:', error.response?.data)
                console.error('- 요청 설정:', error.config)

                const status = error.response?.status
                const data   = error.response?.data
                const code   = data?.code
                //const code = error.response?.data?.code;

                if (error.response?.status === 400 && code == 'U004') {
                    let count =  Number.isFinite(data?.failCount) ? data.failCount
                             : Number(error.response?.headers?.['x-fail-count'])
                    if (!Number.isFinite(count)) {
                        alert('로그인 실패')
                        return false
                    }
                    setFailCount(loginData.loginId, count)

                    alert(`로그인 실패: ${count}회`)
                    if (count >= 5) {
                        alert('5회 이상 실패로 계정이 제한되었습니다. 1:1문의를 접수해 주세요.')
                    }
                } else if (status === 401) {
                    alert('아이디 또는 비밀번호가 일치하지 않습니다.')
                } else if (error.response?.status === 500) {
                    alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
                } else {
                    alert(`로그인 중 오류가 발생했습니다. (상태: ${error.response?.status})`)
                }
            } else {
                console.error('💥 일반 오류:', error)
                alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
            }

            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
            return false
        }
    }

    async function join(joinData) {
        try {
            const response = await axios.post('/api/auth/join', joinData)
            return true
        } catch (error) {
            console.error('💥 회원가입 실패:', error)
            let errorMessage = '회원가입 중 오류가 발생했습니다.'
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || errorMessage
            }
            message.error(errorMessage)
            return false
        }
    }

    // 이메일 인증코드 발송
    async function sendVerificationCode(email, purpose = 'SIGN_UP') {
        const SEND_CODE_MSG_KEY = 'send-email'
        message.loading({ content: '이메일 전송 중...', key: SEND_CODE_MSG_KEY, duration: 0 })
        try {
            await axios.post('/api/auth/send-code', { email, purpose }, {
            headers: { 'Content-Type': 'application/json', 'X-Skip-Auth-Refresh': 'true' },
            withCredentials: true,
            timeout: 15000,
            })
            message.success({ content: '인증 이메일을 전송했습니다.', key: SEND_CODE_MSG_KEY })
            return true
        } catch (error) {
            const msg = error?.response?.data?.message || '인증 메일 전송 중 오류가 발생했습니다.'
            message.error({ content: msg, key: SEND_CODE_MSG_KEY })
            return false
        }
    }

    // 이메일 인증코드 검증
    async function verifyEmailCode({ email, code, purpose = 'SIGN_UP' }) {
        try {
            await axios.post('/api/auth/verify-code', { email, code, purpose }, {
            headers: { 'Content-Type': 'application/json', 'X-Skip-Auth-Refresh': 'true' },
            withCredentials: true,
            timeout: 15000,
            })
            message.success('이메일 인증이 완료되었습니다.')
            return true
        } catch (error) {
            const msg = error?.response?.data?.message || '인증 코드 확인에 실패했습니다.'
            message.error(msg)
            return false
        }
    }

    async function findId(email, name) {
        try {
            const response = await axios.post('/api/auth/find-id', { email, name })
            const userId = response.data?.loginId || response.data?.id // 응답 구조에 따라 조정
            if (!userId) throw new Error('아이디를 찾을 수 없습니다.')
            return userId
        } catch (error) {
            console.error('❌ 아이디 찾기 실패:', error)
            const msg = error.response?.data?.message || '일치하는 정보를 찾을 수 없습니다.'
            throw new Error(msg)
        }
    }

    async function resetPassword(email, code, newPassword) {
        try {
            const res = await axios.post(
                '/api/auth/reset-password',
                { email, code, newPassword },
                {
                    headers: {
                    'Content-Type': 'application/json',
                    'X-Skip-Auth-Refresh': 'true',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    },
                    withCredentials: true,
                    timeout: 15000,
                }
            )
            const ok = res.status === 200 || res.status === 201
            if (ok) message.success('비밀번호가 성공적으로 변경되었습니다.')
            return ok
        } catch (error) {
            const serverMsg = error?.response?.data?.message
            const errCode   = error?.response?.data?.code // ← 변수명 충돌 방지
            let friendly = serverMsg || '비밀번호 변경에 실패했습니다.'

            if (!error?.response) {
                friendly = '네트워크 오류입니다. 연결을 확인해주세요.'
            } else if (errCode === 'EMAIL_NOT_VERIFIED') {
                friendly = '이메일 인증이 완료되지 않았습니다. 인증 후 다시 시도하세요.'
            } else if (errCode === 'VERIFICATION_TOKEN_NOT_FOUND') {
                friendly = '인증 코드가 유효하지 않습니다.'
            } else if (errCode === 'EXPIRED_TOKEN') {
                friendly = '인증 코드 유효시간이 지났습니다. 다시 전송받아 주세요.'
            } else if (errCode === 'PASSWORD_MISMATCH') {
                friendly = '비밀번호 확인이 일치하지 않습니다.'
            }
            console.error('❌ 비밀번호 변경 실패:', error)
            message.error(friendly)
            return false
        }
    }

    /**
     * 리프레시 토큰을 통해 새로운 액세스 토큰을 발급받습니다.
     */
    async function refreshToken({ quiet = true } = {}) {
        if (isRefreshing.value) {
            return new Promise((resolve, reject) => {
            const check = setInterval(() => {
                if (!isRefreshing.value) {
                clearInterval(check)
                const token = getToken()
                token ? resolve(token) : reject(new Error('리프레시 실패'))
                }
            }, 100)
            })
        }

        try {
            isRefreshing.value = true
            const res = await axios.post('/api/auth/token/reissue', {}, {
            withCredentials: true,
            headers: { 'X-Skip-Auth-Refresh': 'true' }
            })

            // 새 토큰 추출
            const authHdr = res.headers?.authorization || res.headers?.Authorization
            let newAccessToken = authHdr?.startsWith('Bearer ') ? authHdr.slice(7) : authHdr
            if (!newAccessToken && res.data?.accessToken) newAccessToken = res.data.accessToken

            if (!newAccessToken) throw new Error('NO_ACCESS_TOKEN_IN_REISSUE_RESPONSE')

            setToken(newAccessToken)
            return newAccessToken
        } catch (e) {
            const status = e?.response?.status

            // 비로그인 상태는 400/401로 올 수 있음
            if (status === 400 || status === 401) {
            clearToken()
            return null
            }

            console.error('❌ 액세스 토큰 갱신 실패:', e)
            if (isAuthenticated.value) await logout()
            if (quiet) return null
            throw e
        } finally {
            isRefreshing.value = false
        }
    }

    /**
     * 서버에 로그아웃 요청을 보냅니다.
     */
    async function logout() {
        try {
            // 로그아웃 요청시 인터셉터에서 토큰 갱신하지 않도록 플래그 설정
            await axios.post('/api/auth/logout', {}, { 
                withCredentials: true,
                headers: { 'X-Skip-Auth-Refresh': 'true' }
            })
        } catch (error) {
            // 로그아웃 요청 실패해도 로컬 정리는 진행
            console.log('로그아웃 요청 실패, 로컬 정리 진행:', error.response?.status)
        } finally {
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
        }
    }

    //     try {
    //         console.log('🔍 인증 상태 확인 시작...')

    //         // 저장된 액세스 토큰 확인 (동기화 포함)
    //         const token = getToken()
    //         if (!token) {
    //             console.log('⚠️ 저장된 액세스 토큰이 없음, 리프레시 토큰으로 복구 시도...')
    //             try {
    //                 // 직접 리프레시 토큰으로 새 액세스 토큰 발급 시도
    //                 await refreshToken()
    //                 console.log('✅ 리프레시 토큰으로 액세스 토큰 복구 성공')
    //             } catch (refreshError) {
    //                 console.log('❌ 리프레시 토큰으로 복구 실패, 로그아웃 상태로 설정')
    //                 isAuthenticated.value = false
    //                 userInfo.value = null
    //                 return
    //             }
    //         }

    //         // 액세스 토큰이 있는 상태에서 사용자 정보 요청
    //         console.log('🔍 /api/auth/status 요청 중...')
    //         const response = await axios.get('/api/auth/status')
    //         console.log('📡 서버 응답:', response.data)

    //         if (response.status === 200 && response.data.authenticated) {
    //             console.log('✅ 인증 성공, userInfo 설정 중...')
    //             isAuthenticated.value = true
    //             userInfo.value = response.data.user
    //             console.log('✅ 설정 완료 - userInfo:', userInfo.value)
    //         } else {
    //             console.log('❌ 인증 실패')
    //             isAuthenticated.value = false
    //             userInfo.value = null
    //             clearToken()
    //         }
    //     } catch (error) {
    //         console.error('💥 /api/auth/status 요청 실패:', error)
    //         isAuthenticated.value = false
    //         userInfo.value = null
    //         clearToken()
    //     }
    // }

    // ✅ drop-in replacement
    async function checkAuthStatus({ isPublic = false } = {}) {
        try {
            console.log('🔍 인증 상태 확인 시작...')

            if (isPublic) {
            console.log('ℹ️ public 라우트: 상태 확인 스킵')
            isAuthenticated.value = false
            userInfo.value = null
            return
            }

            let token = getToken()
            if (!token) {
                console.log('⚠️ 액세스 토큰 없음 → 리프레시 시도')
                const maybe = await refreshToken({ quiet: true })
                if (!maybe) {
                    console.log('❌ 리프레시 실패 → 비로그인으로 유지')
                    isAuthenticated.value = false
                    userInfo.value = null
                    return
                }
                token = maybe
            }

            console.log('🔍 /api/auth/status 요청 중...')
            const response = await axios.get('/api/auth/status', {
            headers: { 'X-Skip-Auth-Refresh': 'true' }
            })
            console.log('📡 서버 응답:', response.data)

            if (response.status === 200 && response.data?.authenticated) {
            isAuthenticated.value = true
            userInfo.value = response.data.user
            console.log('✅ 인증 성공, userInfo 설정 완료')
            } else {
            console.log('❌ 인증 실패(200 비정상 응답)')
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
            }
        } catch (error) {
            if (error?.response?.status === 401) {
            console.log('ℹ️ /status 401 → 비로그인 처리')
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
            return
            }
            console.error('💥 /api/auth/status 요청 실패:', error)
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
        }
    }

    return {
        isAuthenticated,
        userInfo,
        login,
        join,
        findId,
        resetPassword,
        logout,
        checkAuthStatus,
        refreshToken,
        setToken,
        clearToken,
        loadToken,
        getToken,
        sendVerificationCode,
        verifyEmailCode
    }
})