document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and display pet information from the server
    await fetchPets();
    
    // Redirect to pet registration page when button is clicked
    document.getElementById('addPetBtn').addEventListener('click', () => {
        window.location.href = 'petRegistration.html';
    });
});

// Fetch pets from the server (GET request to API)
async function fetchPets() {
    try {
        const response = await fetch('http://114.70.216.57/api/pets', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const pets = await response.json();
        displayPets(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
    }
}

// Display the list of pets on the page
function displayPets(pets) {
    const petListDiv = document.getElementById('petList');
    petListDiv.innerHTML = ''; // Clear previous list

    pets.forEach((pet) => {
        const petCard = document.createElement('div');
        petCard.classList.add('pet-card');
        
        petCard.innerHTML = `
            <h2>${pet.name}</h2>
            <p>종류: ${pet.species}</p>
            <p>생일: ${pet.birth}</p>
            <p>체중: ${pet.weight} kg</p>
            <p>백신 유형: ${pet.vaccine.type}</p>
            <p>백신 날짜: ${pet.vaccine.date}</p>
            <button class="edit-btn" onclick="editPet(${pet.id})">수정</button>
            <button class="delete-btn" onclick="deletePet(${pet.id})">삭제</button>
        `;
        petListDiv.appendChild(petCard);
    });
}

// Edit pet handler
function editPet(petId) {
    window.location.href = `editPet.html?id=${petId}`;
}

// Delete pet handler
async function deletePet(petId) {
    const confirmDelete = confirm('정말로 이 반려동물을 삭제하시겠습니까?');
    if (confirmDelete) {
        try {
            await fetch(`http://114.70.216.57/api/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert('반려동물이 삭제되었습니다.');
            fetchPets();  // Refresh pet list
        } catch (error) {
            console.error('Error deleting pet:', error);
        }
    }
}
