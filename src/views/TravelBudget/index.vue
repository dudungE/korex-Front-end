<template>
  <div class="travel-budget-app">
    <!-- 헤더 -->
    <a-layout-header class="header">
      <div class="header-content">
        <h1 class="title">
          <a-icon type="compass" />
          여행 가계부
        </h1>
        <div class="user-actions">
          <span class="welcome">{{ authStore.user?.name }}님 환영합니다!</span>
          <a-button type="link" @click="handleLogout" class="logout-btn">
            로그아웃
          </a-button>
        </div>
      </div>
    </a-layout-header>

    <!-- 메인 컨텐츠 -->
    <a-layout-content class="content">
      <!-- 여행 목록이 비어있을 때 -->
      <div v-if="travelStore.travels.length === 0" class="empty-state">
        <a-empty description="아직 등록된 여행이 없습니다">
          <a-button type="primary" size="large" @click="showCreateModal" class="create-btn">
            <a-icon type="plus" />
            새 여행 추가
          </a-button>
        </a-empty>
      </div>

      <!-- 여행 목록이 있을 때 -->
      <div v-else class="travel-grid">
        <TravelCard
          v-for="travel in travelStore.travels"
          :key="travel.id"
          :travel="travel"
          @edit="handleEditTravel"
          @delete="handleDeleteTravel"
        />
        
        <!-- 새 여행 추가 카드 -->
        <div class="add-travel-card" @click="showCreateModal">
          <div class="add-content">
            <a-icon type="plus" class="add-icon" />
            <p>새 여행 추가</p>
          </div>
        </div>
      </div>
    </a-layout-content>

    <!-- 여행 생성/편집 모달 -->
    <CreateTravelModal
      :visible="createModalVisible"
      :editData="editingTravel"
      @submit="handleCreateTravel"
      @cancel="handleCancel"
    />

  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useTravelStore } from '@/stores/travel'
import TravelCard from './components/TravelCard.vue'
import CreateTravelModal from './components/CreateTravelModal.vue'

export default {
  name: 'TravelBudgetView',
  components: {
    TravelCard,
    CreateTravelModal
  },
  setup() {
    const authStore = useAuthStore()
    const travelStore = useTravelStore()
    
    return {
      authStore,
      travelStore
    }
  },
  data() {
    return {
      createModalVisible: false,
      editingTravel: null
    }
  },
  mounted() {
    this.travelStore.fetchTravels()
  },
  methods: {
    showCreateModal() {
      this.editingTravel = null
      this.createModalVisible = true
    },
    
    handleCancel() {
      this.createModalVisible = false
      this.editingTravel = null
    },
    
    async handleCreateTravel(travelData) {
      try {
        if (this.editingTravel) {
          await this.travelStore.updateTravel({ id: this.editingTravel.id, ...travelData })
          this.$message.success('여행 정보가 수정되었습니다!')
        } else {
          await this.travelStore.createTravel(travelData)
          this.$message.success('새 여행이 추가되었습니다!')
        }
        this.createModalVisible = false
        this.editingTravel = null
      } catch (error) {
        this.$message.error('오류가 발생했습니다.')
      }
    },
    
    handleEditTravel(travel) {
      this.editingTravel = travel
      this.createModalVisible = true
    },
    
    async handleDeleteTravel(travelId) {
      try {
        await this.travelStore.deleteTravel(travelId)
        this.$message.success('여행이 삭제되었습니다.')
      } catch (error) {
        this.$message.error('삭제 중 오류가 발생했습니다.')
      }
    },
    
    async handleLogout() {
      await this.authStore.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.travel-budget-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.header {
  background: linear-gradient(90deg, #2196f3, #03a9f4);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.header .title {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.header .title .anticon {
  margin-right: 12px;
  font-size: 28px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-actions .welcome {
  color: white;
  font-weight: 500;
}

.user-actions .logout-btn {
  color: white;
}

.user-actions .logout-btn:hover {
  color: #e3f2fd;
}

.content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-state .create-btn {
  background: linear-gradient(45deg, #2196f3, #03a9f4);
  border: none;
  height: 50px;
  padding: 0 32px;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
}

.empty-state .create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5);
}

.travel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.add-travel-card {
  border: 2px dashed #2196f3;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 40px 20px;
  text-align: center;
  background: white;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-travel-card .add-content {
  color: #2196f3;
}

.add-travel-card .add-content .add-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.add-travel-card .add-content p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.add-travel-card:hover {
  border-color: #03a9f4;
  background: rgba(33, 150, 243, 0.05);
  transform: translateY(-2px);
}
</style>
