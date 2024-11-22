import apiClient from './interceptor.js';

const postList = document.getElementById('post-list');
const loadMoreButton = document.getElementById('load-more');
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');
const newPostBtn = document.getElementById('new-post-btn');
const loginButton = document.getElementById('login-btn');
const signupButton = document.getElementById('signup-btn');
const logoutButton = document.getElementById('logout-btn');

let page = 0;
const size = 9;
const startDate = "2024-11-08T16:48:49"; // 고정된 startDate
let endDate = getFormattedDate(); // 페이지 로드 시점의 endDate를 형식에 맞게 설정
let allPosts = []; // 전체 게시글을 저장할 배열


// 날짜 포맷 함수
function getFormattedDate() {
    const now = new Date();
    now.setHours(now.getHours() + 9);
    return now.toISOString().slice(0, 19);
}

// 초기 게시글 로드
window.addEventListener('DOMContentLoaded', loadAllPosts);

// 더보기 버튼 클릭 이벤트
loadMoreButton.addEventListener('click', () => {
    page++;
    displayPosts();
});

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', () => {
    const query = searchBar.value.trim();
    if (query === "") {
        loadAllPosts();
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
                page: 0,
                size: 9999,
                sort: "registeredAt,desc"
            }
        });

        allPosts = response.data.body;
        page = 0;
        postList.innerHTML = '';
        displayPosts();
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
        
        // 게시글 클릭 시 해당 게시글의 ID로 상세 페이지로 이동하는 링크 추가
        postElement.innerHTML = `
            <a href="boardpost.html?id=${post.boardId}">
                <img src="${post.boardImage?.imageUrl || './images/default-image.webp'}" alt="게시글 이미지">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span>${post.userId}</span> · <span>${new Date(post.registeredAt).toLocaleDateString()}</span>
                </div>
            </a>
        `;

        postList.appendChild(postElement);
    });

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

        allPosts = response.data.body;
        page = 0;
        postList.innerHTML = '';
        displayPosts();

        if (allPosts.length === 0) {
            postList.innerHTML = '<p>검색 결과가 없습니다.</p>';
            loadMoreButton.style.display = 'none';
        }
    } catch (error) {
        console.error('검색 실패:', error);
    }
}
