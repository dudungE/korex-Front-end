<template>
  <a-card class="travel-card" hoverable @click="goToDetail">
    <div class="travel-card-header">
      <div class="destination">
        <a-icon type="environment" class="location-icon" />
        <h3>{{ travel.destination }}</h3>
      </div>
      <div class="actions">
        <a-dropdown trigger="['click']">
          <a-button type="text" size="small" class="more-btn">
            <span class="dots">⋮</span>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="$emit('edit', travel)">
                <a-icon type="edit" /> 수정
              </a-menu-item>
              <a-menu-item @click="confirmDelete">
                <a-icon type="delete" /> 삭제
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <div class="travel-info">
      <!-- 여행 날짜 -->
      <div class="info-row">
        <div class="info-label">
          <a-icon type="calendar" />
          여행 기간
        </div>
        <div class="info-value">
          {{ formatDateRange }}
        </div>
      </div>

      <!-- 예산 정보 -->
      <div class="info-row">
        <div class="info-label">
          <a-icon type="dollar" />
          예산
        </div>
        <div class="info-value budget">
          <span class="currency">{{ travel.currency }}</span>
          <span class="amount">{{ formatBudget }}</span>
        </div>
      </div>

      <!-- 국가 플래그 (선택사항) -->
      <div class="info-row" v-if="travel.country">
        <div class="info-label">
          <a-icon type="flag" />
          국가
        </div>
        <div class="info-value">
          {{ getCountryFlag(travel.country) }} {{ travel.country }}
        </div>
      </div>

      <!-- 메모 -->
      <div class="info-row" v-if="travel.memo">
        <div class="info-label">
          <a-icon type="file-text" />
          메모
        </div>
        <div class="info-value memo">
          {{ travel.memo }}
        </div>
      </div>
    </div>

    <!-- 여행까지 남은 시간 -->
    <div class="travel-status">
      <a-tag :color="getStatusColor">
        {{ getStatusText }}
      </a-tag>
    </div>
  </a-card>
</template>

<script>
import moment from 'moment'

export default {
  name: 'TravelCard',
  props: {
    travel: {
      type: Object,
      required: true
    }
  },
  computed: {
    formatDateRange() {
      return `${moment(this.travel.startDate).format('YYYY.MM.DD')} - ${moment(this.travel.endDate).format('YYYY.MM.DD')}`
    },

    formatBudget() {
      return new Intl.NumberFormat().format(this.travel.budget)
    },

    getStatusText() {
      const now = moment()
      const start = moment(this.travel.startDate)
      const end = moment(this.travel.endDate)

      if (now.isBefore(start)) {
        const days = start.diff(now, 'days')
        return `${days}일 후 출발`
      } else if (now.isBetween(start, end)) {
        return '여행 중'
      } else {
        return '여행 완료'
      }
    },

    getStatusColor() {
      const now = moment()
      const start = moment(this.travel.startDate)
      const end = moment(this.travel.endDate)

      if (now.isBefore(start)) return 'blue'
      else if (now.isBetween(start, end)) return 'green'
      else return 'default'
    }
  },
  methods: {
    confirmDelete() {
      this.$confirm({
        title: '여행을 삭제하시겠습니까?',
        content: '삭제된 여행은 복구할 수 없습니다.',
        okText: '삭제',
        okType: 'danger',
        cancelText: '취소',
        onOk: () => {
          this.$emit('delete', this.travel.id)
        }
      })
    },
    
    goToDetail(){
      this.$router.push(`/travel/${this.travel.id}`)
    },

    getCountryFlag(country) {
      const flags = {
        '일본': '🇯🇵',
        '한국': '🇰🇷',
        '중국': '🇨🇳',
        '미국': '🇺🇸',
        '프랑스': '🇫🇷',
        '영국': '🇬🇧',
        '독일': '🇩🇪',
        '이탈리아': '🇮🇹',
        '스페인': '🇪🇸',
        '태국': '🇹🇭',
        '싱가포르': '🇸🇬'
      }
      return flags[country] || '🌍'
    }
  }
}
</script>

<style scoped>
.travel-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.travel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.travel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.travel-card-header .destination {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.travel-card-header .destination .location-icon {
  color: #2196f3;
  font-size: 16px;
}

.travel-card-header .destination h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
}

.travel-card-header .actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  justify-content: flex-end;
  min-width: 40px;
}

.travel-card-header .actions .ant-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  transition: all 0.2s !important;
}

.travel-card-header .actions .ant-btn:hover {
  background-color: #f5f5f5 !important;
}


.travel-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.travel-info .info-row:last-child {
  border-bottom: none;
}

.travel-info .info-row .info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.travel-info .info-row .info-label .anticon {
  color: #2196f3;
}

.travel-info .info-row .info-value {
  font-weight: 500;
  color: #333;
  text-align: right;
  flex: 1;
}

.travel-info .info-row .info-value.budget {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.travel-info .info-row .info-value.budget .currency {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.travel-info .info-row .info-value.budget .amount {
  font-size: 16px;
  font-weight: 600;
  color: #2196f3;
}

.travel-info .info-row .info-value.memo {
  font-size: 13px;
  color: #666;
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.travel-status {
  margin-top: 16px;
  text-align: center;
}
</style>
