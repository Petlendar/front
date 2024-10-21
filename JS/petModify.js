// Get pet id from URL
const urlParams = new URLSearchParams(window.location.search);
const petId = urlParams.get('id');

// Fetch pet details from server
async function fetchPetDetails() {
    try {
        const response = await fetch(`http://114.70.216.57/api/pets/${petId}`, { // API URL 수정 필요
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const pet = await response.json();
        populateForm(pet);
    } catch (error) {
        console.error('Error fetching pet details:', error);
    }
}

// Populate form with fetched data
function populateForm(pet) {
    document.getElementById('name').value = pet.name;
    document.getElementById('species').value = pet.species;
    document.getElementById('birth').value = pet.birth;
    document.getElementById('weight').value = pet.weight;
    document.getElementById('vaccineType').value = pet.vaccine.type;
    document.getElementById('vaccineDate').value = pet.vaccine.date;
}

// Handle form submission and send updated data to server
document.getElementById('editPetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedPet = {
        name: document.getElementById('name').value,
        species: document.getElementById('species').value,
        birth: document.getElementById('birth').value,
        weight: document.getElementById('weight').value,
        vaccine: {
            type: document.getElementById('vaccineType').value,
            date: document.getElementById('vaccineDate').value,
        }
    };

    try {
        await fetch(`http://114.70.216.57/api/pets/${petId}`, { // API URL 수정 필요
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPet)
        });
        alert('반려동물 정보가 수정되었습니다.');
        window.location.href = 'petCheck.html';
    } catch (error) {
        console.error('Error updating pet:', error);
    }
});

// Fetch and display pet details on page load
fetchPetDetails();
