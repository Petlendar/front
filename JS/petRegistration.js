document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('pet-register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const birth = document.getElementById('birth').value;
    const address = document.getElementById('address').value;
    const category = document.getElementById('category').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const imageFile = document.getElementById('image').files[0];

    const accessToken = localStorage.getItem('accessToken');

    console.log("yokrnds", accessToken);
    console.log("category", category);
    console.log("weight", weight);

    if (!accessToken) {
      document.getElementById('response-message').textContent = '로그인이 필요합니다. 먼저 로그인해 주세요.';
      document.getElementById('response-message').style.display = 'block';
      return;
    }

    let imageId = null;

    // 이미지 업로드가 있는 경우 처리
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('kind', 'PET');

      try {
        const imageUploadResponse = await fetch('http://114.70.216.57/image/api/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });

        const imageUploadData = await imageUploadResponse.json();

        if (imageUploadData.result.resultCode === 200) {
          imageId = imageUploadData.body.id; // 서버에서 반환된 imageId 사용
        } else {
          document.getElementById('response-message').textContent = '이미지 업로드 실패: ' + imageUploadData.result.resultMessage;
          document.getElementById('response-message').style.display = 'block';
          return;
        }
      } catch (error) {
        console.error('이미지 업로드 중 오류 발생:', error);
        document.getElementById('response-message').textContent = '이미지 업로드 중 오류가 발생했습니다.';
        document.getElementById('response-message').style.display = 'block';
        return;
      }
    }

    // 반려동물 등록 데이터
    const petRegistrationData = {
      result: {
        resultCode: 0,
        resultMessage: "string",
        resultDescription: "string"
      },
      body: {
        name: name,
        birth: birth,
        address: address,
        category: category,
        weight: weight,
        imageId: imageId || null
      }
    };

    console.log("반려동물 등록 데이터:", petRegistrationData); // 디버깅용 로그

    try {
      const response = await fetch('http://114.70.216.57/pet/api/pet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(petRegistrationData)
      });

      const data = await response.json();
      const responseMessage = document.getElementById('response-message');

      if (data.result.resultCode === 200) {
        const petId = data.body.petId;

        // 로컬스토리지에 반려동물 ID 목록 추가
        let petIds = JSON.parse(localStorage.getItem('petIds')) || [];
        petIds.push(petId);
        localStorage.setItem('petIds', JSON.stringify(petIds));

        responseMessage.textContent = '반려동물이 성공적으로 등록되었습니다!';
        responseMessage.style.color = 'green';
        responseMessage.style.display = 'block';
      } else {
        responseMessage.textContent = '반려동물 등록 실패: ' + data.result.resultMessage;
        responseMessage.style.color = 'red';
        responseMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('반려동물 등록 중 오류 발생:', error);
      const responseMessage = document.getElementById('response-message');
      responseMessage.textContent = '오류 발생: ' + error.message;
      responseMessage.style.color = 'red';
      responseMessage.style.display = 'block';
    }
  });
});
