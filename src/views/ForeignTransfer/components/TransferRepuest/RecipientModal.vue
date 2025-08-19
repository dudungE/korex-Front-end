<template>
  <div class="modal-backdrop-v4" @click.self="closeModal">
    <div class="modal-content-v4">
      <header class="modal-header-v4">
        <h3 class="modal-title-v4">수취인 선택</h3>
        <button class="close-btn-v4" @click="closeModal">×</button>
      </header>
      <div class="table-container-v4">
        <table class="recipient-table-v4">
          <thead>
          <tr>
            <th style="width: 8%;">이름</th>
            <th style="width: 7%;">통화</th>
            <th style="width: 10%;">은행</th>
            <th style="width: 15%;">계좌번호</th>
            <th style="width: 13%;">핸드폰 번호</th>
            <th style="width: 15%;">이메일 주소</th>
            <th style="width: 18%;">주소</th>
            <th style="width: 8%;">선택</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="recipient in recipientList"
              :key="recipient.id"
          >
            <td>{{ recipient.name }}</td>
            <td>{{ recipient.currency }}</td>
            <td>{{ recipient.bank }}</td>
            <td>{{ recipient.account }}</td>
            <td>{{ recipient.phone }}</td>
            <td>{{ recipient.email }}</td>
            <td class="address-cell">
              {{ recipient.addressDetail }} <br>
              {{ recipient.addressCountry }}
            </td>
            <td>
              <button @click="selectRecipient(recipient)" type="button" class="select-button-v4">선택</button>
            </td>
          </tr>
          <tr v-if="recipientList.length === 0">
            <td colspan="9" class="no-data-v4">수취인 목록이 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits} from 'vue'

const props = defineProps({
  recipientList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['selectRecipient', 'closeModal'])

function selectRecipient(recipient) {
  emit('selectRecipient', recipient)
}

function closeModal() {
  emit('closeModal')
}
</script>>

<style scoped>
/* 모달 백드롭 */
.modal-backdrop-v4 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* 더 진한 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* 모달 내용 컨테이너 */
.modal-content-v4 {
  background: #ffffff;
  width: 95%; /* 너비 약간 늘림 */
  max-width: 1100px; /* 최대 너비 증가 */
  max-height: 85vh; /* 높이 약간 늘림 */
  display: flex; /* Flexbox 사용하여 헤더, 테이블 컨테이너 배치 */
  flex-direction: column;
  border-radius: 12px;
  padding: 24px; /* 패딩 증가 */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25); /* 더 부드러운 그림자 */
  box-sizing: border-box;
  color: #333333;
}

/* 모달 헤더 */
.modal-header-v4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* 간격 증가 */
  padding-bottom: 15px; /* 헤더 하단 패딩 */
  border-bottom: 1px solid #eeeeee; /* 헤더 하단 구분선 */
}

.modal-title-v4 {
  font-size: 26px;
  font-weight: 700;
  color: #008681; /* Deeper Green */
  margin: 0;
}

.close-btn-v4 {
  background: transparent;
  border: none;
  font-size: 2.2rem; /* 더 크게 */
  color: #666666; /* 색상 변경 */
  cursor: pointer;
  padding: 5px; /* 클릭 영역 확보 */
  transition: color 0.2s ease;
}

.close-btn-v4:hover {
  color: #333333;
}

/* 테이블 컨테이너 (스크롤 관리) */
.table-container-v4 {
  flex-grow: 1; /* 남은 공간 차지 */
  overflow-x: auto; /* 가로 스크롤 가능하게 */
  overflow-y: auto; /* 세로 스크롤 가능하게 */
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
  border: 1px solid #e0e0e0; /* 테이블 전체 테두리 */
  border-radius: 8px; /* 테이블 컨테이너 둥근 모서리 */
  background-color: #f8f8f8; /* 배경색 */
}

/* 수취인 테이블 */
.recipient-table-v4 {
  width: 100%;
  border-collapse: separate; /* border-radius 적용을 위해 */
  border-spacing: 0; /* border-collapse 대신 사용 */
  font-size: 15px;
  color: #333333;
  table-layout: fixed; /* 테이블 레이아웃 고정 */
}

.recipient-table-v4 th,
.recipient-table-v4 td {
  padding: 12px 10px; /* 패딩 증가 */
  text-align: center;
  border-bottom: 1px solid #eeeeee; /* 셀 간 구분선 */
}

/* 모든 td에 기본적으로 텍스트 줄바꿈 허용 */
.recipient-table-v4 td {
  white-space: normal; /* 기본적으로 모든 td에서 줄바꿈 허용 */
  overflow: visible; /* 넘치는 내용 숨기지 않음 */
  text-overflow: clip; /* 넘치는 내용 ... 처리하지 않음 */
}

/* 주소 셀은 왼쪽 정렬 */
.address-cell {
  text-align: left;
  word-break: break-word; /* 긴 단어 줄바꿈 */
  vertical-align: top; /* 여러 줄일 경우 상단 정렬 */
}


.recipient-table-v4 th {
  background-color: #E6F5F4; /* 헤더 배경색 (v4 스타일에서 추출) */
  font-weight: 600;
  color: #008681; /* 헤더 텍스트 색상 */
  position: sticky; /* 헤더 고정 */
  top: 0;
  z-index: 10;
  white-space: nowrap; /* 헤더 텍스트는 한 줄로 유지 */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 테이블 셀 테두리 조정 */
.recipient-table-v4 th:first-child { border-top-left-radius: 8px; }
.recipient-table-v4 th:last-child { border-top-right-radius: 8px; }
.recipient-table-v4 tr:last-child td:first-child { border-bottom-left-radius: 8px; }
.recipient-table-v4 tr:last-child td:last-child { border-bottom-right-radius: 8px; }

/* 마지막 행 하단 테두리 제거 */
.recipient-table-v4 tbody tr:last-child td {
  border-bottom: none;
}


/* 선택 버튼 */
.select-button-v4 {
  padding: 8px 16px;
  background-color: #009b99; /* Green button */
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.select-button-v4:hover {
  background-color: #008681;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 데이터 없음 메시지 */
.no-data-v4 {
  text-align: center;
  color: #888888;
  padding: 20px;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-content-v4 {
    width: 98%;
    padding: 15px;
    max-height: 90vh; /* 모바일에서 더 많은 공간 사용 */
  }

  .modal-header-v4 {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }

  .modal-title-v4 {
    font-size: 22px;
  }

  .close-btn-v4 {
    font-size: 2rem;
  }

  .table-container-v4 {
    border-radius: 6px;
  }

  .recipient-table-v4 {
    font-size: 13px; /* 모바일에서 글꼴 크기 줄임 */
  }

  /* 모바일에서 th/td의 padding을 조금 더 줄여 공간 확보 */
  .recipient-table-v4 th,
  .recipient-table-v4 td {
    padding: 8px 6px;
  }

  /* 모바일에서는 주소 줄바꿈이 더욱 중요하므로 white-space: normal 유지 */
  .address-cell {
    white-space: normal;
  }

  .select-button-v4 {
    padding: 7px 14px;
    font-size: 13px;
  }

  .no-data-v4 {
    padding: 15px;
    font-size: 14px;
  }
}
</style>