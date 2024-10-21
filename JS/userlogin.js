document.getElementById('login-btn').addEventListener('click', function() {
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
  
    fetch('http://114.70.216.57/user/open-api/user/login', { // 백엔드 URL 수정 필요
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userLoginRequest)
    })
    .then(response => response.json())
    .then(data => {
      const responseMessage = document.getElementById('response-message');
      if (data.result.resultCode === 200) {
        const accessToken = data.body.accessToken;
        const refreshToken = data.body.refreshToken;
        const accessTokenExpiresAt = data.body.accessTokenExpiredAt;
        const refreshTokenExpiresAt = data.body.refreshTokenExpiredAt;
  
        responseMessage.innerHTML = `
          <p class="success">로그인 성공</p>
          <p>Access Token: ${accessToken}</p>
          <p>Access Token 만료: ${accessTokenExpiresAt}</p>
          <p>Refresh Token: ${refreshToken}</p>
          <p>Refresh Token 만료: ${refreshTokenExpiresAt}</p>
        `;
        responseMessage.classList.remove('error');
        responseMessage.classList.add('success');
      } else {
        responseMessage.textContent = '로그인 실패: ' + data.result.resultMessage;
        responseMessage.classList.remove('success');
        responseMessage.classList.add('error');
      }
    })
    .catch(error => {
      const responseMessage = document.getElementById('response-message');
      responseMessage.textContent = '오류 발생: ' + error.message;
      responseMessage.classList.remove('success');
      responseMessage.classList.add('error');
    });
  });
  