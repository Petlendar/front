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
  BIRTHDAY: "생일"
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

  if (accessToken) {
      pets = await loadRegisteredPets();
  } 
  
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
            petListContainer.innerHTML = ''; // 기존 목록 초기화
            const petList = data.body;

            petList.forEach(pet => {
                // 카드 스타일로 반려동물 표시
                const petCard = document.createElement('div');
                petCard.classList.add('pet-card');

                const petImage = document.createElement('img');
                petImage.src = pet.petImage ? pet.petImage.imageUrl : './images/default-image.webp';
                petImage.alt = pet.name;
                petImage.className = 'pet-image';
                petImage.style.cursor = 'pointer';

                // 이미지 클릭 시 해당 반려동물 상세 페이지로 이동
                petImage.addEventListener('click', () => {
                    window.location.href = `./pet/petDetail.html?petId=${pet.petId}`;

                });

                const petName = document.createElement('h3');
                petName.textContent = pet.name;

                const petCategory = document.createElement('p');
                petCategory.textContent = `카테고리: ${pet.category}`;

                petCard.appendChild(petImage);
                petCard.appendChild(petName);
                petCard.appendChild(petCategory);

                petListContainer.appendChild(petCard);
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
        const birthdayEvent = dayEvents.find(event => event.vaccinationType === 'BIRTHDAY');
        if (birthdayEvent) {
            const birthdayLabel = document.createElement('div');
            birthdayLabel.textContent = '생일';
            birthdayLabel.style.color = 'red'; // 생일 텍스트를 빨간색으로 표시
            birthdayLabel.style.fontWeight = 'bold';
            dayCell.appendChild(birthdayLabel);
        }

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

            // 예방접종 유형이 null인지 확인
            if (event.vaccinationType) {
                vaccinationType.textContent = `유형: ${vaccinationTypes[event.vaccinationType] || event.vaccinationType}`;
            } else {
                vaccinationType.textContent = "반려동물의 생일을 축하해 주세요!";
            }

            // 접종 종류가 생일이 아닌 경우만 추가
            if (event.doseType && doseTypes[event.doseType] !== "생일") {
                const doseType = document.createElement('p');
                doseType.textContent = `접종 종류: ${doseTypes[event.doseType] || event.doseType}`;
                eventBlock.appendChild(doseType); // 필요한 경우에만 추가
            }

            // 각 항목을 블록에 추가
            eventBlock.appendChild(petName);
            eventBlock.appendChild(vaccinationType);

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