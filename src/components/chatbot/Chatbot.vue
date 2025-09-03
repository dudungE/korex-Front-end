<template>
    
    <div class="chatbot-container" :class="{ open: isOpen }" :style="containerStyle">
        <div class="toggle-handle" @mousedown="startDrag" @touchstart.prevent="startDrag">
      <button class="toggle-btn" @click="toggleOpen">
        {{ isOpen ? '➖' : '💬' }}
      </button>
    </div>

        <!-- <button class="toggle-btn" @click="toggleOpen">
            {{ isOpen ? '닫기' : '챗봇' }}
        </button> -->
        
      <div v-if="isOpen" class="chatbot-body">
        <div class="messages" ref="messagesContainer">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender === '사용자' ? 'user' : 'bot']">
            <span class="sender">{{ msg.sender }}:</span> {{ msg.text }}
          </div>
        </div>
  
        <input
          type="text"
          v-model="inputText"
          @keyup.enter="sendMessage"
          placeholder="메시지를 입력하세요"
          :disabled="isSending"
          aria-label="챗봇 메시지 입력창"
        />
      </div>

      <!-- 크기 조절 핸들 -->
      <div class="resize-handle" @mousedown="startResize" @touchstart.prevent="startResize"></div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Chatbot',
    data() {
      return {
        isOpen: false,
        inputText: '',
        messages: [],
        isSending: false,
        sessionId: '',
        dragging: false,
        resizing: false,
        posX: 0,
        posY: 150,
        dragOffsetX: 0,
        dragOffsetY: 0,
        containerWidth: 320,
        containerHeight: 480,
        // 리사이즈 시작 시 기준 값
        startMouseX: 0,
        startMouseY: 0,
        startWidth: 320,
        startHeight: 480,
        // 최소/최대 크기
        minWidth: 280,
        maxWidth: 640,
        minHeight: 280,
        maxHeight: 840
      };
    },
    mounted() {
      // 세션ID 초기화 (없으면 생성 후 저장)
      const saved = localStorage.getItem('chatbotSessionId');
      if (saved) {
        this.sessionId = saved;
      } else {
        const generated = `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        this.sessionId = generated;
        localStorage.setItem('chatbotSessionId', generated);
      }
      // 초기 위치를 화면 우측 여백 20px로 설정
      this.$nextTick(() => {
        try {
          const rect = this.$el.getBoundingClientRect();
          if (rect.height) this.containerHeight = rect.height;
        } catch (e) {}
        const vw = window.innerWidth;
        this.posX = Math.max(0, vw - this.containerWidth - 20);
      });
      // 드래그/리사이즈 이벤트 리스너 등록
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
      window.addEventListener('touchmove', this.onDrag, { passive: false });
      window.addEventListener('touchend', this.stopDrag);
      window.addEventListener('resize', this.onWindowResize);
    },
    beforeUnmount() {
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
      window.removeEventListener('touchmove', this.onDrag);
      window.removeEventListener('touchend', this.stopDrag);
      window.removeEventListener('resize', this.onWindowResize);
    },
    methods: {
      toggleOpen() {
        const willOpen = !this.isOpen;
        this.isOpen = willOpen;
        if (!willOpen) {
          // 닫을 때 위치를 초기(X는 오른쪽 20px)로 리셋
          const vw = window.innerWidth;
          this.posX = Math.max(0, vw - this.containerWidth - 20);
          // 필요 시 Y 위치도 초기값으로 복원하려면 아래 주석 해제
          this.posY = 150;
        }
        this.$nextTick(() => this.scrollToBottom());
      },
      scrollToBottom() {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      },
      async sendMessage() {
        const prompt = this.inputText.trim();
        if (!prompt || this.isSending) return;
  
        this.isSending = true;
        this.messages.push({ sender: '사용자', text: prompt });
        this.inputText = '';
        this.$nextTick(() => this.scrollToBottom());
  
        try {
          const response = await axios.post('/api/chatbot/ask', {
            prompt: prompt,
            sessionId: this.sessionId,
          });
  
          const botReply =
            typeof response.data === 'string'
              ? response.data
              : response.data.response || '응답이 없습니다.';
  
          this.messages.push({ sender: '챗봇', text: botReply });
        } catch (error) {
          this.messages.push({
            sender: '챗봇',
            text: '오류가 발생했습니다. 다시 시도해 주세요.',
          });
        } finally {
          this.isSending = false;
          this.$nextTick(() => this.scrollToBottom());
        }
      },
      startDrag(e) {
        const point = e.touches ? e.touches[0] : e;
        this.dragging = true;
        this.resizing = false;
        this.dragOffsetX = point.clientX - this.posX;
        this.dragOffsetY = point.clientY - this.posY;
      },
      startResize(e) {
        const point = e.touches ? e.touches[0] : e;
        this.resizing = true;
        this.dragging = false;
        this.startMouseX = point.clientX;
        this.startMouseY = point.clientY;
        this.startWidth = this.containerWidth;
        this.startHeight = this.containerHeight;
      },
      onDrag(e) {
        const point = e.touches ? e.touches[0] : e;
        if (e.cancelable) e.preventDefault();
        if (this.dragging) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const maxX = Math.max(0, vw - this.containerWidth);
          const maxY = Math.max(0, vh - this.containerHeight);
          const nextX = point.clientX - this.dragOffsetX;
          const nextY = point.clientY - this.dragOffsetY;
          this.posX = Math.min(Math.max(0, nextX), maxX);
          this.posY = Math.min(Math.max(0, nextY), maxY);
        } else if (this.resizing) {
          const deltaX = point.clientX - this.startMouseX;
          const deltaY = point.clientY - this.startMouseY;
          let nextW = this.startWidth + deltaX;
          let nextH = this.startHeight + deltaY;
          // 최소/최대 범위 클램프
          nextW = Math.min(Math.max(this.minWidth, nextW), this.maxWidth);
          nextH = Math.min(Math.max(this.minHeight, nextH), this.maxHeight);
          // 화면 밖으로 벗어나지 않게 보정
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          if (this.posX + nextW > vw) nextW = vw - this.posX;
          if (this.posY + nextH > vh) nextH = vh - this.posY;
          this.containerWidth = nextW;
          this.containerHeight = nextH;
        }
      },
      stopDrag() {
        this.dragging = false;
        this.resizing = false;
      },
      onWindowResize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // 위치 보정
        this.posX = Math.min(this.posX, Math.max(0, vw - this.containerWidth));
        this.posY = Math.min(this.posY, Math.max(0, vh - this.containerHeight));
        // 크기 보정
        if (this.posX + this.containerWidth > vw) {
          this.containerWidth = Math.max(this.minWidth, vw - this.posX);
        }
        if (this.posY + this.containerHeight > vh) {
          this.containerHeight = Math.max(this.minHeight, vh - this.posY);
        }
      },
    },
    computed: {
      containerStyle() {
        return {
          top: this.posY + 'px',
          left: this.posX + 'px',
          width: this.containerWidth + 'px',
          height: this.containerHeight + 'px'
        };
      }
    }
  };
  </script>
  
  <style scoped>
 .chatbot-container {
  position: fixed;
  /* 위치는 인라인 스타일(top/left)로 제어 */
  width: 320px;
  background: white;
  border-left: 1px solid #ddd;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 500;
  display: flex; /* 자식 요소를 가로로 배치 */
  transition: transform 0.2s ease;
  /* 닫혔을 때 핸들(50px)만 보이도록 이동 */
  transform: translateX(calc(100% - 50px));
  user-select: none;
}
.chatbot-container.open {
  transform: translateX(0);
}

/* 버튼을 담는 핸들 영역 */
.toggle-handle {
  width: 30px;
  flex-shrink: 0; /* 컨테이너 크기가 변해도 줄어들지 않음 */
  display: flex;
  align-items: flex-start; /* 버튼을 위쪽에 정렬 */
  justify-content: center;
  padding-top: 20px;
  background-color: #009490;
  cursor: move;
}

.toggle-btn {
  /* position: absolute 제거 */
  width: 20px;
  height: 20px;
  background-color: #009490;
  color: #111;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.chatbot-body {
  flex-grow: 1; /* 남은 공간을 모두 차지 */
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;
  border-left: 1px solid #eee;
}
  
  .messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 8px;
    padding-right: 8px;
    word-break: break-word;
  }
  
  .message {
    margin-bottom: 10px;
    line-height: 1.4;
    padding: 6px 8px;
    border-radius: 6px;
  }
  
  .message.user {
    background-color: #e0f0ff;
    align-self: flex-end;
  }
  
  .message.bot {
    background-color: #f0f0f0;
    align-self: flex-start;
  }
  
  .sender {
    font-weight: 700;
    margin-right: 6px;
  }
  
  input[type='text'] {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    outline: none;
  }
  
  input[type='text']:focus {
    border-color: #004ea1;
  }

/* 크기 조절 핸들 */
.resize-handle {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 14px;
  height: 14px;
  cursor: se-resize;
}

/* 대각선 가이드 (선택) */
.resize-handle::before {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 10px;
  height: 10px;
  border-right: 2px solid #c1c7d0;
  border-bottom: 2px solid #c1c7d0;
}
  </style>
  