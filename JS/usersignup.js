// 우편번호 검색 버튼 클릭 이벤트
document.getElementById('search-postal-btn').addEventListener('click', function() {
  new daum.Postcode({
    oncomplete: function(data) {
      document.getElementById('postal-code').value = data.zonecode;
      document.getElementById('address').value = data.address;
      document.getElementById('detailed-address').focus();
    }
  }).open();
});

// 이메일 중복 확인 버튼 이벤트
document.getElementById('check-email-btn').addEventListener('click', async function () {
  const email = document.getElementById('email').value;
  if (!email) {
    alert('이메일을 입력해 주세요.');
    return;
  }

  const isAvailable = await checkDuplication('email', email);
  displayMessage('email-response-message', isAvailable, '사용 가능한 이메일입니다.', '이미 사용 중인 이메일입니다.');
});

// 닉네임 중복 확인 버튼 이벤트
document.getElementById('check-nickname-btn').addEventListener('click', async function () {
  const name = document.getElementById('nickname').value;
  if (!name) {
    alert('닉네임을 입력해 주세요.');
    return;
  }

  const isAvailable = await checkDuplication('name', name);
  displayMessage('nickname-response-message', isAvailable, '사용 가능한 닉네임입니다.', '이미 사용 중인 닉네임입니다.');
});

// 중복 확인 요청 함수
async function checkDuplication(type, value) {
  const url = `http://114.70.216.57/user/open-api/user/duplication/${type}`;
  const requestBody = {
    result: {
      resultCode: 0,
      resultMessage: "string",
      resultDescription: "string"
    },
    body: {
      name: value
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (result && result.result && result.result.resultCode === 200) {
      return true; // 중복되지 않음
    } else {
      return false; // 중복됨 또는 에러 응답
    }
  } catch (error) {
    console.error(`${type} 중복 확인 중 오류 발생:`, error);
    alert('서버와 통신 중 오류가 발생했습니다.');
    return false;
  }
}

// 메시지 표시 함수
function displayMessage(elementId, isSuccess, successMessage, failureMessage) {
  const messageElement = document.getElementById(elementId);
  messageElement.style.display = 'block';
  messageElement.textContent = isSuccess ? successMessage : failureMessage;
}

// 비밀번호와 비밀번호 확인 일치 여부 검사
function validatePasswords() {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const passwordMessage = document.getElementById('password-response-message');

  if (password !== confirmPassword) {
    passwordMessage.style.display = 'block';
    passwordMessage.textContent = '비밀번호가 일치하지 않습니다.';
    return false;
  } else {
    passwordMessage.style.display = 'none';
    return true;
  }
}

// 생년월일 입력 형식 유효성 검사
function validateBirthdate() {
  const birthdateInput = document.getElementById('birth');
  const birthdateMessage = document.getElementById('birth-response-message');
  const birthdatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!birthdatePattern.test(birthdateInput.value)) {
    birthdateMessage.style.display = 'block';
    birthdateMessage.textContent = '생년월일을 YYYY-MM-DD 형식으로 입력해 주세요.';
    return false;
  } else {
    birthdateMessage.style.display = 'none';
    return true;
  }
}

// 우편번호 입력 유효성 검사
function validatePostalCode() {
  const postalCodeInput = document.getElementById('postal-code');
  const postalCodeMessage = document.getElementById('postal-code-message');
  const postalCodePattern = /^\d{5}$/;

  if (!postalCodePattern.test(postalCodeInput.value)) {
    postalCodeMessage.style.display = 'block';
    postalCodeMessage.textContent = '우편번호를 5자리 숫자로 입력해 주세요.';
    return false;
  } else {
    postalCodeMessage.style.display = 'none';
    return true;
  }
}

// 비밀번호 표시/숨기기 기능
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
togglePasswordButtons.forEach((button) => {
  button.addEventListener('click', function () {
    const input = this.previousElementSibling;
    const inputType = input.getAttribute('type');
    input.setAttribute('type', inputType === 'password' ? 'text' : 'password');
    this.textContent = inputType === 'password' ? '🙈' : '👁';
  });
});

// 회원가입 폼 제출 이벤트
document.getElementById('register-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!validatePasswords() || !validateBirthdate() || !validatePostalCode()) {
    return;
  }

  // 입력 필드에서 데이터 가져오기
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('nickname').value;
  const birth = document.getElementById('birth').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  // 요청 데이터 구조화
  const userRegistrationRequest = {
    result: {
      resultCode: 0,
      resultMessage: "string",
      resultDescription: "string"
    },
    body: {
      email: email,
      password: password,
      name: name,
      birth: birth,
      address: address,
      phone: phone
    }
  };

  try {
    // 회원가입 요청
    const response = await fetch('http://114.70.216.57/user/open-api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userRegistrationRequest)
    });

    const data = await response.json();
    const responseMessage = document.getElementById('response-message');
    if (data.result.resultCode === 200) {
      alert('회원가입이 완료되었습니다.');
      // 회원가입 성공 시 로그인 페이지로 이동
      window.location.href = 'login.html';
    } else {
      responseMessage.textContent = '회원가입 실패: ' + data.result.resultMessage;
      responseMessage.classList.add('error');
    }
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    const responseMessage = document.getElementById('response-message');
    responseMessage.textContent = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
    responseMessage.classList.add('error');
  }
});
