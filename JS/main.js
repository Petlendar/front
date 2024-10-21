document.addEventListener('DOMContentLoaded', function () {
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

    // 로그인 버튼 클릭 시 로그인 페이지로 이동
    document.getElementById('loginBtn').addEventListener('click', function () {
        window.location.href = 'user/login.html';
    });

    // 회원가입 버튼 클릭 시 회원가입 페이지로 이동
    document.getElementById('registerBtn').addEventListener('click', function () {
        window.location.href = 'user/signup.html';
    });
    // resiger hospital 버튼 클릭시 병원 등록 페이지로 이동
    document.getElementById('registerHospital').addEventListener('click', function () {
        window.location.href = 'hospitalRegister.html';
    });
});

// 캘린더 생성 함수
function createCalendar(year, month) {
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = ''; // 기존 날짜 지우기

    const firstDay = new Date(year, month, 1).getDay(); // 첫 번째 날의 요일
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 총 일 수

    // 빈 칸 추가 (첫 번째 날 이전의 요일만큼)
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
