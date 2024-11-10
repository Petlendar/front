document.addEventListener('DOMContentLoaded', async function () {
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  const accessToken = localStorage.getItem('accessToken');
  const petListContainer = document.getElementById('pet-list');

  // 캘린더 생성
  await createCalendar(currentYear, currentMonth);

  // 이전, 다음 월 버튼 클릭 이벤트
  document.getElementById('prevMonth').addEventListener('click', async function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    await createCalendar(currentYear, currentMonth);
  });

  document.getElementById('nextMonth').addEventListener('click', async function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    await createCalendar(currentYear, currentMonth);
  });

  // 로그인 상태 확인
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const myInfoBtn = document.getElementById('myInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (accessToken) {
    myInfoBtn.style.display = 'inline';
    logoutBtn.style.display = 'inline';
    loadRegisteredPets();
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
    window.location.href = 'pet/petlist.html';
  });

  // 로그아웃 버튼 클릭 이벤트
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('accessToken');
    alert('로그아웃되었습니다.');
    window.location.reload();
  });

  // 반려동물 이미지 로드 함수
  async function loadRegisteredPets() {
    try {
      const response = await fetch('http://114.70.216.57/pet/api/pet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.result.resultCode === 200 && Array.isArray(data.body)) {
        petListContainer.innerHTML = '';

        data.body.forEach(pet => {
          const petWrapper = document.createElement('div');
          petWrapper.classList.add('pet-wrapper');

          const petImage = document.createElement('img');
          petImage.src = pet.petImage ? pet.petImage.imageUrl : './images/defaultPetImage.jpg';
          petImage.alt = pet.name;
          petImage.width = 80;
          petImage.style.borderRadius = '50%';
          petImage.style.cursor = 'pointer';
          petImage.title = pet.name;

          petWrapper.appendChild(petImage);

          const petName = document.createElement('p');
          petName.textContent = pet.name;
          petWrapper.appendChild(petName);

          petListContainer.appendChild(petWrapper);
        });

        if (petListContainer.innerHTML === '') {
          petListContainer.innerHTML = '<p>등록된 반려동물이 없습니다.</p>';
        }
      } else {
        petListContainer.innerHTML = '<p>반려동물 목록을 불러오는 데 실패했습니다.</p>';
      }
    } catch (error) {
      console.error('반려동물 목록 오류:', error);
      petListContainer.innerHTML = '<p>반려동물 목록을 불러올 수 없습니다.</p>';
    }
  }

  // 캘린더 생성 함수
  async function createCalendar(year, month) {
    const calendarDays = document.getElementById('calendar-days');
    const calendarHeader = document.querySelector('#calendar-header h2');
    calendarDays.innerHTML = '';
    calendarHeader.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const vaccinationData = await fetchVaccinationData(year, month + 1);

    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('empty');
      calendarDays.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('day');
      dayCell.textContent = day;

      if (vaccinationData.some(record => record.day === day)) {
        dayCell.classList.add('highlight');
      }

      calendarDays.appendChild(dayCell);
    }
  }

  // 접종 데이터 가져오기 함수
  async function fetchVaccinationData(year, month) {
    try {
      const response = await fetch(`http://114.70.216.57/api/calendar/${year}/${month}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.result.resultCode === 0 && Array.isArray(data.body)) {
        return data.body;
      } else {
        console.error('접종 데이터 로드 실패:', data);
        return [];
      }
    } catch (error) {
      console.error('접종 데이터 오류:', error);
      return [];
    }
  }
});
