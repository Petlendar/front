import apiClient from './interceptor.js'; // 토큰 발행 및 갱신을 위한 apiClient

const apiEndpoints = {
    "음식추천": "http://211.193.232.196:5000/food",
    "상담": "http://211.193.232.196:5000/petadvice",
    "모니터링": "http://211.193.232.196:5000/petmonitor",
    "예방접종": "http://211.193.232.196:5000/vaccine"
};

// 현재 선택된 기능 추적
let currentFunction = '';
let currentPetId = null;
let uploadedFile = null; // 업로드된 파일 저장

// 사용자 메시지 표시
function displayUserMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 기능 버튼 생성
function createFeatureButtons() {
    const buttonContainer = document.getElementById("buttonContainer");

    // 기존 버튼 삭제
    buttonContainer.innerHTML = '';

    // 각 기능 버튼 생성
    Object.keys(apiEndpoints).forEach((feature) => {
        const button = document.createElement("button");
        button.classList.add("feature-button");
        button.innerText = feature;

        // 버튼 클릭 시 동작
        button.addEventListener("click", () => {
            displayUserMessage(feature);
            currentFunction = feature;
            displayFeatureDescription(feature);
        });

        buttonContainer.appendChild(button);
    });
}

// 파일 업로드 이벤트 추가
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (event) => {
    uploadedFile = event.target.files[0];
    const chatInputContainer = document.querySelector(".chat-input-container");

    // 기존 미리보기 제거
    const existingPreview = document.querySelector(".image-preview-container");
    if (existingPreview) existingPreview.remove();

    // 새 미리보기 추가
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
        const previewContainer = document.createElement("div");
        previewContainer.classList.add("image-preview-container");

        const imagePreview = document.createElement("img");
        imagePreview.src = URL.createObjectURL(uploadedFile);
        imagePreview.classList.add("image-preview-small");

        const closeButton = document.createElement("span");
        closeButton.classList.add("close-button");
        closeButton.innerHTML = "&times;";
        closeButton.addEventListener("click", () => {
            uploadedFile = null;
            previewContainer.remove();
        });

        previewContainer.appendChild(imagePreview);
        previewContainer.appendChild(closeButton);
        chatInputContainer.parentNode.insertBefore(previewContainer, chatInputContainer);
    }
});

// 기능 설명 표시
function displayFeatureDescription(feature) {
    const chatMessages = document.getElementById("chatMessages");
    const featureDescriptions = {
        "음식추천": "음식추천 - 반려동물에 맞는 음식을 추천을 도와드립니다.",
        "상담": "상담 - 반려동물 관련 상담을 도와드립니다.",
        "모니터링": "모니터링 - 반려동물의 건강 상태에 대한 질문을 도와드립니다.",
        "예방접종": "예방 접종 정보에 대한 질문을 도와드립니다."
    };

    if (featureDescriptions[feature]) {
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.innerHTML = `<p>${featureDescriptions[feature]}</p>`;
        botMessage.innerHTML += '<p>반려동물 이름을 선택해주세요.</p>';
        chatMessages.appendChild(botMessage);

        // 반려동물 버튼 생성
        createPetButtons();
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 반려동물 이름을 통해 petId 조회
async function fetchPetIdByName(petName) {
    try {
        const response = await apiClient.get('/pet/api/pet');
        const pets = response.data.body;
        const pet = pets.find(p => p.name === petName);
        return pet ? pet.petId : null;
    } catch (error) {
        console.error("반려동물 목록 조회 실패:", error);
        return null;
    }
}

// 메시지 전송 및 기능 처리
async function processUserMessage() {
    const userInputField = document.getElementById("messageInput");
    const userMessage = userInputField.value.trim();
    const chatMessages = document.getElementById("chatMessages");

    if (!userMessage && !uploadedFile) return;

    displayUserMessage(userMessage);

    if (apiEndpoints[userMessage]) {
        currentFunction = userMessage;
        currentPetId = null;
        displayFeatureDescription(currentFunction);
        return;
    }

    if (currentFunction && !currentPetId) {
        currentPetId = await fetchPetIdByName(userMessage);
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        if (currentPetId) {
            botMessage.innerHTML = `<p>반려동물 이름이 확인되었습니다.</p>`;
            botMessage.innerHTML = `<p>${currentFunction}과 관련된 질문을 해주세요.</p>`;
        } else {
            botMessage.innerHTML = `<p>해당 이름의 반려동물을 찾을 수 없습니다. 다시 입력해주세요.</p>`;
        }
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    if (currentFunction && currentPetId) {
        await sendApiRequest(apiEndpoints[currentFunction], currentPetId, userMessage);
    }
}

// 반려동물 버튼 생성
async function createPetButtons() {
    const chatMessages = document.getElementById("chatMessages");

    // 기존 버튼 컨테이너 제거
    const existingButtons = document.querySelector(".pet-buttons");
    if (existingButtons) existingButtons.remove();

    let pets = [];
    try {
        const response = await apiClient.get('/pet/api/pet');
        pets = response.data.body;
    } catch (error) {
        console.error("반려동물 목록 조회 실패:", error);
        return;
    }

    // 새 버튼 컨테이너 생성
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("pet-buttons");

    pets.forEach(pet => {
        const button = document.createElement("button");
        button.classList.add("pet-button");
        button.innerText = pet.name;

        // 버튼 클릭 시 이벤트 처리
        button.addEventListener("click", async () => {
            displayUserMessage(pet.name); // 사용자 입력 표시
            currentPetId = pet.petId; // 선택된 반려동물 ID 저장
            await sendApiRequest(apiEndpoints[currentFunction], currentPetId, null); // API 요청
        });

        buttonContainer.appendChild(button);
    });

    // 채팅 메시지 영역에 버튼 추가
    chatMessages.appendChild(buttonContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤을 맨 아래로
}


// API 요청 함수
async function sendApiRequest(apiUrl, petId, userText) {
    const chatMessages = document.getElementById("chatMessages");
    try {
        const token = localStorage.getItem('accessToken');
        const requestData = { body: { text: userText, petId } };

        if (uploadedFile) {
            const base64File = await toBase64(uploadedFile);
            requestData.body.file = base64File;
        }

        const response = await apiClient.post(apiUrl, requestData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        const responseMessage = response.data.result || "응답이 없습니다.";
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.innerHTML = `<p>${responseMessage}</p>`;
        chatMessages.appendChild(botMessage);
    } catch (error) {
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.innerHTML = `<p>${error.response?.data?.message || "요청 중 오류가 발생했습니다."}</p>`;
        chatMessages.appendChild(botMessage);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Base64 변환 함수
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// 초기화
function initializePage() {
    createFeatureButtons(); // 기능 버튼 초기화
    const submitButton = document.getElementById("sendButton");
    submitButton.onclick = processUserMessage;
    console.log("페이지가 초기화되었습니다.");
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("로그인이 필요합니다.");
        const currentUrl = window.location.href;
        window.location.href = `./user/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
    }
    initializePage();
});
