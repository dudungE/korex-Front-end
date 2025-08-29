<template>
  <section class="terms-section-v4">
    <div class="title-row-v4">
      <h2 class="section-title-v4">약관 동의</h2>
    </div>

    <div class="info-table-v4 terms-table-v4">
      <div class="info-row-v4 term-item-row" v-for="n in 3" :key="n">
        <div class="term-checkbox-row">
          <label :for="'agree-term-'+n" class="checkbox-label-v4">
            <input type="checkbox"
                   :id="'agree-term-'+n"
                   v-model="localAgree[n-1]"
                   class="hidden-checkbox-v4" />
            <span class="custom-checkbox-v4"></span>
            {{ termTitles[n-1] }}
            <span v-if="n < 3" class="required-text-v4">(필수)</span>
          </label>

          <div class="term-actions">
            <button type="button"
                    class="agree-term-button-v4"
                    :class="{ active: localAgree[n-1] }"
                    @click="toggleAgree(n)">
              {{ localAgree[n-1] ? '동의 완료' : '약관 동의' }}
            </button>

            <button type="button" class="arrow-button-v4" @click="toggleTerm(n)">
              <svg :class="{ down: showTerms[n-1] }" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 24 24" fill="none"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div v-show="showTerms[n-1]" class="term-content-v4">{{ terms[n-1] }}</div>
      </div>

      <div class="info-row-v4 agree-all-row">
        <button type="button"
                class="agree-all-button-v4"
                :class="{ active: agreeAll }"
                @click="toggleAgreeAll">
          전체 동의
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, defineEmits, defineExpose } from 'vue'
import axios from 'axios'

const emit = defineEmits(['update:agree1', 'update:agree2', 'update:agree3', 'agreed-success'])

const localAgree = ref([false, false, false])
const showTerms = ref([true, true, false])
const submitting = ref(false)

const termTitles = [
  '해외 송금 서비스 이용약관',
  '개인정보 수집 및 이용 동의',
  '개인정보 제3자 제공 동의'
]

const terms = [
  `[해외 송금 서비스 이용약관]\n1. 송금 한도: 5,000,000원 / 건\n2. 송금 수수료: 1~2% (환율 변동 포함)\n3. 환율 변동 책임: 이용자 부담\n4. 해외 수취인 정보 제공 동의\n5. 분쟁 해결 및 고객 지원 안내\n6. 부정 송금, 사기 등 불법행위 시 서비스 제한`,
  `[개인정보 수집 및 이용 동의]\n1. 수집 목적: 송금 처리, 본인 확인, 고객 지원\n2. 수집 항목: 이름, 연락처, 이메일, 계좌정보 등\n3. 보유 기간: 회원 탈퇴 후 3년\n4. 동의 거부 시 일부 서비스 이용 제한 가능`,
  `[개인정보 제3자 제공 동의]\n1. 제공 목적: 해외 송금 서비스 제공 및 법규 준수\n2. 제공 항목: 이름, 연락처, 계좌정보 등\n3. 제공받는 자: 송금업체, 금융기관\n4. 보유 및 이용기간: 서비스 종료 후 5년\n5. 동의 거부 시 일부 서비스 이용 제한 가능`
]

function toggleAgree(n) {
  localAgree.value[n - 1] = !localAgree.value[n - 1]
  emitState()
}

function toggleTerm(n) { showTerms.value[n - 1] = !showTerms.value[n - 1] }

const agreeAll = computed({
  get() { return localAgree.value.every(v => v) },
  set(val) {
    localAgree.value = localAgree.value.map(() => val)
    showTerms.value = [true, true, true]
    emitState()
  }
})

function toggleAgreeAll() { agreeAll.value = !agreeAll.value }

const isStepValid = computed(() => localAgree.value[0] && localAgree.value[1])

function emitState() {
  emit('update:agree1', localAgree.value[0])
  emit('update:agree2', localAgree.value[1])
  emit('update:agree3', localAgree.value[2])
}

