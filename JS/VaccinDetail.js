document.addEventListener('DOMContentLoaded', async function () {
    const petId = new URLSearchParams(window.location.search).get('petId');
    const accessToken = localStorage.getItem('accessToken');
    const vaccinationList = document.getElementById('vaccination-list');
  
    if (!accessToken) {
      vaccinationList.innerHTML = '<p>로그인이 필요합니다.</p>';
      return;
    }
  
    try {
      const response = await fetch(`http://114.70.216.57/pet/api/vaccination/${petId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (data.result.resultCode === 200) {
        vaccinationList.innerHTML = '';
        data.body.forEach(record => {
          const recordDiv = document.createElement('div');
          recordDiv.classList.add('record');
          recordDiv.innerHTML = `
            <p>유형: ${record.type}</p>
            <p>날짜: ${new Date(record.date).toLocaleDateString()}</p>
          `;
          vaccinationList.appendChild(recordDiv);
        });
      } else {
        vaccinationList.innerHTML = '<p>기록을 불러올 수 없습니다.</p>';
      }
    } catch (error) {
      console.error('오류 발생:', error);
      vaccinationList.innerHTML = '<p>오류 발생: 기록을 불러올 수 없습니다.</p>';
    }
  });
  