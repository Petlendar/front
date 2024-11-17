document.addEventListener('DOMContentLoaded', function() {
    // 로컬스토리지에서 등록된 반려동물 ID 목록 가져오기
    const petIds = JSON.parse(localStorage.getItem('petIds')) || [];
    const petIdList = document.getElementById('pet-ids');
  
    // 등록된 반려동물 ID 목록을 화면에 표시
    if (petIds.length > 0) {
      petIds.forEach(id => {
        const listItem = document.createElement('li');
        listItem.textContent = `반려동물 ID: ${id}`;
        petIdList.appendChild(listItem);
      });
    } else {
      const noPetMessage = document.createElement('p');
      noPetMessage.textContent = '등록된 반려동물이 없습니다.';
      petIdList.appendChild(noPetMessage);
    }
  
    // 반려동물 조회 버튼 클릭 이벤트
    document.getElementById('fetch-pet-btn').addEventListener('click', async function() {
      const petId = document.getElementById('petId').value;
  
      if (!petId) {
        document.getElementById('error-message').textContent = '반려동물 ID를 입력해 주세요.';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('pet-info').style.display = 'none';
        return;
      }
  
      const accessToken = localStorage.getItem('accessToken');
  
      if (!accessToken) {
        document.getElementById('error-message').textContent = '로그인이 필요합니다. 먼저 로그인해 주세요.';
        document.getElementById('error-message').style.display = 'block';
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
        const errorMessage = document.getElementById('error-message');
        const petInfo = document.getElementById('pet-info');
  
        if (data.result.resultCode === 200) {
          const pet = data.body;
          document.getElementById('pet-name').textContent = pet.name;
          document.getElementById('pet-birth').textContent = pet.birth;
          document.getElementById('pet-address').textContent = pet.address;
          document.getElementById('pet-category').textContent = pet.category;
          document.getElementById('pet-weight').textContent = pet.weight + ' kg';
  
          if (pet.petImage && pet.petImage.imageUrl) {
            document.getElementById('pet-image').src = pet.petImage.imageUrl;
            document.getElementById('pet-image').style.display = 'block';
          } else {
            document.getElementById('pet-image').style.display = 'none';
          }
  
          errorMessage.style.display = 'none';
          petInfo.style.display = 'block';
        } else {
          errorMessage.textContent = '반려동물 정보를 가져오는 데 실패했습니다: ' + data.result.resultMessage;
          errorMessage.style.display = 'block';
          petInfo.style.display = 'none';
        }
      } catch (error) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = '오류 발생: ' + error.message;
        errorMessage.style.display = 'block';
        document.getElementById('pet-info').style.display = 'none';
      }
    });
  });
  