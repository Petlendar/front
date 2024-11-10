import apiClient from './interceptor.js'; // 토큰 발행 및 갱신을 위한 apiClient

const apiEndpoints = {
    "음식추천": "http://211.193.232.196:5000/food",
    "상담": "http://211.193.232.196:5000/petadvice",
    "모니터링": "http://211.193.232.196:5000/petmonitor",
    "예방접종": "http://211.193.232.196:5000/vaccine"
};

// 현재 선택된 기능과 petId를 추적
let currentFunction = '';
let currentPetId = null;
let uploadedFile = null; // 업로드된 파일을 저장

// 파일 업로드 이벤트 추가
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (event) => {
    uploadedFile = event.target.files[0]; // 업로드된 파일 저장
    const chatInputContainer = document.querySelector(".chat-input-container");

    // 기존 미리보기 이미지가 있다면 제거
    const existingPreview = document.querySelector(".image-preview-container");
    if (existingPreview) {
        existingPreview.remove();
    }

    // 이미지 미리보기 요소 생성
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
        const previewContainer = document.createElement("div");
        previewContainer.classList.add("image-preview-container");

        const imagePreview = document.createElement("img");
        imagePreview.src = URL.createObjectURL(uploadedFile);
        imagePreview.classList.add("image-preview-small");

        // X 버튼 생성
        const closeButton = document.createElement("span");
        closeButton.classList.add("close-button");
        closeButton.innerHTML = "&times;"; // X 모양
        closeButton.addEventListener("click", () => {
            uploadedFile = null; // 업로드된 파일 삭제
            previewContainer.remove(); // 미리보기 제거
        });

        // 미리보기 컨테이너에 이미지와 X 버튼 추가
        previewContainer.appendChild(imagePreview);
        previewContainer.appendChild(closeButton);
        chatInputContainer.parentNode.insertBefore(previewContainer, chatInputContainer); // chat-input-container 위에 추가
    }
});

// 기능 설명 표시
function displayFeatureDescription(feature) {
    const chatMessages = document.getElementById("chatMessages");
    const featureDescriptions = {
        "음식추천": "음식추천 - 반려동물에게 맞는 음식을 추천해드립니다.",
        "상담": "상담 - 반려동물 관련 상담을 도와드립니다.",
        "모니터링": "모니터링 - 반려동물의 건강 상태를 모니터링합니다.",
        "예방접종": "예방접종 - 예방 접종 정보를 제공합니다."
    };

    if (featureDescriptions[feature]) {
        chatMessages.innerHTML += `<div class="message bot"><p>${featureDescriptions[feature]}</p><p>반려동물의 이름을 입력해주세요</p></div>`;
    } else {
        console.error("알 수 없는 기능:", feature);
    }
}

// 반려동물 이름을 통해 petId 조회
async function fetchPetIdByName(petName) {
    try {
        const response = await apiClient.get('pet/api/pet');
        const pets = response.data.body;
        const pet = pets.find(p => p.name === petName);
        return pet ? pet.petId : null;
    } catch (error) {
        console.error("반려동물 목록을 불러오는 중 오류 발생:", error);
        return null;
    }
}

