import apiClient from './interceptor.js'; // 토큰 발행 및 갱신을 위한 apiClient

const apiEndpoints = {
    "음식추천": "/ai/api/ai/food",
    "상담": "/ai/api/ai/petadvice",
    "모니터링": "/ai/api/ai/petmonitor",
    "예방접종": "/ai/api/ai/vaccine"
};

let currentFunction = ''; // 현재 선택된 기능
let currentPetId = null; // 현재 선택된 반려동물 ID
let uploadedFile = null; // 업로드된 파일 저장

// 로딩 모션 추가
function showTypingIndicator() {
    const chatMessages = document.getElementById("chatMessages");
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingIndicator; // 로딩 모션 요소 반환
}

// 로딩 모션 제거
function hideTypingIndicator(typingIndicator) {
    if (typingIndicator) typingIndicator.remove();
}

// 메시지 추가 함수 (유저/봇 공통)
function addMessage(content, type = 'bot') {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) {
        console.error("chatMessages 요소를 찾을 수 없습니다.");
        return;
    }
    const message = document.createElement("div");
    message.classList.add("message", type);
    message.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 기능 카드 초기화 (클릭 이벤트 등록)
function initializeFeatureCards() {
    const cards = document.querySelectorAll(".feature-cards .card");

    if (!cards || cards.length === 0) {
        console.error("기능 카드가 존재하지 않습니다.");
        return;
    }

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const feature = card.getAttribute("data-feature");
            if (!feature) {
                console.error("카드에 data-feature 속성이 없습니다.");
                return;
            }
            selectFeature(feature);
        });
    });
}

// 기능 선택 처리
function selectFeature(feature) {
    console.log("선택된 기능:", feature); // 디버깅 로그
    addMessage(`${feature} 기능을 선택하셨습니다.`, "user");
    currentFunction = feature;
    addMessage("반려동물을 선택해주세요.", "bot");
    createPetCards(); // 반려동물 카드 생성
}

// 반려동물 카드 생성
async function createPetCards() {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) {
        console.error("chatMessages 요소를 찾을 수 없습니다.");
        return;
    }

    // 기존 카드 컨테이너 제거
    const existingCards = document.querySelector(".pet-cards");
    if (existingCards) existingCards.remove();

    // 새 카드 컨테이너 생성
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("pet-cards");

    try {
        const response = await apiClient.get('/pet/api/pet');
        const pets = response.data.body;

        pets.forEach(pet => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-pet-id", pet.petId); // 반려동물 ID 저장

            // 카드 내용 구성
            const img = document.createElement("img");
            img.src = pet.petImage?.imageUrl || "./images/default-image.webp"; // 이미지 URL 사용, 없으면 기본 이미지
            img.alt = pet.name;
            img.classList.add("pet-image");

            const name = document.createElement("h3");
            name.textContent = pet.name;

            card.appendChild(img);
            card.appendChild(name);

            // 카드 클릭 이벤트
            card.addEventListener("click", () => {
                selectPet(pet); // 선택된 반려동물 처리
            });

            cardContainer.appendChild(card);
        });
    } catch (error) {
        addMessage("반려동물 목록을 불러오는 데 실패했습니다.", "bot");
        console.error("반려동물 목록 조회 오류:", error);
    }

    chatMessages.appendChild(cardContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤을 맨 아래로 이동
}

// 반려동물 선택 처리
function selectPet(pet) {
    console.log("선택된 반려동물:", pet); // 디버깅 로그
    addMessage(`${pet.name}을(를) 선택하셨습니다.`, "user");
    addMessage(`${currentFunction}과 관련된 질문을 입력해주세요.`, "bot");
    currentPetId = pet.petId;
}

// 메시지 입력 처리
async function processUserMessage() {
    const userInputField = document.getElementById("messageInput");
    const userMessage = userInputField.value.trim();

    if (!userMessage) return;

    addMessage(userMessage, "user");
    userInputField.value = ''; // 입력 필드 초기화

    if (!currentFunction) {
        addMessage("기능을 먼저 선택해주세요.", "bot");
        return;
    }

    if (!currentPetId) {
        addMessage("반려동물을 먼저 선택해주세요.", "bot");
        return;
    }

    const typingIndicator = showTypingIndicator(); // 로딩 모션 추가
    console.log("currentFucntions : ", apiEndpoints[currentFunction]);
    await sendApiRequest(apiEndpoints[currentFunction], currentPetId, userMessage, typingIndicator);
}

// API 요청
async function sendApiRequest(apiUrl, petId, userText, typingIndicator) {
    try {
        const requestData = {
            body: {
                text: userText,
                petId
            }
        };

        if (uploadedFile) {
            const base64File = await toBase64(uploadedFile);
            requestData.file = base64File;
        }
        console.log("요청 데이터:", requestData); // 요청 데이터 확인
        const response = await apiClient.post(apiUrl, requestData);
        hideTypingIndicator(typingIndicator); // 로딩 모션 제거
        addMessage(response.data.result || "응답이 없습니다.", "bot");
    } catch (error) {
        hideTypingIndicator(typingIndicator); // 로딩 모션 제거
        const errorMessage = error.response?.data?.message || "요청 중 오류가 발생했습니다.";
        addMessage(`오류: ${errorMessage}`, "bot");
        console.error("API 요청 실패:", error);
    }
}

// Base64 변환
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// 페이지 초기화
function initializePage() {
    initializeFeatureCards(); // 카드에 이벤트 리스너 추가
    document.getElementById("sendButton").addEventListener("click", processUserMessage);
    console.log("페이지 초기화 완료");
}

// DOM 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = `./user/login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }
    initializePage();
});
