document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId');
    const petDetailContainer = document.querySelector('.detail-container');
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
          <div class="image-section">
            <img src="${pet.petImage ? pet.petImage.imageUrl : '../images/default-image.webp'}" alt="${pet.name}">
          </div>
          <div class="info-section">
            <h1>${pet.name}</h1>
            <p><strong>생일:</strong> ${pet.birth}</p>
            <p><strong>주소:</strong> ${pet.address}</p>
            <p><strong>카테고리:</strong> ${pet.category}</p>
            <p><strong>체중:</strong> ${pet.weight} kg</p>
          </div>
        `;
      } else {
        petDetailContainer.innerHTML = '<p>반려동물 상세 정보를 불러오는 데 실패했습니다.</p>';
      }
    } catch (error) {
      console.error('반려동물 상세 정보 조회 중 오류 발생:', error);
      petDetailContainer.innerHTML = '<p>오류 발생: 반려동물 상세 정보를 불러올 수 없습니다.</p>';
    }
  });
  