// 메시지 전송 및 기능 처리
async function processUserMessage() {
    const userInputField = document.getElementById("messageInput");
    const userMessage = userInputField.value.trim();
    const chatMessages = document.getElementById("chatMessages");

    if (!userMessage && !uploadedFile) return; // 메시지와 파일이 모두 없으면 종료

    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message", "user");

    // 사용자가 입력한 텍스트 메시지를 추가
    if (userMessage) {
        const textElement = document.createElement("p");
        textElement.innerText = userMessage;
        messageContainer.appendChild(textElement);
    }

    // 사용자가 업로드한 이미지를 채팅창에 추가
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
        const imageElement = document.createElement("img");
        imageElement.src = URL.createObjectURL(uploadedFile);
        imageElement.classList.add("image-preview-large");
        messageContainer.appendChild(imageElement); // 이미지 추가
        uploadedFile = null; // 파일 초기화

        // 미리보기 이미지 제거
        const existingPreview = document.querySelector(".image-preview-container");
        if (existingPreview) {
            existingPreview.remove(); // 전송 후 미리보기 제거
        }
    }

    chatMessages.appendChild(messageContainer);
    userInputField.value = ''; // 텍스트박스 초기화
    chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤을 맨 아래로

    // 사용자가 새로운 기능을 입력한 경우 기능 설명 표시
    if (apiEndpoints[userMessage]) {
        currentFunction = userMessage;
        currentPetId = null;
        displayFeatureDescription(currentFunction); // 새로운 기능 설명 표시
        return;
    }

    // 현재 기능이 설정된 경우, 반려동물 이름을 받지 않은 경우
    if (currentFunction && !currentPetId) {
        currentPetId = await fetchPetIdByName(userMessage);
        if (currentPetId) {
            chatMessages.innerHTML += `<div class="message bot"><p>반려동물 이름이 확인되었습니다. ${currentFunction} 기능을 시작합니다.</p></div>`;
        } else {
            chatMessages.innerHTML += `<div class="message bot"><p>해당 이름의 반려동물을 찾을 수 없습니다. 다시 입력해주세요.</p></div>`;
            currentPetId = null;
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    // 현재 기능과 petId가 모두 설정된 경우 기능 API로 요청 전송
    if (currentFunction && currentPetId) {
        await sendApiRequest(apiEndpoints[currentFunction], currentPetId, userMessage);
    }
}

// textarea가 채팅 입력창의 높이를 조절하도록 하는 기능
const messageInput = document.getElementById("messageInput");

messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    if (messageInput.value.trim() === "") {
        messageInput.style.height = "40px"; // 기본 높이로 설정
    } else {
        messageInput.style.height = (messageInput.scrollHeight) + "px";
    }
});

// 이미지 파일을 Base64 형식으로 변환하는 함수
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Base64 부분만 가져옴
        reader.onerror = error => reject(error);
    });
}
// API 요청 함수
async function sendApiRequest(apiUrl, petId, userText) {
    const chatMessages = document.getElementById("chatMessages");

    try {
        const token = localStorage.getItem('accessToken');

        // JSON 형식으로 body에 데이터 포함
        
        const requestData = {
            body: {
                text: userText,
                petId: petId
            }
        };
        

        // 파일이 있을 경우 Base64로 변환하여 JSON에 포함
        if (uploadedFile) {
            const base64File = await toBase64(uploadedFile);
            requestData.body.file = base64File; // Base64 파일을 JSON 데이터에 추가
        }

        const response = await apiClient.post(apiUrl, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' // JSON 형식으로 설정
            }
        });

        // API로부터 받은 응답을 채팅창에 표시
        const responseMessage = response.data.result || "응답이 없습니다.";
        chatMessages.innerHTML += `<div class="message bot"><p>AI: ${responseMessage}</p></div>`;
        uploadedFile = null; // 파일 초기화
    } catch (error) {
        // 에러 처리
        let responseText = "요청 중 오류가 발생했습니다.";
        if (error.response) {
            if (error.response.status === 401) {
                responseText = "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
            } else {
                responseText = `오류: ${error.response.data.message || "서버 오류가 발생했습니다."}`;
            }
        } else if (error.request) {
            responseText = "서버에서 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.";
        } else {
            responseText = `요청 실패: ${error.message}`;
        }

        // 오류 메시지 출력
        chatMessages.innerHTML += `<div class="message bot"><p>${responseText}</p></div>`;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 초기화 및 로그인 상태 확인
document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("로그인이 필요합니다.");
        const currentUrl = window.location.href;
        window.location.href = `./user/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
    }

    await initializePage();
});

async function initializePage() {
    try {
        const submitButton = document.getElementById("sendButton");
        submitButton.onclick = processUserMessage;

        console.log("페이지가 초기화되었습니다.");
    } catch (error) {
        console.error("초기화 중 오류 발생:", error);
    }
}
