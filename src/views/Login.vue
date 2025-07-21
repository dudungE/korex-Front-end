<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <a-icon type="compass" class="logo-icon" />
        <h1>여행 가계부</h1>
        <p>당신의 여행을 기록하세요</p>
      </div>

      <!-- 테스트 계정 안내 -->
      <a-alert 
        message="테스트 계정" 
        :description="testAccountInfo"
        type="info" 
        show-icon 
        style="margin-bottom: 20px;"
      />
      
      <a-form :form="form" @submit="handleSubmit" class="login-form">
        <!-- 기존 폼 코드와 동일 -->
        <a-form-item>
          <a-input
            v-decorator="['email', { rules: [{ required: true, message: '이메일을 입력해주세요!' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다!' }] }]"
            placeholder="이메일"
            size="large"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        
        <a-form-item>
          <a-input-password
            v-decorator="['password', { rules: [{ required: true, message: '비밀번호를 입력해주세요!' }] }]"
            placeholder="비밀번호"
            size="large"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-btn"
            block
          >
            로그인
          </a-button>
        </a-form-item>

        <!-- 빠른 로그인 버튼들 -->
        <div class="quick-login">
          <a-button 
            @click="quickLogin('test@example.com', '1234')"
            size="small"
            type="dashed"
          >
            김여행으로 로그인
          </a-button>
          <a-button 
            @click="quickLogin('travel@test.com', 'password')"
            size="small"
            type="dashed"
          >
            이모험으로 로그인
          </a-button>
        </div>
        
        <div class="login-footer">
          <a-button type="link">회원가입</a-button>
          <a-button type="link">비밀번호 찾기</a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      testAccountInfo: `
이메일: test@example.com / 비밀번호: 1234
이메일: travel@test.com / 비밀번호: password
이메일: demo@demo.com / 비밀번호: demo
      `.trim()
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true
          try {
            await this.authStore.login(values)
            this.$message.success(`${this.authStore.user.name}님 환영합니다!`)
            this.$router.push('/travel-budget')
          } catch (error) {
            this.$message.error(error.message)
          } finally {
            this.loading = false
          }
        }
      })
    },

    // 빠른 로그인 (개발용)
    quickLogin(email, password) {
      this.form.setFieldsValue({ email, password })
      this.handleSubmit({ preventDefault: () => {} })
    }
  }
}
</script>

<style lang="scss" scoped>
// 기존 스타일 + 추가
.quick-login {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  
  .ant-btn {
    font-size: 12px;
  }
}
</style>



<!-- <template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <a-icon type="compass" class="logo-icon" />
        <h1>여행 가계부</h1>
        <p>당신의 여행을 기록하세요</p>
      </div>
      
      <a-form :form="form" @submit="handleSubmit" class="login-form">
        <a-form-item>
          <a-input
            v-decorator="['email', { rules: [{ required: true, message: '이메일을 입력해주세요!' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다!' }] }]"
            placeholder="이메일"
            size="large"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        
        <a-form-item>
          <a-input-password
            v-decorator="['password', { rules: [{ required: true, message: '비밀번호를 입력해주세요!' }] }]"
            placeholder="비밀번호"
            size="large"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-btn"
            block
          >
            로그인
          </a-button>
        </a-form-item>
        
        <div class="login-footer">
          <a-button type="link">회원가입</a-button>
          <a-button type="link">비밀번호 찾기</a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    return {
      authStore
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true
          try {
            await this.authStore.login(values)
            this.$message.success('로그인 성공!')
            this.$router.push('/travel-budget')
          } catch (error) {
            this.$message.error('로그인에 실패했습니다.')
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    font-size: 48px;
    color: #2196f3;
    margin-bottom: 16px;
  }
  
  h1 {
    color: #1976d2;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    margin-bottom: 0;
  }
}

.login-btn {
  background: linear-gradient(45deg, #2196f3, #03a9f4);
  border: none;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  
  .ant-btn-link {
    color: #2196f3;
  }
}
</style> -->
