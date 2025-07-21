import { defineStore } from 'pinia'

export const useTravelStore = defineStore('travel', {
  state: () => ({
    travels: []
  }),

  getters: {
    travelsCount: (state) => state.travels.length,
    totalBudget: (state) => 
      state.travels.reduce((sum, travel) => sum + travel.budget, 0),
    upcomingTravels: (state) =>
      state.travels.filter(travel => new Date(travel.startDate) > new Date())
  },

  actions: {
    // 초기화 시 localStorage에서 데이터 로드
    loadTravelsFromStorage() {
      const saved = localStorage.getItem('travels')
      if (saved) {
        this.travels = JSON.parse(saved)
      }
    },

    // localStorage에 저장
    saveTravelsToStorage() {
      localStorage.setItem('travels', JSON.stringify(this.travels))
    },

    // 여행 목록 조회 (API 호출 시뮬레이션)
    async fetchTravels() {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.loadTravelsFromStorage()
    },

    // 새 여행 생성
    async createTravel(travelData) {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newTravel = {
        id: Date.now(), // 간단한 ID 생성
        ...travelData,
        createdAt: new Date().toISOString()
      }
      
      this.travels.push(newTravel)
      this.saveTravelsToStorage()
      
      return { data: newTravel }
    },

    // 여행 정보 수정
    async updateTravel(travelData) {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const index = this.travels.findIndex(t => t.id === travelData.id)
      if (index !== -1) {
        this.travels[index] = {
          ...this.travels[index],
          ...travelData,
          updatedAt: new Date().toISOString()
        }
        this.saveTravelsToStorage()
        return { data: this.travels[index] }
      }
      throw new Error('여행을 찾을 수 없습니다')
    },

    // 여행 삭제
    async deleteTravel(travelId) {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const initialLength = this.travels.length
      this.travels = this.travels.filter(t => t.id !== travelId)
      
      if (this.travels.length === initialLength) {
        throw new Error('여행을 찾을 수 없습니다')
      }
      
      this.saveTravelsToStorage()
    },

    // 샘플 데이터 추가 (개발용)
    addSampleData() {
      const sampleTravels = [
        {
          id: 1,
          destination: '제주도, 대한민국',
          startDate: '2024-04-15',
          endDate: '2024-04-18',
          budget: 500000,
          currency: 'KRW',
          memo: '벚꽃 시즌 제주 여행',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          destination: '도쿄, 일본',
          startDate: '2024-05-20',
          endDate: '2024-05-25',
          budget: 80000,
          currency: 'JPY',
          memo: '친구들과 도쿄 여행',
          createdAt: new Date().toISOString()
        }
      ]
      
      this.travels = sampleTravels
      this.saveTravelsToStorage()
    }
  }
})





// // src/stores/travel.js
// import { defineStore } from 'pinia'
// import api from '../api'

// export const useTravelStore = defineStore('travel', {
//   state: () => ({
//     travels: []
//   }),

//   getters: {
//     travelsCount: (state) => state.travels.length,
//     totalBudget: (state) => 
//       state.travels.reduce((sum, travel) => sum + travel.budget, 0)
//   },

//   actions: {
//     async fetchTravels() {
//       try {
//         const response = await api.get('/travels')
//         this.travels = response.data
//       } catch (error) {
//         console.error('Fetch travels error:', error)
//       }
//     },

//     async createTravel(travelData) {
//       const response = await api.post('/travels', travelData)
//       this.travels.push(response.data)
//       return response
//     },

//     async updateTravel(travelData) {
//       const response = await api.put(`/travels/${travelData.id}`, travelData)
//       const index = this.travels.findIndex(t => t.id === travelData.id)
//       if (index !== -1) {
//         this.travels[index] = response.data
//       }
//       return response
//     },

//     async deleteTravel(travelId) {
//       await api.delete(`/travels/${travelId}`)
//       this.travels = this.travels.filter(t => t.id !== travelId)
//     }
//   }
// })
