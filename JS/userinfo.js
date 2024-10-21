document.getElementById('fetch-user-btn').addEventListener('click', function() {
    const accessToken = 'your_access_token_here'; // 실제 액세스 토큰으로 교체해야 함
    const userEmail = 'user@example.com'; // 실제 사용자의 이메일로 교체해야 함
  
    fetch(`https://example.com/open-api/user/${userEmail}`, { // 실제 백엔드 URL로 수정 필요
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Bearer 토큰 추가
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      const userInfo = document.getElementById('user-info');
      const errorMessage = document.getElementById('error-message');
  
      if (data.result.resultCode === 200) {
        const user = data.body;
        userInfo.innerHTML = `
          <p><strong>이메일:</strong> ${user.email}</p>
          <p><strong>이름:</strong> ${user.name}</p>
          <p><strong>생일:</strong> ${user.birth}</p>
          <p><strong>주소:</strong> ${user.address}</p>
          <p><strong>전화번호:</strong> ${user.phone}</p>
          <p><strong>역할:</strong> ${user.role}</p>
        `;
        errorMessage.textContent = ''; // 에러 메시지 지우기
      } else {
        errorMessage.textContent = '정보를 가져오는 데 실패했습니다: ' + data.result.resultMessage;
        userInfo.innerHTML = ''; // 사용자 정보 지우기
      }
    })
    .catch(error => {
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = '오류 발생: ' + error.message;
    });
  });
  