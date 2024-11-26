document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('petId');
  const petDetailContainer = document.getElementById('pet-detail');
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    petDetailContainer.innerHTML = '<p>로그인이 필요합니다. 먼저 로그인해 주세요.</p>';
    return;
  }

  if (!petId) {
    petDetailContainer.innerHTML = '<p>유효하지 않은 요청입니다. 반려동물 ID가 필요합니다.</p>';
    return;
  }

  try {
    const response = await fetch(`http://114.70.216.57/pet/api/pet/${petId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.result.resultCode === 200) {
      const pet = data.body;
      petDetailContainer.innerHTML = `
        <p><strong>이름:</strong> ${pet.name}</p>
        <p><strong>생일:</strong> ${pet.birth}</p>
        <p><strong>주소:</strong> ${pet.address}</p>
        <p><strong>카테고리:</strong> ${pet.category}</p>
        <p><strong>체중:</strong> ${pet.weight} kg</p>
        ${pet.petImage ? `<img src="${pet.petImage.imageUrl}" alt="${pet.name} 이미지">` : ''}
        <button id="modify-btn">수정</button>
        <button id="delete-btn">삭제</button>
      `;

      // 수정 버튼 이벤트
      document.getElementById('modify-btn').addEventListener('click', () => {
        window.location.href = `petModify.html?petId=${petId}`;
      });

      // 삭제 버튼 이벤트
      document.getElementById('delete-btn').addEventListener('click', async () => {
        if (confirm(`${pet.name}을(를) 정말 삭제하시겠습니까?`)) {
          try {
            const deleteResponse = await fetch(`http://114.70.216.57/pet/api/pet/unregister/${petId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            const deleteResult = await deleteResponse.json();

            if (deleteResult.result.resultCode === 200) {
              document.getElementById('response-message').textContent = '반려동물이 삭제되었습니다.';
              document.getElementById('response-message').style.color = 'green';
              document.getElementById('response-message').style.display = 'block';
              setTimeout(() => window.location.href = 'petlist.html', 1500);
            } else {
              document.getElementById('response-message').textContent = '삭제 실패: ' + deleteResult.result.resultMessage;
              document.getElementById('response-message').style.color = 'red';
              document.getElementById('response-message').style.display = 'block';
            }
          } catch (error) {
            console.error('삭제 중 오류 발생:', error);
          }
        }
      });
    } else {
      petDetailContainer.innerHTML = '<p>반려동물 상세 정보를 불러오는 데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('반려동물 상세 정보 조회 중 오류 발생:', error);
    petDetailContainer.innerHTML = '<p>오류 발생: 반려동물 상세 정보를 불러올 수 없습니다.</p>';
  }
});
