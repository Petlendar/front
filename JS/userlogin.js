document.getElementById('login-btn').addEventListener('click', async function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const userLoginRequest = {
    result: {
      resultCode: 0,
      resultMessage: "string",
      resultDescription: "string"
    },
    body: {
      email: email,
      password: password
    }
  };

  try {
    const response = await fetch('http://114.70.216.57/user/open-api/user/login', { // 실제 백엔드 URL 확인 필요
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userLoginRequest)
    });

    const data = await response.json();
    const responseMessage = document.getElementById('response-message');

    if (data.result.resultCode === 200) {
      const accessToken = data.body.accessToken;
      const refreshToken = data.body.refreshToken;
      const accessTokenExpiresAt = new Date(data.body.accessTokenExpiredAt).getTime();
      const refreshTokenExpiresAt = new Date(data.body.refreshTokenExpiredAt).getTime();

      // 토큰과 만료 시간 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessTokenExpiresAt', accessTokenExpiresAt);
      localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt);

      // 사용자에게 로그인 성공 메시지 표시
      responseMessage.innerHTML = `<p class="success">로그인 성공</p>`;
      responseMessage.classList.remove('error');
      responseMessage.classList.add('success');

      // 로그인 성공 시, 쿼리 파라미터에서 리다이렉트 URL 읽기
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/'; // 리다이렉트 URL이 없으면 기본경로로 이동

       // 리다이렉트 URL로 이동
       window.location.href = redirectUrl;

    } else {
      responseMessage.textContent = '로그인 실패: ' + data.result.resultMessage;
      responseMessage.classList.remove('success');
      responseMessage.classList.add('error');
    }
  } catch (error) {
    const responseMessage = document.getElementById('response-message');
    responseMessage.textContent = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
    responseMessage.classList.remove('success');
    responseMessage.classList.add('error');
  }
});