// ✅ 백엔드 호출 + emit
async function agreeTerms() {
  if (!isStepValid.value) return false

  const token = localStorage.getItem('accessToken')
  if (!token) {
    alert('로그인 정보가 없습니다.')
    return false
  }

  try {
    submitting.value = true
    const payload = {
      agree1: localAgree.value[0],
      agree2: localAgree.value[1],
      agree3: localAgree.value[2]
    }

    await axios.post(`/api/foreign-transfer/terms`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    emit('agreed-success')
    return true
  } catch (err) {
    console.error('약관 동의 실패:', err.response || err)
    alert('약관 동의 중 오류가 발생했습니다.')
    return false
  } finally {
    submitting.value = false
  }
}

defineExpose({ agreeTerms, localAgree })
</script>

<style scoped>
.title-row-v4 { display:flex; justify-content:center; align-items:center; margin-bottom:28px; }
.terms-section-v4 { background:#fff; border-radius:12px; padding:24px; box-shadow:0 4px 15px rgba(0,0,0,0.08); font-family:'Pretendard Variable',sans-serif; color:#333; margin-bottom:2rem; }
.section-title-v4 { font-size:26px; font-weight:700; color:#008681; margin-bottom:28px; text-align:center; }
.info-table-v4 { background:#f8f8f8; border-radius:10px; border:1px solid #e0e0e0; overflow:hidden; display:flex; flex-direction:column; }
.info-row-v4 {display:flex; flex-direction:column; padding:14px 20px; border-bottom:1px solid #eee;}
.info-row-v4:last-child{border-bottom:none;}
.term-item-row{display:flex; flex-direction:column; width:100%;}
.term-checkbox-row{display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap;}
.checkbox-label-v4{display:flex; align-items:center; cursor:pointer; font-size:16px; color:#333; font-weight:500; flex-grow:1;}
.hidden-checkbox-v4{position:absolute; opacity:0; width:0; height:0;}
.custom-checkbox-v4{display:inline-block; width:22px; height:22px; border:2px solid #ccc; border-radius:6px; margin-right:12px; position:relative; transition:all 0.2s ease; flex-shrink:0; background:#fff;}
.hidden-checkbox-v4:checked + .custom-checkbox-v4{background:#009b99; border-color:#009b99;}
.hidden-checkbox-v4:checked + .custom-checkbox-v4::after{content:'✓'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:16px; font-weight:900;}
.required-text-v4{font-size:14px; color:#d9534f; margin-left:6px; font-weight:600;}
.term-actions{display:flex; align-items:center; gap:8px; margin-left:auto; margin-top:5px;}
.agree-term-button-v4{padding:6px 12px; background:#e0e0e0; color:#666; border:none; border-radius:6px; font-size:14px; cursor:pointer; transition:0.2s;}
.agree-term-button-v4.active{background:#009b99; color:#fff;}
.agree-term-button-v4:hover{background:#009b99; color:#fff;}
.term-content-v4{margin-top:10px; padding:12px; background:#fff; border-radius:8px; border:1px solid #e0e0e0; font-size:14px; color:#555; white-space:pre-line;}
.agree-all-row{display:flex; justify-content:flex-start; padding:18px 20px; background:#f0f0f0; border-top:1px solid #e0e0e0; align-items:center;}
.agree-all-button-v4{padding:10px 20px; background:#dcdcdc; color:#666; border:none; border-radius:8px; font-size:16px; font-weight:700; cursor:pointer; transition:0.2s ease; width:auto; max-width:200px;}
.agree-all-button-v4.active{background:#009b99; color:#fff; box-shadow:0 4px 12px rgba(61,153,112,0.2);}
.agree-all-button-v4:hover{background:#009b99; color:#fff;}
.arrow-button-v4 { background: #f8f8f8; border: none; padding: 6px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
.arrow-button-v4:hover { background: #e0e0e0; }
.arrow-button-v4 svg { width: 20px; height: 20px; stroke: #888; transition: transform 0.3s ease; }
.arrow-button-v4 svg.down { transform: rotate(180deg); }

@media(max-width:768px){
  .terms-section-v4{padding:16px;}
  .section-title-v4{font-size:22px;margin-bottom:20px;}
  .term-checkbox-row{flex-direction:column;align-items:flex-start;}
  .term-actions{margin-left:0;margin-top:8px;flex-wrap:wrap;}
  .term-content-v4{font-size:13px;padding:10px;}
  .arrow-button-v4{margin-top:5px;}
}
</style>