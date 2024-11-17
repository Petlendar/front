document.getElementById('fetch-pet-list-btn').addEventListener('click', async function() {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = '로그인이 필요합니다. 먼저 로그인해 주세요.';
      errorMessage.style.display = 'block';
      return;
    }
  
    try {
      // 반려동물 목록 조회 요청
      const response = await fetch('http://114.70.216.57/pet/api/pet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const errorMessage = document.getElementById('error-message');
      const petListContainer = document.getElementById('pet-list');
  
      console.log("응답 데이터:", data);
  
      if (data.result.resultCode === 200 && Array.isArray(data.body)) {
        petListContainer.innerHTML = ''; // 기존 목록 초기화
        const pets = data.body;
  
        if (pets.length === 0) {
          petListContainer.innerHTML = '<p>등록된 반려동물이 없습니다.</p>';
        } else {
          // 각 반려동물의 모든 정보를 화면에 표시
          pets.forEach(pet => {
            const petItem = document.createElement('div');
            petItem.classList.add('pet-item');
  
            const petImage = document.createElement('img');
            petImage.src = pet.petImage ? pet.petImage.imageUrl : 'default-image.png';
            petImage.alt = pet.name;
            petImage.style.display = pet.petImage ? 'block' : 'none';
  
            const petInfo = document.createElement('div');
            petInfo.classList.add('pet-info');
  
            // 반려동물 정보 표시
            petInfo.innerHTML += `<p><strong>이름:</strong> ${pet.name}</p>`;
            if (pet.birth) petInfo.innerHTML += `<p><strong>생일:</strong> ${pet.birth}</p>`;
            if (pet.address) petInfo.innerHTML += `<p><strong>주소:</strong> ${pet.address}</p>`;
            petInfo.innerHTML += `<p><strong>카테고리:</strong> ${pet.category}</p>`;
            if (pet.weight) petInfo.innerHTML += `<p><strong>체중:</strong> ${pet.weight} kg</p>`;
  
            petItem.appendChild(petImage);
            petItem.appendChild(petInfo);
            petListContainer.appendChild(petItem);
          });
        }
  
        errorMessage.style.display = 'none';
      } else {
        errorMessage.textContent = '반려동물 목록 조회 실패: ' + data.result.resultMessage;
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('반려동물 목록 조회 중 오류 발생:', error);
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = '오류 발생: ' + error.message;
      errorMessage.style.display = 'block';
    }
  });
  