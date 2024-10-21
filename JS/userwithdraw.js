document.getElementById('withdraw-btn').addEventListener('click', function() {
    const accessToken = 'your_access_token_here'; // 실제 액세스 토큰으로 교체해야 함
    const userEmail = 'user@example.com'; // 실제 사용자의 이메일로 교체해야 함
  
    fetch(`https://example.com/open-api/user/unregister`, { // 실제 백엔드 URL로 수정 필요
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Bearer 토큰 추가
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail }) // 사용자 이메일을 포함한 요청 본문
    })
    .then(response => response.json())
    .then(data => {
      const messageElement = document.getElementById('message');
      const errorElement = document.getElementById('error-message');
  
      if (data.result.resultCode === 200) {
        messageElement.textContent = data.body.message; // 성공 메시지
        errorElement.textContent = ''; // 에러 메시지 지우기
      } else {
        errorElement.textContent = '탈퇴 실패: ' + data.result.resultMessage;
        messageElement.textContent = ''; // 메시지 지우기
      }
    })
    .catch(error => {
      const errorElement = document.getElementById('error-message');
      errorElement.textContent = '오류 발생: ' + error.message;
    });
  });
  