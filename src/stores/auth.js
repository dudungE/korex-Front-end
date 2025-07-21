// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    userName: (state) => state.user?.name || '게스트'
  },

  actions: {
    // 로그인 (Mock 데이터 사용)
    async login(credentials) {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock 사용자 데이터
      const mockUsers = [
        { 
          id: 1, 
          name: '김여행', 
          email: 'test@example.com', 
          password: '1234' 
        },
        { 
          id: 2, 
          name: '이모험', 
          email: 'travel@test.com', 
          password: 'password' 
        },
        { 
          id: 3, 
          name: '박탐험', 
          email: 'demo@demo.com', 
          password: 'demo' 
        }
      ]
      
      // 사용자 인증 확인
      const user = mockUsers.find(u => 
        u.email === credentials.email && u.password === credentials.password
      )
      
      if (user) {
        // 성공 시
        const token = 'mock-jwt-token-' + Date.now()
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email
        }
        
        this.token = token
        this.user = userData
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return {
          data: {
            token,
            user: userData
          }
        }
      } else {
        // 실패 시
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    },

    // 로그아웃
    async logout() {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // 페이지 새로고침 시 사용자 정보 복원
    restoreAuth() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Failed to restore auth:', error)
          this.logout()
        }
      }
    },

    // 사용자 정보 업데이트 (선택사항)
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  }
})


// // src/stores/auth.js
// import { defineStore } from 'pinia'
// import api from '../api'

// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     user: null,
//     token: localStorage.getItem('token')
//   }),

//   getters: {
//     isAuthenticated: (state) => !!state.token,
//     currentUser: (state) => state.user
//   },

//   actions: {
//     async login(credentials) {
//       const response = await api.post('/auth/login', credentials)
//       const { token, user } = response.data
      
//       this.token = token
//       this.user = user
//       localStorage.setItem('token', token)
      
//       return response
//     },

//     async logout() {
//       try {
//         await api.post('/auth/logout')
//       } catch (error) {
//         console.error('Logout error:', error)
//       } finally {
//         this.token = null
//         this.user = null
//         localStorage.removeItem('token')
//       }
//     }
//   }
// })
