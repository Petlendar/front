import apiClient from './interceptor.js';

const postList = document.getElementById('post-list');
const loadMoreButton = document.getElementById('load-more');
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');
const newPostBtn = document.getElementById('new-post-btn');
const loginButton = document.getElementById('login-btn');
const signupButton = document.getElementById('signup-btn');

let page = 0;
const size = 9;
const startDate = "2024-11-08T16:48:49"; // 고정된 startDate
let endDate = getFormattedDate(); // 페이지 로드 시점의 endDate를 형식에 맞게 설정
let allPosts = []; // 전체 게시글을 저장할 배열

// 로그인 상태 확인 함수
function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // 토큰이 있으면 로그인 상태로 간주하고 버튼 숨김
        loginButton.style.display = 'none';
        signupButton.style.display = 'none';
    } else {
        // 토큰이 없으면 로그인 버튼과 회원가입 버튼 표시
        loginButton.style.display = 'block';
        signupButton.style.display = 'block';
    }
}
// 날짜 포맷 함수
function getFormattedDate() {
    const now = new Date();
    now.setHours(now.getHours() + 9);
    return now.toISOString().slice(0, 19);
}

// 초기 게시글 로드
window.addEventListener('DOMContentLoaded', loadAllPosts);
// 페이지 로드 시 로그인 상태 확인
window.addEventListener('DOMContentLoaded', checkLoginStatus);

// 로그인 버튼 클릭 이벤트
loginButton.addEventListener('click', () => {
    window.location.href = './user/login.html';
});

// 회원가입 버튼 클릭 이벤트
signupButton.addEventListener('click', () => {
    window.location.href = './user/signup.html';
});
// 더보기 버튼 클릭 이벤트
loadMoreButton.addEventListener('click', () => {
    page++;
    displayPosts();
});

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', () => {
    const query = searchBar.value.trim();
    if (query === "") {
        loadAllPosts(); // 검색어가 비어있을 경우 전체 게시글을 다시 로드
    } else {
        searchPosts(query);
    }
});

// 글쓰기 버튼 클릭 이벤트
newPostBtn.addEventListener('click', () => {
    window.location.href = './boardregister.html';
});

// 전체 게시글 로드
async function loadAllPosts() {
    try {
        const response = await apiClient.get(`board/open-api/board`, {
            params: {
                startDate: startDate,
                endDate: endDate,
                page: 0, // 전체 게시글 로드
                size: 9999, // 충분히 큰 값을 설정하여 전체 데이터를 가져옴
                sort: "registeredAt,desc"
            }
        });

        allPosts = response.data.body; // 전체 게시글을 allPosts 배열에 저장
        page = 0; // 페이지 초기화
        postList.innerHTML = ''; // 기존 게시글 초기화
        displayPosts(); // 첫 페이지 게시글 표시
    } catch (error) {
        console.error('전체 게시글 로드 실패:', error);
    }
}

// 현재 페이지에 해당하는 게시글을 추가로 표시
function displayPosts() {
    const start = page * size;
    const end = start + size;
    const postsToDisplay = allPosts.slice(start, end);

    if (postsToDisplay.length === 0 && page === 0) {
        postList.innerHTML = '<p>게시글이 없습니다.</p>';
        loadMoreButton.style.display = 'none';
        return;
    }

    postsToDisplay.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <img src="${post.boardImage?.imageUrl || './image/default-image.webp'}" alt="게시글 이미지">
            <h3>${post.title}</h3>
            <div class="post-meta">
                <span>${post.userId}</span> · <span>${new Date(post.registeredAt).toLocaleDateString()}</span>
            </div>
        `;
        postList.appendChild(postElement);
    });

    // 더 이상 불러올 게시글이 없으면 더보기 버튼 숨기기
    loadMoreButton.style.display = end < allPosts.length ? 'block' : 'none';
}

// 검색 기능 (boardId 또는 title을 바탕으로 검색)
async function searchPosts(query) {
    const condition = {
        startDate: startDate,
        endDate: endDate
    };

    if (!isNaN(query) && query) {
        condition.boardId = parseInt(query);
    } else {
        condition.title = query;
    }

    try {
        const response = await apiClient.get(`board/open-api/board`, {
            params: {
                startDate: condition.startDate,
                endDate: condition.endDate,
                boardId: condition.boardId,
                title: condition.title,
                page: 0,
                size: 9999,
                sort: "registeredAt,desc"
            }
        });
        
        allPosts = response.data.body; // 검색 결과로 전체 게시글을 갱신
        page = 0; // 페이지 초기화
        postList.innerHTML = ''; // 기존 게시글 초기화
        displayPosts(); // 첫 페이지 게시글 표시

        if (allPosts.length === 0) {
            postList.innerHTML = '<p>검색 결과가 없습니다.</p>';
            loadMoreButton.style.display = 'none';
        }
    } catch (error) {
        console.error('검색 실패:', error);
    }
}
