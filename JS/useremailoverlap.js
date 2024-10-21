// 이름 중복 확인 요청
document.getElementById('check-name-btn').addEventListener('click', function() {
    const name = document.getElementById('name').value;
  
    const duplicationNameRequest = {
      result: {
        resultCode: 0,
        resultMessage: "string",
        resultDescription: "string"
      },
      body: {
        name: name
      }
    };
  
    fetch('https://example.com/open-api/user/duplication/name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicationNameRequest)
    })
    .then(response => response.json())
    .then(data => {
      const responseMessage = document.getElementById('response-message');
      if (data.result.resultCode === 200) {
        responseMessage.textContent = data.body.message;  // "사용 가능한 이름입니다."
      } else {
        responseMessage.textContent = '이름 중복 확인 실패: ' + data.result.resultMessage;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('response-message').textContent = '오류 발생: ' + error.message;
    });
  });
  