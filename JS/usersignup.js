document.getElementById('register-form').addEventListener('submit', function(event) {
  event.preventDefault();

  // 이메일 형식 확인
  const email = document.getElementById('email').value;
  const emailMessage = document.getElementById('email-response-message');
  if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    emailMessage.style.display = 'block';
    return;
  } else {
    emailMessage.style.display = 'none';
  }

  // 닉네임 중복 확인
  const nickname = document.getElementById('nickname').value;
  const nicknameMessage = document.getElementById('nickname-response-message');
  if (nickname === '홍길동') { // 예시: '홍길동'이 이미 사용 중인 닉네임이라고 가정
    nicknameMessage.style.display = 'block';
    return;
  } else {
    nicknameMessage.style.display = 'none';
  }

  // 비밀번호 확인
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const passwordMessage = document.getElementById('password-response-message');
  const confirmPasswordMessage = document.getElementById('confirm-password-response-message');

  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    passwordMessage.style.display = 'block';
    return;
  } else {
    passwordMessage.style.display = 'none';
  }

  if (password !== confirmPassword) {
    confirmPasswordMessage.style.display = 'block';
    return;
  } else {
    confirmPasswordMessage.style.display = 'none';
  }

  // 전화번호 확인
  const phone = document.getElementById('phone').value;
  const phoneMessage = document.getElementById('phone-response-message');
  if (!/^\d+$/.test(phone)) {
    phoneMessage.style.display = 'block';
    return;
  } else {
    phoneMessage.style.display = 'none';
  }

  // 생년월일 확인
  const birth = document.getElementById('birth').value;
  const birthMessage = document.getElementById('birth-response-message');
  if (!birth) {
    birthMessage.style.display = 'block';
    return;
  } else {
    birthMessage.style.display = 'none';
  }

  // 주소 확인
  const address = document.getElementById('address').value;
  const addressMessage = document.getElementById('address-response-message');
  if (!address) {
    addressMessage.style.display = 'block';
    return;
  } else {
    addressMessage.style.display = 'none';
  }

  // 회원가입 데이터 전송
  const data = {
    email: email,
    nickname: nickname,
    password: password,
    phone: phone,
    birth: birth,
    address: address
  };

  // fetch로 서버에 POST 요청 보내기
  fetch('http://your-backend-api/register', {  // 서버의 URL을 여기에 입력
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('회원가입이 성공적으로 완료되었습니다.');
      // 성공 시 처리할 로직 (예: 로그인 페이지로 이동)
    } else {
      alert('회원가입에 실패했습니다: ' + data.message);
      // 실패 시 처리할 로직
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('서버와 통신 중 오류가 발생했습니다.');
  });
});
