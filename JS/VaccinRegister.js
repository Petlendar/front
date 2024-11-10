document.addEventListener('DOMContentLoaded', async function () {
    const petSelect = document.getElementById('pet-select');
    const vaccinationForm = document.getElementById('vaccination-form');
    const accessToken = localStorage.getItem('accessToken');
    const responseMessage = document.getElementById('response-message');

    if (!accessToken) {
        alert('로그인이 필요합니다.');
        window.location.href = '../user/login.html';
        return;
    }

    // 반려동물 목록 불러오기
    try {
        const response = await fetch('http://114.70.216.57/pet/api/pet', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log('반려동물 목록 응답:', data); // 디버깅용 로그

        if (data.result && data.result.resultCode === 200 && Array.isArray(data.body)) {
            petSelect.innerHTML = '<option value="">반려동물을 선택하세요</option>'; // 초기화
            data.body.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.petId;
                option.textContent = pet.name;
                petSelect.appendChild(option);
            });
        } else {
            alert('반려동물 목록을 불러오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('반려동물 목록 불러오기 중 오류 발생:', error);
        alert('반려동물 목록을 불러오는 중 오류가 발생했습니다.');
    }

    // 예방접종 등록 처리
 // 예방접종 등록 처리
vaccinationForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const petId = petSelect.value;
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;

    if (!petId) {
        alert('반려동물을 선택하세요.');
        return;
    }

    const formattedDate = new Date(date).toISOString();

    const vaccinationData = {
        result: {
            resultCode: 0,
            resultMessage: 'string',
            resultDescription: 'string',
        },
        body: {
            petId: parseInt(petId),
            type: type,
            date: formattedDate,
        },
    };

    console.log('보낸 데이터:', JSON.stringify(vaccinationData, null, 2));

    try {
        const response = await fetch('http://114.70.216.57/pet/api/vaccination', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`, // 올바른 토큰 헤더
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vaccinationData),
        });

        const data = await response.json();

        console.log('예방접종 등록 응답:', data);

        // 응답 상태 검사
        if (response.status === 401) {
            alert('인증 실패: 로그인 정보를 확인하세요.');
            return;
        }

        if (data.result && data.result.resultCode === 0) {
            responseMessage.textContent = '예방접종 정보가 성공적으로 등록되었습니다!';
            responseMessage.style.color = 'green';
        } else {
            const errorMessage = data.result && data.result.resultMessage ? data.result.resultMessage : '알 수 없는 오류';
            responseMessage.textContent = `등록 실패: ${errorMessage}`;
            responseMessage.style.color = 'red';
        }
        responseMessage.style.display = 'block';
    } catch (error) {
        console.error('예방접종 등록 중 오류 발생:', error);
        responseMessage.textContent = '오류 발생: 예방접종 등록에 실패했습니다.';
        responseMessage.style.color = 'red';
        responseMessage.style.display = 'block';
    }
    });
});
