document.addEventListener('DOMContentLoaded', async function () {
  const accessToken = localStorage.getItem('accessToken');
  const petListDiv = document.getElementById('pet-list');
  const vaccinationListDiv = document.getElementById('vaccination-list');
  const apiUrl = 'http://114.70.216.57/pet/api';

  if (!accessToken) {
      petListDiv.innerHTML = '<p>로그인이 필요합니다. 다시 로그인해주세요.</p>';
      setTimeout(() => {
          window.location.href = '../user/login.html';
      }, 3000);
      return;
  }

  try {
      const petResponse = await fetch(`${apiUrl}/pet`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
          },
      });

      if (!petResponse.ok) {
          petListDiv.innerHTML = `<p>펫 목록을 불러오는 중 오류가 발생했습니다. 상태 코드: ${petResponse.status}</p>`;
          return;
      }

      const petData = await petResponse.json();
      console.log(petData)
      if (petData.result && petData.result.resultCode === 200 && petData.body.length > 0) {
          petListDiv.innerHTML = '<h2>펫 목록</h2>';
          petData.body.forEach(pet => {
              const petButton = document.createElement('button');
              petButton.textContent = pet.name;
              petButton.classList.add('pet-button');
              petButton.addEventListener('click', () => loadVaccinationDetails(pet.petId));
              petListDiv.appendChild(petButton);
          });
      } else {
          petListDiv.innerHTML = '<p>등록된 펫이 없습니다.</p>';
      }
  } catch (error) {
      console.error('펫 목록 불러오기 오류:', error);
      petListDiv.innerHTML = '<p>펫 목록을 불러오는 중 오류가 발생했습니다.</p>';
  }

  async function loadVaccinationDetails(petId) {
      vaccinationListDiv.innerHTML = '<p>예방접종 정보를 불러오는 중...</p>';
      console.log("petId 출력 : ", petId);
      try {
          const vaccinationResponse = await fetch(`${apiUrl}/vaccination/${petId}`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
              },
          });

          if (!vaccinationResponse.ok) {
              vaccinationListDiv.innerHTML = `<p>예방접종 정보가 없습니다. 상태 코드: ${vaccinationResponse.status}</p>`;
              return;
          }

          const vaccinationData = await vaccinationResponse.json();
          console.log("dasdfasdf", vaccinationData);
          if (vaccinationData.result && vaccinationData.result.resultCode === 200 && vaccinationData.body.length > 0) {
              vaccinationListDiv.innerHTML = '<h2>예방접종 정보</h2>';
              vaccinationData.body.forEach(record => {
                  const recordDiv = document.createElement('div');
                  recordDiv.classList.add('record');
                  recordDiv.innerHTML = `
                      <p><strong>접종 유형:</strong> ${record.type}</p>
                      <p><strong>접종 날짜:</strong> ${new Date(record.date).toLocaleDateString()}</p>
                      <p><strong>등록 일자:</strong> ${new Date(record.registeredAt).toLocaleDateString()}</p>
                      <button class="delete-button" data-id="${record.vaccinationRecordId}">삭제</button>
                  `;
                  vaccinationListDiv.appendChild(recordDiv);

                  recordDiv.querySelector('.delete-button').addEventListener('click', (event) => {
                      const id = event.target.getAttribute('data-id'); // 버튼의 data-id 속성 값 가져오기
                      deleteVaccination(id);
                  });
              });
          } else {
              vaccinationListDiv.innerHTML = '<p>등록된 예방접종 정보가 없습니다.</p>';
          }
      } catch (error) {
          console.error('예방접종 정보 불러오기 오류:', error);
          vaccinationListDiv.innerHTML = '<p>예방접종 정보를 불러오는 중 오류가 발생했습니다.</p>';
      }
  }

  async function deleteVaccination(vaccinationRecordId) {
      if (!confirm('정말로 삭제하시겠습니까?')) return;

      try {
          console.log("vaccination record : ", vaccinationRecordId);
          const deleteResponse = await fetch(`${apiUrl}/vaccination/${vaccinationRecordId}`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
              },
          });

          if (deleteResponse.ok) {
              alert('예방접종 정보가 성공적으로 삭제되었습니다.');
              window.location.reload(); // 페이지 새로고침
          } else {
              alert(`삭제에 실패했습니다. 상태 코드: ${deleteResponse.status}`);
          }
      } catch (error) {
          console.error('삭제 중 오류 발생:', error);
          alert('예방접종 정보를 삭제하는 중 오류가 발생했습니다.');
      }
  }
});
