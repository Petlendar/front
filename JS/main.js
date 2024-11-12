// 예방접종 유형 매핑 객체
const vaccinationTypes = {
  RABIES: "광견병",
  DHPPL: "혼합예방주사",
  CORONAVIRUS: "코로나 바이러스성 장염",
  KENNEL_COUGH: "기관, 기관지염"
};

// 접종 종류 매핑 객체
const doseTypes = {
  REINFORCEMENT: "보강접종",
  INITIAL: "기초접종",
  BOOSTER: "추가접종",
  BIRTHDAT: "생일"
};

document.addEventListener('DOMContentLoaded', async function () {
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  const accessToken = localStorage.getItem('accessToken');
  const petListContainer = document.getElementById('pet-list');
  let pets = []; // 반려동물 목록 저장용

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
  const chatbotBtn = document.getElementById('chatbotBtn');

  if (accessToken) {
      myInfoBtn.style.display = 'inline';
      logoutBtn.style.display = 'inline';
      chatbotBtn.style.display = 'inline'
      pets = await loadRegisteredPets();
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

  // 챗봇
  chatbotBtn.addEventListener('click', function () {
    window.location.href = './chatbot.html';
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
              const petList = data.body;

              petList.forEach(pet => {
                  const petWrapper = document.createElement('div');
                  petWrapper.classList.add('pet-wrapper');

                  const petImage = document.createElement('img');
                  petImage.src = pet.petImage ? pet.petImage.imageUrl : './images/default-image.webp';
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

              return petList;
          } else {
              petListContainer.innerHTML = '<p>반려동물 목록을 불러오는 데 실패했습니다.</p>';
              return [];
          }
      } catch (error) {
          console.error('반려동물 목록 오류:', error);
          petListContainer.innerHTML = '<p>반려동물 목록을 불러올 수 없습니다.</p>';
          return [];
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

          const dayEvents = vaccinationData.filter(record => record.day === day);

          if (dayEvents.length > 0) {
              dayCell.classList.add('highlight');
              dayCell.addEventListener('click', () => showDayEvents(day, dayEvents));
          }

          calendarDays.appendChild(dayCell);
      }
  }

  // 접종 데이터 가져오기 함수
  async function fetchVaccinationData(year, month) {
      try {
          const response = await fetch(`http://114.70.216.57/pet/api/calendar/${year}/${month}`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
              },
          });

          const data = await response.json();

          if (data.result.resultCode === 200 && Array.isArray(data.body)) {
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

  async function showDayEvents(day, events) {
      const infoArea = document.getElementById('vaccination-info');
      
      // info-area의 기존 내용을 지우고 새로 작성
      infoArea.innerHTML = ''; 
      
      // 해당 날짜의 제목
      const title = document.createElement('h3');
      title.textContent = `${day}일의 예방접종 정보`;
      infoArea.appendChild(title);
  
      // 이벤트가 있는 경우에만 처리
      if (events.length > 0) {
          events.forEach(event => {
              const pet = pets.find(p => p.petId === event.petId);
  
              // 각 이벤트에 대한 정보를 블록 형태로 추가
              const eventBlock = document.createElement('div');
              eventBlock.classList.add('event-block'); // 스타일을 위한 클래스 추가
  
              const petName = document.createElement('p');
              petName.textContent = `반려동물: ${pet ? pet.name : '알 수 없음'}`;
  
              const vaccinationType = document.createElement('p');
              vaccinationType.textContent = `유형: ${vaccinationTypes[event.vaccinationType] || event.vaccinationType}`;
  
              const doseType = document.createElement('p');
              doseType.textContent = `접종 종류: ${doseTypes[event.doseType] || event.doseType}`;
  
              // 각 항목을 블록에 추가
              eventBlock.appendChild(petName);
              eventBlock.appendChild(vaccinationType);
              eventBlock.appendChild(doseType);
  
              // 전체 eventBlock을 infoArea에 추가
              infoArea.appendChild(eventBlock);
          });
      } else {
          // 해당 날짜에 이벤트가 없으면 텍스트 추가
          const noEventsText = document.createElement('p');
          noEventsText.textContent = '해당 날짜에 예방접종 정보가 없습니다.';
          infoArea.appendChild(noEventsText);
      }
  }
});