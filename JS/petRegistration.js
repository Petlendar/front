document.getElementById('petRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // 기본 제출 동작 방지

    // Form fields
    const name = document.getElementById('name').value;
    const birth = document.getElementById('birth').value;
    const species = document.getElementById('species').value;
    const weight = document.getElementById('weight').value;
    const vaccineType = document.getElementById('vaccineType').value;
    const otherVaccineType = document.getElementById('otherVaccineType').value;
    const vaccineDate = document.getElementById('vaccineDate').value;
    const address = document.getElementById('address').value;
    const detailAddress = document.getElementById('detailAddress').value;

    // Validation (sample)
    let valid = true;
    const fields = ['name', 'birth', 'species', 'weight', 'vaccineType', 'vaccineDate', 'address'];
    fields.forEach(field => {
        const fieldElement = document.getElementById(field);
        const errorElement = document.getElementById(`${field}-error`);
        if (!fieldElement.value) {
            errorElement.style.display = 'block';
            valid = false;
        } else {
            errorElement.style.display = 'none';
        }
    });

    if (!valid) {
        return; // Stop submission if any field is invalid
    }

    // Handle "Other" vaccine type
    let finalVaccineType = vaccineType;
    if (vaccineType === "OTHER") {
        finalVaccineType = otherVaccineType; // Use custom vaccine type
    }

    // Pet data to send
    const petData = {
        name,
        birth,
        species,
        weight: parseFloat(weight),
        vaccination: {
            type: finalVaccineType,
            date: vaccineDate
        },
        address,
        detailAddress
    };

    // Fetch request to backend
    try {
        const response = await fetch('http://your-backend-url/pet/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(petData)
        });

        const result = await response.json();
        const messageDiv = document.getElementById('responseMessage');
        
        if (result.resultCode === 200) {
            messageDiv.textContent = '반려동물이 등록되었습니다: ' + result.body.petId;
            messageDiv.style.color = 'green';
        } else {
            messageDiv.textContent = result.resultMessage;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('responseMessage').textContent = '서버 오류 발생';
    }
});

// Vaccine Type toggle
document.getElementById('vaccineType').addEventListener('change', (e) => {
    const otherVaccineInput = document.getElementById('otherVaccineType');
    if (e.target.value === "OTHER") {
        otherVaccineInput.style.display = 'block';
    } else {
        otherVaccineInput.style.display = 'none';
    }
});

// Image upload handler
document.getElementById('petImage').addEventListener('click', () => {
    document.getElementById('imageUpload').click();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById('petImage').src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});
