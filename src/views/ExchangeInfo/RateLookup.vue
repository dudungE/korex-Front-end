<template>
  <div class="forex-system">

    <div class="content-wrap">
      <main class="main-content">
        <h1>환율 조회</h1>
        <TabNav current="rateLookup" />

        <!-- 환율 조회 탭 버튼들 -->
        <nav class="tabs">
          <button 
            :class="{ active: activeTab === 'realtime' }" 
            @click="activeTab = 'realtime'"
          >
            실시간 환율
          </button>
          <button 
            :class="{ active: activeTab === 'bydate' }" 
            @click="activeTab = 'bydate'"
          >
            날짜별 환율
          </button>
          <button 
            :class="{ active: activeTab === 'bycurrency' }" 
            @click="activeTab = 'bycurrency'"
          >
            통화별 환율
          </button>
       
        </nav>

        <!-- 실시간 환율 조회 -->
        <section v-if="activeTab === 'realtime'" class="search-box">
          <h3>실시간 환율 조회</h3>
          <p class="description">실시간 환율 정보입니다.(기준 시간 기준: )</p>
          
          <div v-if="realTimeRates.length > 0" class="result-box">
            <h4>실시간 환율 결과</h4>
            <div class="rates-table">
              <table>
                <thead>
                  <tr>
                    <th>통화</th>
                    <th>매매기준율</th>
                    <th>현찰사실때</th>
                    <th>현찰파실때</th>
                    <th>송금보내실때</th>
                    <th>송금받으실때</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rate in realTimeRates" :key="rate.currency_code">
                    <td>{{ rate.currency_code }}</td>
                    <td>{{ rate.base_rate }}</td>
                    <td>{{ rate.buy_cash_rate }}</td>
                    <td>{{ rate.sell_cash_rate }}</td>
                    <td>{{ rate.send_rate }}</td>
                    <td>{{ rate.receive_rate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 날짜별 환율 조회 -->
        <section v-if="activeTab === 'bydate'" class="search-box">
          <h3>날짜별 환율 조회</h3>
          <p class="description">특정 날짜의 여러 통화 환율을 조회합니다.</p>
          <form @submit.prevent="getRatesByDate">
            <label>
              날짜 선택
              <input type="date" v-model="selectedDate" required />
            </label>
            <button type="submit" :disabled="loading" class="primary-btn">
              {{ loading ? '조회 중...' : '날짜별 환율 조회' }}
            </button>
          </form>
          
          <div v-if="ratesByDate.length > 0" class="result-box">
            <h4>{{ selectedDate }} 환율 결과</h4>
            <div class="rates-table">
              <table>
                <thead>
                  <tr>
                    <th>통화</th>
                    <th>매매기준율</th>
                    <th>현찰사실때</th>
                    <th>현찰파실때</th>
                    <th>송금보내실때</th>
                    <th>송금받으실때</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rate in ratesByDate" :key="rate.currencyCode">
                    <td>{{ rate.currencyCode }}</td>
                    <td>{{ rate.baseRate }}</td>
                    <td>{{ rate.buyCashRate }}</td>
                    <td>{{ rate.sellCashRate }}</td>
                    <td>{{ rate.sendRate }}</td>
                    <td>{{ rate.receiveRate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 통화별 환율 조회 -->
        <section v-if="activeTab === 'bycurrency'" class="search-box">
          <h3>통화별 환율 조회</h3>
          <p class="description">특정 통화의 일자별 환율 변동을 조회합니다.</p>
          <form @submit.prevent="getRatesByCurrency">
            <label>
              통화 선택
              <select v-model="selectedCurrency" required>
                <option value="">선택하세요</option>
                <option value="USD">USD - 미국 달러</option>
                <option value="EUR">EUR - 유로</option>
                <option value="JPY">JPY - 일본 엔</option>
                <option value="CNY">CNY - 중국 위안</option>
                <option value="CAD">CAD - 캐나다 달러</option>
                <option value="CHF">CHF - 스위스 프랑</option>
              </select>
            </label>
            <button type="submit" :disabled="loading" class="primary-btn">
              {{ loading ? '조회 중...' : '통화별 환율 조회' }}
            </button>
          </form>
          
          <div v-if="ratesByCurrency.length > 0" class="result-box">
            <h4>{{ selectedCurrency }} 일자별 환율 변동</h4>
            <div class="rates-table">
              <table>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>매매기준율</th>
                    <th>현찰사실때</th>
                    <th>현찰파실때</th>
                    <th>송금보내실때</th>
                    <th>송금받으실때</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rate in ratesByCurrency" :key="rate.date">
                    <td>{{ formatDate(rate.baseDate) }}</td>
                    <td>{{ rate.baseRate }}</td>
                    <td>{{ rate.buyCashRate }}</td>
                    <td>{{ rate.sellCashRate }}</td>
                    <td>{{ rate.sendRate }}</td>
                    <td>{{ rate.receiveRate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer class="footer-info">
          <span>조회시각: {{ currentTime }}</span>
        </footer>
      </main>
    </div>
  </div>
</template>

<script>
import TabNav from '@/components/exchange_info/TabNav.vue';

export default {
  name: 'RateLookup',
  components: { TabNav },
  data() {
    
    return {
      activeTab: 'realtime',
      loading: false,
      currentTime: this.getCurrentTime(),
      
      // 실시간 환율 데이터
      realTimeRates: [],
      
      // 날짜별 환율 데이터
      selectedDate: this.getToday(),
      ratesByDate: [],
      
      // 통화별 환율 데이터
      selectedCurrency: '',
      ratesByCurrency: [],
    };
  },
  // 페이지 로드 시 실시간 환율 조회
  mounted() {
    this.getRealTimeRates();
  },
  // 메서드
  methods: {
    getToday() {
      const d = new Date();
      return d.toISOString().slice(0, 10);
    },
    getCurrentTime() {
      const d = new Date();
      return d.getFullYear() + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일 ' + 
             d.getHours() + '시' + d.getMinutes() + '분' + d.getSeconds() + '초';
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    },
    // 실시간 환율 조회 API
    async getRealTimeRates() {
      this.loading = true;
      try {
        console.log('실시간 환율 조회 시작...');
        const response = await fetch('/api/exchange/real-time');
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('실시간 환율 데이터:', data);
          this.realTimeRates = data;
        } else {
          const errorText = await response.text();
          console.error('API 응답 오류:', response.status, errorText);
          alert(`실시간 환율 조회에 실패했습니다. (${response.status})`);
        }
      } catch (error) {
        console.error('실시간 환율 조회 오류:', error);
        alert('실시간 환율 조회 중 오류가 발생했습니다.');
      } finally {
        this.loading = false;
        this.currentTime = this.getCurrentTime();
      }
    },
    // 날짜별 환율 조회 API
    async getRatesByDate() {
      this.loading = true;
      try {
        console.log('날짜별 환율 조회 시작...', this.selectedDate);
        const response = await fetch(`/api/exchange/by-date?date=${this.selectedDate}`);
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('날짜별 환율 데이터:', data);
          this.ratesByDate = data;
        } else {
          const errorText = await response.text();
          console.error('API 응답 오류:', response.status, errorText);
          alert(`날짜별 환율 조회에 실패했습니다. (${response.status})`);
        }
      } catch (error) {
        console.error('날짜별 환율 조회 오류:', error);
        alert('날짜별 환율 조회 중 오류가 발생했습니다.');
      } finally {
        this.loading = false;
        this.currentTime = this.getCurrentTime();
      }
    },
    
    // 통화별 환율 조회 API
    async getRatesByCurrency() {
      this.loading = true;
      try {
        console.log('통화별 환율 조회 시작...', this.selectedCurrency);
        const response = await fetch(`/api/exchange/by-currency/${this.selectedCurrency}`);
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('통화별 환율 데이터:', data);
          this.ratesByCurrency = data;
        } else {
          const errorText = await response.text();
          console.error('API 응답 오류:', response.status, errorText);
          alert(`통화별 환율 조회에 실패했습니다. (${response.status})`);
        }
      } catch (error) {
        console.error('통화별 환율 조회 오류:', error);
        alert('통화별 환율 조회 중 오류가 발생했습니다.');
      } finally {
        this.loading = false;
        this.currentTime = this.getCurrentTime();
      }
    },
    
    goTab(name) {
      if (name === 'rateChart') {
        this.$router.push('/rate-chart');
      }
    },
  },
};
</script>

<style scoped>
.forex-system {
  font-family: 'Noto Sans KR', Arial, sans-serif;
  background: #fafbfc;
  min-height: 100vh;
  width: 100vw;
  min-width: 0;
}

.content-wrap {
  width: 100%;
}

.main-content {
  width: 100%;
  padding: 40px 48px;
}

.main-content h1 {
  font-size: 2rem;
  margin-bottom: 24px;
  color: #222;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.tabs button {
  background: #f2f8f7;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  color: #009490;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.tabs button.active, .tabs button:hover {
  background: #009490;
  color: #fff;
}

.search-box {
  background: #fff;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  color: #222;
}

.search-box h3 {
  margin: 0 0 8px 0;
  color: #009490;
  font-size: 1.2rem;
}

.description {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.search-box form {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.search-box label {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  color: #222;
}

.search-box select, .search-box input[type="date"] {
  margin-top: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  font-family: inherit;
  outline: none;
  min-width: 150px;
}

.primary-btn {
  background: #009490;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
  min-width: 120px;
}

.primary-btn:hover:not(:disabled) {
  background: #007c7a;
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-box {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #e9ecef;
}

.result-box h4 {
  margin: 0 0 16px 0;
  color: #009490;
  font-size: 1.1rem;
}

.rates-table {
  overflow-x: auto;
}

.rates-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.rates-table th,
.rates-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.rates-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #009490;
}

.rates-table tr:hover {
  background: #f8f9fa;
}

.footer-info {
  display: flex;
  gap: 32px;
  color: #888;
  font-size: 0.95rem;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .search-box form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .rates-grid {
    grid-template-columns: 1fr;
  }
  
  .rates-table {
    font-size: 0.9rem;
  }
}
</style>