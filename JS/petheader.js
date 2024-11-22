// header.js

document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const myInfoBtn = document.getElementById('myInfoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const chatbotBtn = document.getElementById('chatbotBtn');
    console.log("acceesTOken", accessToken);
    console.log("btn", loginBtn);
    if (accessToken) {
        myInfoBtn.style.display = 'inline';
        logoutBtn.style.display = 'inline';
        chatbotBtn.style.display = 'inline';
    } else {
        loginBtn.style.display = 'inline';
        registerBtn.style.display = 'inline';
    }
  
    // 로그인 버튼 클릭 이벤트
    loginBtn.addEventListener('click', function () {
        window.location.href = 'user/login.html';
    });
  
    // 회원가입 버튼 클릭 이벤트
    registerBtn.addEventListener('click', function () {
        window.location.href = 'user/signup.html';
    });
  
    // 내 정보 버튼 클릭 이벤트
    myInfoBtn.addEventListener('click', function () {
        window.location.href = './petlist.html';
    });
  
    // 챗봇 버튼 클릭 이벤트
    chatbotBtn.addEventListener('click', function () {
      window.location.href = '../chatbot.html';
    });
  
    // 로그아웃 버튼 클릭 이벤트
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('accessToken');
        alert('로그아웃되었습니다.');
        window.location.reload();
    });
  });