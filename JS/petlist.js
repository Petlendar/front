document.addEventListener('DOMContentLoaded', async () => {
  const petListContainer = document.getElementById('pet-list');
  const registerPetBtn = document.getElementById('register-pet-btn');


  // 로그인 여부 확인
  function checkLogin() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      window.location.href = '../index.html'; // 로그인 페이지로 리디렉션
    }
  }

  // Fetch and display pet list
  async function loadPets() {
    try {
      const response = await fetch('http://114.70.216.57/pet/api/pet', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.result.resultCode === 200) {
        displayPets(data.body);
      } else {
        petListContainer.innerHTML = '<p>반려동물을 불러오는 데 실패했습니다.</p>';
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      petListContainer.innerHTML = '<p>반려동물을 불러오는 중 오류가 발생했습니다.</p>';
    }
  }

  // Display pets in cards
  function displayPets(pets) {
    petListContainer.innerHTML = ''; // 기존 목록 초기화
    pets.forEach((pet) => {
      const petCard = document.createElement('div');
      petCard.className = 'pet-card';

      const petImage = document.createElement('img');
      petImage.src = pet.petImage ? pet.petImage.imageUrl : '../images/default-image.webp';
      petImage.alt = pet.name;
      petImage.className = 'pet-image';

      const petName = document.createElement('h3');
      petName.textContent = pet.name;

      const petCategory = document.createElement('p');
      petCategory.textContent = `카테고리: ${pet.category}`;

      const detailBtn = document.createElement('button');
      detailBtn.className = 'detail-btn';
      detailBtn.textContent = '상세보기';

      // 상세보기 버튼 이벤트 리스너
      detailBtn.addEventListener('click', () => {
        window.location.href = `./petDetail.html?petId=${pet.petId}`;
      });

      petCard.appendChild(petImage);
      petCard.appendChild(petName);
      petCard.appendChild(petCategory);
      petCard.appendChild(detailBtn);

      petListContainer.appendChild(petCard);
    });
  }

  // Redirect to pet registration page
  registerPetBtn.addEventListener('click', () => {
    window.location.href = './PetRegistration.html';
  });

  // 로그인 여부 확인
  checkLogin();

  // Load pets on page load
  await loadPets();
});
