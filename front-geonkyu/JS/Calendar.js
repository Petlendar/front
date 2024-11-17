export default class Calendar {
  constructor(containerId, apiUrl, accessToken) {
    this.container = document.getElementById(containerId);
    this.apiUrl = apiUrl;
    this.accessToken = accessToken;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
  }

  async init() {
    this.renderHeader();
    await this.loadCalendarData();
    this.addNavigationListeners();
  }

  renderHeader() {
    const header = document.createElement('div');
    header.id = 'calendar-header';

    const title = document.createElement('h2');
    title.id = 'calendar-title';
    title.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;

    const prevButton = document.createElement('button');
    prevButton.id = 'prevMonth';
    prevButton.textContent = '◀';

    const nextButton = document.createElement('button');
    nextButton.id = 'nextMonth';
    nextButton.textContent = '▶';

    header.appendChild(prevButton);
    header.appendChild(title);
    header.appendChild(nextButton);

    this.container.appendChild(header);

    const daysContainer = document.createElement('div');
    daysContainer.id = 'calendar-days';
    this.container.appendChild(daysContainer);
  }

  async loadCalendarData() {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '<p>달력을 불러오는 중...</p>';

    try {
      const response = await fetch(`${this.apiUrl}/${this.currentYear}/${this.currentMonth + 1}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        daysContainer.innerHTML = `<p>캘린더 데이터를 불러오는 중 오류 발생. 상태 코드: ${response.status}</p>`;
        return;
      }

      const data = await response.json();
      if (data.result.resultCode === 0 && data.body) {
        this.renderCalendar(data.body);
      } else {
        daysContainer.innerHTML = '<p>해당 월에 접종 정보가 없습니다.</p>';
      }
    } catch (error) {
      console.error('캘린더 데이터를 불러오는 중 오류 발생:', error);
      daysContainer.innerHTML = '<p>캘린더 데이터를 불러오는 중 오류 발생.</p>';
    }
  }

  renderCalendar(vaccinationData) {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = ''; // 기존 날짜 초기화

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('empty');
      daysContainer.appendChild(emptyCell);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('day');
      dayCell.textContent = day;

      // 접종 날짜 강조
      vaccinationData.forEach(record => {
        if (Math.abs(record.day - day) <= 3) {
          dayCell.classList.add('highlight');
        }
      });

      daysContainer.appendChild(dayCell);
    }
  }

  addNavigationListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
  }

  changeMonth(direction) {
    this.currentMonth += direction;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    document.getElementById('calendar-title').textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
    this.loadCalendarData();
  }

  getMonthName(monthIndex) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[monthIndex];
  }
}