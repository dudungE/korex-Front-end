<template>
    <div class="news-container">
      <!-- 헤더 섹션 -->
      <div class="news-header">
        <h2 class="news-title">환율 뉴스</h2>
        <div class="news-meta" v-if="newsUpdateTime">
          <span class="update-time">최종 업데이트: {{ formatUpdateTime(newsUpdateTime) }}</span>
          <button @click="refreshNews" class="refresh-btn" :disabled="isLoading">
            <i class="refresh-icon" :class="{ 'spinning': isLoading }">🔄</i>
            새로고침
          </button>
        </div>
      </div>
  
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>환율 뉴스를 불러오는 중...</p>
      </div>
  
      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchExchangeNews" class="retry-btn">다시 시도</button>
      </div>
  
      <!-- 뉴스 리스트 -->
      <div v-else-if="exchangeNews.length > 0" class="news-list">
        <article 
          v-for="(news, index) in exchangeNews" 
          :key="index" 
          class="news-item"
          @click="openNewsLink(news.link)"
        >
          <div class="news-content">
            <h3 class="news-item-title">{{ news.title }}</h3>
            <p class="news-summary">{{ news.summary }}</p>
            
            <div class="news-footer">
              <div class="news-info">
                <span class="news-press">{{ news.press }}</span>
                <span class="news-date">{{ news.date }}</span>
              </div>
              <div class="news-actions">
                <a 
                  :href="news.link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="news-link"
                  @click.stop
                >
                  원문 보기 →
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
  
      <!-- 데이터가 없는 경우 -->
      <div v-else class="empty-state">
        <p>현재 표시할 환율 뉴스가 없습니다.</p>
        <button @click="fetchExchangeNews" class="retry-btn">뉴스 불러오기</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'News',
    data() {
      return {
        exchangeNews: [],
        newsUpdateTime: null,
        isLoading: false,
        error: null
      }
    },
    
    async mounted() {
      await this.fetchExchangeNews();
    },
  
    methods: {
      async fetchExchangeNews() {
        this.isLoading = true;
        this.error = null;
        
        try {
          const response = await fetch('/api/exchange/news');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          this.exchangeNews = data;
          
          if (data.length > 0) {
            this.newsUpdateTime = data[0].crawl_time;
          }
          
        } catch (error) {
          console.error('환율 뉴스를 가져오는 중 오류 발생:', error);
          this.error = '환율 뉴스를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.';
        } finally {
          this.isLoading = false;
        }
      },
  
      async refreshNews() {
        if (!this.isLoading) {
          await this.fetchExchangeNews();
        }
      },
  
      openNewsLink(link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      },
  
      formatUpdateTime(crawlTime) {
        if (!crawlTime) return '';
        
        // crawl_time이 문자열인 경우 Date 객체로 변환
        const date = new Date(crawlTime);
        const now = new Date();
        
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMins < 1) {
          return '방금 전';
        } else if (diffMins < 60) {
          return `${diffMins}분 전`;
        } else if (diffHours < 24) {
          return `${diffHours}시간 전`;
        } else {
          return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .news-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  /* 헤더 스타일 */
  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e9ecef;
  }
  
  .news-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }
  
  .news-meta {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .update-time {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }
  
  .refresh-btn:hover:not(:disabled) {
    background: #0056b3;
  }
  
  .refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .refresh-icon {
    display: inline-block;
    transition: transform 0.5s ease;
  }
  
  .refresh-icon.spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* 로딩 및 에러 상태 */
  .loading-container, .error-container, .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  .error-message {
    color: #dc3545;
    margin-bottom: 20px;
  }
  
  .retry-btn {
    padding: 12px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s ease;
  }
  
  .retry-btn:hover {
    background: #218838;
  }
  
  /* 뉴스 리스트 스타일 */
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .news-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .news-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #007bff;
  }
  
  .news-content {
    width: 100%;
  }
  
  .news-item-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
    line-height: 1.4;
  }
  
  .news-summary {
    color: #495057;
    line-height: 1.6;
    margin: 0 0 20px 0;
    font-size: 1rem;
  }
  
  .news-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f8f9fa;
  }
  
  .news-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .news-press {
    color: #007bff;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  .news-date {
    color: #6c757d;
    font-size: 0.85rem;
  }
  
  .news-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 6px 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .news-link:hover {
    background: #007bff;
    color: white;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .news-container {
      padding: 15px;
    }
    
    .news-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    
    .news-title {
      font-size: 1.8rem;
    }
    
    .news-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      width: 100%;
    }
    
    .news-item {
      padding: 18px;
    }
    
    .news-item-title {
      font-size: 1.1rem;
    }
    
    .news-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    
    .news-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
  </style>
  