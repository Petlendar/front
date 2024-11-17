document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('petId');
  const accessToken = localStorage.getItem('accessToken');
  const form = document.getElementById('pet-modify-form');
  const responseMessage = document.getElementById('response-message');

  // 초기 값 불러오기
  try {
    const response = await fetch(`http://114.70.216.57/pet/api/pet/${petId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    if (data.result.resultCode === 200) {
      const pet = data.body;
      document.getElementById('name').value = pet.name;
      document.getElementById('birth').value = pet.birth;
      document.getElementById('address').value = pet.address;
      document.getElementById('category').value = pet.category;
      document.getElementById('weight').value = pet.weight;
    }
  } catch (error) {
    console.error('기존 데이터 불러오기 오류:', error);
  }

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const birth = document.getElementById('birth').value;
    const address = document.getElementById('address').value;
    const category = document.getElementById('category').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const imageFile = document.getElementById('image').files[0];

    let imageId = null;

    // 이미지가 있는 경우 업로드
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('kind', 'PET');

      try {
        const imageUploadResponse = await fetch('http://114.70.216.57/image/api/image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: formData
        });

        const imageUploadData = await imageUploadResponse.json();
        if (imageUploadData.result.resultCode === 200) {
          imageId = imageUploadData.body.id;
        }
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        return;
      }
    }

    // 수정 요청
    const updateData = {
      result: { resultCode: 0, resultMessage: "string", resultDescription: "string" },
      body: { petId: parseInt(petId), name, birth, address, category, weight, imageId }
    };

    try {
      const updateResponse = await fetch('http://114.70.216.57/pet/api/pet/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      if (updateResult.result.resultCode === 200) {
        responseMessage.textContent = '수정 완료!';
        responseMessage.style.color = 'green';
        responseMessage.style.display = 'block';
        setTimeout(() => window.location.href = `petDetail.html?petId=${petId}`, 1500);
      }
    } catch (error) {
      console.error('수정 오류:', error);
    }
  });
});
