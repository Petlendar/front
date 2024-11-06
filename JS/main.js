document.addEventListener('DOMContentLoaded', async function () {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // 캘린더 생성
  createCalendar(currentYear, currentMonth);

  // 이전, 다음 월 버튼 클릭 이벤트
  document.getElementById('prevMonth').addEventListener('click', function () {
      changeMonth(-1);
  });

  document.getElementById('nextMonth').addEventListener('click', function () {
      changeMonth(1);
  });

  // 로그인 상태 확인
  const accessToken = localStorage.getItem('accessToken');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const myInfoBtn = document.getElementById('myInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const petListContainer = document.getElementById('pet-list'); // 반려동물 리스트 컨테이너

  if (accessToken) {
      // 로그인 상태라면 내 정보와 로그아웃 버튼 표시
      myInfoBtn.style.display = 'inline';
      logoutBtn.style.display = 'inline';
      loadRegisteredPets(); // 반려동물 이미지 로드
  } else {
      // 로그인 상태가 아니라면 로그인과 회원가입 버튼 표시
      loginBtn.style.display = 'inline';
      registerBtn.style.display = 'inline';
  }

  // 로그인 버튼 클릭 시 로그인 페이지로 이동
  loginBtn.addEventListener('click', function () {
      window.location.href = 'user/login.html';
  });

  // 회원가입 버튼 클릭 시 회원가입 페이지로 이동
  registerBtn.addEventListener('click', function () {
      window.location.href = 'user/signup.html';
  });

  // 내 정보 버튼 클릭 시 petlist 페이지로 이동
  myInfoBtn.addEventListener('click', function () {
      window.location.href = 'pet/petlist.html';
  });

  // 로그아웃 버튼 클릭 시 로그아웃 처리
  logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('accessToken'); // 토큰 삭제
      alert('로그아웃되었습니다.');
      window.location.reload(); // 페이지 새로고침
  });

  // 반려동물 이미지 로드 함수
  async function loadRegisteredPets() {
      try {
          const response = await fetch('http://114.70.216.57/pet/api/pet', {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
              }
          });

          const data = await response.json();

          if (data.result.resultCode === 200 && Array.isArray(data.body)) {
              petListContainer.innerHTML = ''; // 기존 이미지 초기화

              data.body.forEach(pet => {
                  const petWrapper = document.createElement('div');
                  petWrapper.classList.add('pet-wrapper');

                  const petImage = document.createElement('img');
                  petImage.src = pet.petImage ? pet.petImage.imageUrl : 'defaultPetImage.jpg';
                  petImage.alt = pet.name;
                  petImage.width = 80;
                  petImage.style.borderRadius = '50%';
                  petImage.style.cursor = 'pointer';
                  petImage.title = pet.name;

                  // 이미지 클릭 시 해당 반려동물의 상세 정보로 이동
                  petImage.addEventListener('click', function () {
                      window.location.href = `pet/petDetail.html?petId=${pet.petId}`;
                  });

                  const petName = document.createElement('p');
                  petName.textContent = pet.name;
                  petName.style.textAlign = 'center';
                  petName.style.marginTop = '8px';
                  petName.style.fontWeight = 'bold';

                  petWrapper.appendChild(petImage);
                  petWrapper.appendChild(petName);
                  petListContainer.appendChild(petWrapper);
              });

              // 반려동물 이미지가 없는 경우 메시지 표시
              if (petListContainer.innerHTML === '') {
                  petListContainer.innerHTML = '<p>등록된 반려동물이 없습니다.</p>';
              }
          } else {
              petListContainer.innerHTML = '<p>반려동물 목록을 불러오는 데 실패했습니다.</p>';
          }
      } catch (error) {
          console.error('반려동물 목록 불러오기 중 오류 발생:', error);
          petListContainer.innerHTML = '<p>반려동물 목록을 불러올 수 없습니다.</p>';
      }
  }
});

// 캘린더 생성 함수
function createCalendar(year, month) {
  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = ''; // 기존 날짜 초기화

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 빈 칸 추가
  for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('empty');
      calendarDays.appendChild(emptyCell);
  }

  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('day');
      dayCell.textContent = day;
      calendarDays.appendChild(dayCell);
  }
}

// 월 변경 함수
function changeMonth(direction) {
  let year = currentYear;
  let month = currentMonth;

  month += direction;

  if (month < 0) {
      month = 11;
      year--;
  } else if (month > 11) {
      month = 0;
      year++;
  }

  currentYear = year;
  currentMonth = month;

  createCalendar(currentYear, currentMonth);
}
