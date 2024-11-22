// 우편번호 검색 버튼 클릭 이벤트
const postalBtn = document.getElementById('search-postal-btn');
if (postalBtn) {
  postalBtn.addEventListener('click', function () {
    new daum.Postcode({
      oncomplete: function (data) {
        document.getElementById('postal-code').value = data.zonecode;
        document.getElementById('address').value = data.address;
        document.getElementById('detailed-address').focus();
      }
    }).open();
  });
}

// 이메일 중복 확인 버튼 이벤트
const emailCheckBtn = document.getElementById('check-email-btn');
if (emailCheckBtn) {
  emailCheckBtn.addEventListener('click', async function () {
    const email = document.getElementById('email').value;
    if (!email) {
      alert('이메일을 입력해 주세요.');
      return;
    }

    const isAvailable = await checkDuplication('email', email);
    displayMessage('email-response-message', isAvailable, '사용 가능한 이메일입니다.', '이미 사용 중인 이메일입니다.');
  });
}

// 닉네임 중복 확인 버튼 이벤트
const nicknameCheckBtn = document.getElementById('check-nickname-btn');
if (nicknameCheckBtn) {
  nicknameCheckBtn.addEventListener('click', async function () {
    const name = document.getElementById('nickname').value;
    if (!name) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    const isAvailable = await checkDuplication('name', name);
    displayMessage('nickname-response-message', isAvailable, '사용 가능한 닉네임입니다.', '이미 사용 중인 닉네임입니다.');
  });
}

// 중복 확인 요청 함수
async function checkDuplication(type, value) {
  const url = `http://114.70.216.57/user/open-api/user/duplication/${type}`;
  const requestBody = {
    result: {
      resultCode: 0,
      resultMessage: "요청 성공",
      resultDescription: "중복 확인 요청"
    },
    body: type === 'email' ? { email: value } : { name: value }
  };

  const accessToken = localStorage.getItem('accessToken'); // accessToken이 localStorage에 저장되어 있다고 가정합니다.

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // 인증이 필요한 경우 인증 헤더 추가
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log("중복 확인 응답 데이터:", result);

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
  if (messageElement) {
    messageElement.style.display = 'block';
    messageElement.textContent = isSuccess ? successMessage : failureMessage;
  } else {
    console.error(`요소 ID '${elementId}'를 찾을 수 없습니다.`);
  }
}

// 비밀번호와 비밀번호 확인 일치 여부 검사
function validatePasswords() {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const passwordMessage = document.getElementById('password-response-message');

  if (password !== confirmPassword) {
    if (passwordMessage) {
      passwordMessage.style.display = 'block';
      passwordMessage.textContent = '비밀번호가 일치하지 않습니다.';
    }
    return false;
  } else {
    if (passwordMessage) {
      passwordMessage.style.display = 'none';
    }
    return true;
  }
}

// 생년월일 입력 형식 유효성 검사
function validateBirthdate() {
  const birthdateInput = document.getElementById('birth');
  const birthdateMessage = document.getElementById('birth-response-message');
  const birthdatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!birthdatePattern.test(birthdateInput.value)) {
    if (birthdateMessage) {
      birthdateMessage.style.display = 'block';
      birthdateMessage.textContent = '생년월일을 YYYY-MM-DD 형식으로 입력해 주세요.';
    }
    return false;
  } else {
    if (birthdateMessage) {
      birthdateMessage.style.display = 'none';
    }
    return true;
  }
}

// 우편번호 입력 유효성 검사
function validatePostalCode() {
  const postalCodeInput = document.getElementById('postal-code');
  const postalCodeMessage = document.getElementById('postal-code-message');
  const postalCodePattern = /^\d{5}$/;

  if (!postalCodePattern.test(postalCodeInput.value)) {
    if (postalCodeMessage) {
      postalCodeMessage.style.display = 'block';
      postalCodeMessage.textContent = '우편번호를 5자리 숫자로 입력해 주세요.';
    }
    return false;
  } else {
    if (postalCodeMessage) {
      postalCodeMessage.style.display = 'none';
    }
    return true;
  }
}

// 입력값 유효성 검사
function validateInputs() {
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  if (!email || !phone) {
    alert("모든 필드를 입력해 주세요.");
    return false;
  }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    alert("올바른 이메일 형식을 입력해 주세요.");
    return false;
  }

  const phonePattern = /^010-\d{4}-\d{4}$/;
  if (!phonePattern.test(phone)) {
    alert("휴대폰 번호는 '010-xxxx-xxxx' 형식이어야 합니다.");
    return false;
  }

  return true;
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

  if (!validatePasswords() || !validateBirthdate() || !validatePostalCode() || !validateInputs()) {
    return;
  }

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('nickname').value;
  const birth = document.getElementById('birth').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  const userRegistrationRequest = {
    result: {
      resultCode: 0,
      resultMessage: "요청 성공",
      resultDescription: "회원가입 요청 전송"
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

  console.log("회원가입 요청 데이터:", JSON.stringify(userRegistrationRequest));

  try {
    const response = await fetch('http://114.70.216.57/user/open-api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userRegistrationRequest)
    });

    const data = await response.json();
    console.log("서버 응답 데이터:", data);
    const responseMessage = document.getElementById('response-message');
    if (response.ok && data.result.resultCode === 200) {
      alert(data.body.message); // 성공 메시지 출력
      window.location.href = 'login.html'; // 로그인 페이지로 이동
    } else {
      if (responseMessage) {
        let errorMessage = `회원가입 실패: ${data.result.resultMessage}`;
        if (data.result.resultDescription) {
          errorMessage += ` (${data.result.resultDescription})`;
        }
        responseMessage.textContent = errorMessage;
        responseMessage.style.display = 'block';
        responseMessage.classList.add('error');
      }
    }
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    const responseMessage = document.getElementById('response-message');
    if (responseMessage) {
      responseMessage.textContent = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      responseMessage.style.display = 'block';
      responseMessage.classList.add('error');
    }
  }
});