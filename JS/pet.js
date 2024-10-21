// 반려동물 정보 조회
async function getPetInfo() {
    const petId = document.getElementById('petId').value;
    const resultDiv = document.getElementById('result');
    const petDetails = document.getElementById('petDetails');
    resultDiv.innerHTML = ''; // 초기화
    petDetails.style.display = 'none'; // 수정, 삭제 폼 숨기기

    if (!petId) {
        resultDiv.innerHTML = '<p class="error">반려동물 ID를 입력해 주세요.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/pets/${petId}`);
        const data = await response.json();

        if (data.result.resultCode === 200) {
            const pet = data.body;
            resultDiv.innerHTML = `<p class="success">반려동물을 찾았습니다.</p>`;
            petDetails.style.display = 'block'; // 조회 성공 시 수정, 삭제 폼 보이기

            // 폼에 조회한 정보 표시
            document.getElementById('petName').value = pet.name;
            document.getElementById('petBirth').value = pet.birth;
            document.getElementById('petAddress').value = pet.address;
            document.getElementById('petCategory').value = pet.category;
            document.getElementById('petWeight').value = pet.weight;
        } else {
            resultDiv.innerHTML = '<p class="error">해당 반려동물을 찾을 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('Error fetching pet information:', error);
        resultDiv.innerHTML = '<p class="error">서버 오류가 발생했습니다.</p>';
    }
}

// 반려동물 정보 수정
async function updatePetInfo() {
    const petId = document.getElementById('petId').value;
    const petName = document.getElementById('petName').value;
    const petBirth = document.getElementById('petBirth').value;
    const petAddress = document.getElementById('petAddress').value;
    const petCategory = document.getElementById('petCategory').value;
    const petWeight = document.getElementById('petWeight').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch(`http://localhost:8080/pets/${petId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: petName,
                birth: petBirth,
                address: petAddress,
                category: petCategory,
                weight: petWeight
            })
        });

        const data = await response.json();
        if (data.result.resultCode === 200) {
            resultDiv.innerHTML = '<p class="success">반려동물 정보가 수정되었습니다.</p>';
        } else {
            resultDiv.innerHTML = '<p class="error">수정에 실패했습니다.</p>';
        }
    } catch (error) {
        console.error('Error updating pet information:', error);
        resultDiv.innerHTML = '<p class="error">서버 오류가 발생했습니다.</p>';
    }
}

// 반려동물 삭제
async function deletePet() {
    const petId = document.getElementById('petId').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch(`http://localhost:8080/pets/${petId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.result.resultCode === 200) {
            resultDiv.innerHTML = '<p class="success">반려동물이 삭제되었습니다.</p>';
            document.getElementById('petDetails').style.display = 'none'; // 삭제 시 폼 숨기기
        } else {
            resultDiv.innerHTML = '<p class="error">삭제에 실패했습니다.</p>';
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        resultDiv.innerHTML = '<p class="error">서버 오류가 발생했습니다.</p>';
    }
}
