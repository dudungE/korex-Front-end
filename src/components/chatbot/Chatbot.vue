<template>
    
    <div class="chatbot-container" :class="{ open: isOpen }">
        <div class="toggle-handle">
      <button class="toggle-btn" @click="toggleOpen">
        {{ isOpen ? 'X' : '챗봇' }}
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
      };
    },
    methods: {
      toggleOpen() {
        this.isOpen = !this.isOpen;
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
          const response = await axios.post('/api/llm/query', {
            model_name: 'mistral:latest', // 원하는 모델명으로 변경 가능
            prompt: prompt,
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
    },
  };
  </script>
  
  <style scoped>
 .chatbot-container {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 60px;
  width: 320px;
  background: white;
  border-left: 1px solid #ddd;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 500;
  display: flex; /* 자식 요소를 가로로 배치 */
  transition: transform 0.3s ease;
  /* 닫혔을 때 핸들(50px)만 보이도록 이동 */
  transform: translateX(calc(100% - 50px));
}
.chatbot-container.open {
  transform: translateX(0);
}

/* 버튼을 담는 핸들 영역 */
.toggle-handle {
  width: 50px;
  flex-shrink: 0; /* 컨테이너 크기가 변해도 줄어들지 않음 */
  display: flex;
  align-items: flex-start; /* 버튼을 위쪽에 정렬 */
  justify-content: center;
  padding-top: 20px;
  background-color: #f8f9fa;
}

.toggle-btn {
  /* position: absolute 제거 */
  width: 40px;
  height: 40px;
  background-color: #004ea1;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
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
  </style>
  