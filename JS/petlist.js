document.addEventListener('DOMContentLoaded', async function() {
  const petListContainer = document.getElementById('pet-list');
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    petListContainer.innerHTML = `
      <div class="login-required">
        <p>로그인이 필요합니다. 먼저 로그인해 주세요.</p>
        <button id="login-btn" class="register-btn">로그인</button>
      </div>
    `;
    
    document.getElementById('login-btn').addEventListener('click', function() {
      window.location.href = '../user/login.html';
    });
    return;
  }

  try {
    const response = await fetch('http://114.70.216.57/pet/api/pet', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.result.resultCode === 200 && Array.isArray(data.body)) {
      petListContainer.innerHTML = '';

      data.body.forEach(pet => {
        const petItem = document.createElement('div');
        petItem.classList.add('pet-item');

        petItem.innerHTML = `
          <p><strong>이름:</strong> <a href="petDetail.html?petId=${pet.petId}" style="color: #6a1b9a; text-decoration: none;">${pet.name}</a></p>
          <p><strong>카테고리:</strong> ${pet.category}</p>
          ${pet.petImage ? `<img src="${pet.petImage.imageUrl}" alt="${pet.name} 이미지" width="150" style="border-radius: 50%;">` : ''}
          <button onclick="window.location.href='petDetail.html?petId=${pet.petId}'" class="detail-btn">상세보기</button>
        `;
        
        petListContainer.appendChild(petItem);
      });
    } else {
      petListContainer.innerHTML = '<p>반려동물 목록을 불러오는 데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('반려동물 목록 조회 중 오류 발생:', error);
    petListContainer.innerHTML = '<p>오류 발생: 반려동물 목록을 불러올 수 없습니다.</p>';
  }

  document.getElementById('register-pet-btn').addEventListener('click', function() {
    window.location.href = 'petRegistration.html';
  });
});
