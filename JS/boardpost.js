import apiClient from './interceptor.js';

const loginButton = document.getElementById('login-btn');
const signupButton = document.getElementById('signup-btn');
const logoutButton = document.getElementById('logout-btn');
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

let currentUserId = null; // 현재 로그인된 사용자 ID
let postAuthorId = null; // 게시글 작성자 ID

// 로그인 상태 확인
async function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');

    if (token) {
        // 로그인된 사용자 정보 로드
        await loadUserInfo();
    } else {
        alert('로그인이 필요합니다.');
        const currentUrl = window.location.href;
        window.location.href = `./user/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        currentUserId = null; // 초기화
    }
}

// 로그인된 사용자 정보 로드
async function loadUserInfo() {
    try {
        const response = await apiClient.get('/user/api/user');
        currentUserId = response.data.body.id; // 사용자 ID 저장
        console.log('현재 로그인된 사용자 ID:', currentUserId);
    } catch (error) {
        console.error('로그인된 사용자 정보 조회 실패:', error);
        currentUserId = null; // 초기화
    }
}

// 게시글 상세 조회
async function loadPostDetail() {
    try {
        const response = await apiClient.get(`/board/open-api/board/${postId}`);
        const post = response.data.body;
        postAuthorId = post.userId; // 게시글 작성자 ID 저장
        console.log('게시글 작성자 ID:', postAuthorId);

        // 게시글 정보 표시
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-category').textContent = `카테고리: ${post.category}`;
        document.getElementById('post-user').textContent = `작성자: ${post.name}`;
        document.getElementById('post-date').textContent = `등록일: ${new Date(post.registeredAt).toLocaleDateString()}`;

        const postContentContainer = document.getElementById('post-content');
        postContentContainer.innerHTML = post.content;

        // 현재 사용자와 게시글 작성자 비교 후 수정/삭제 표시
        if (currentUserId && currentUserId === postAuthorId) {
            console.log('수정/삭제 버튼 추가 조건 충족');
            addEditDeleteTexts();
        } else {
            console.log('수정/삭제 버튼 추가 조건 불충족');
        }
    } catch (error) {
        console.error('게시글 상세 조회 오류:', error);
    }
}

// 수정/삭제 텍스트 추가
function addEditDeleteTexts() {
    const postDetail = document.getElementById('post-detail');

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action-container');
    actionContainer.style.textAlign = 'right';

    const editText = document.createElement('span');
    editText.textContent = '수정';
    editText.classList.add('action-text');
    editText.style.marginRight = '10px';
    editText.onclick = () => {
        window.location.href = `./boardmodify.html?id=${postId}`;
    };

    const deleteText = document.createElement('span');
    deleteText.textContent = '삭제';
    deleteText.classList.add('action-text');
    deleteText.onclick = async () => {
        if (confirm('정말로 삭제하시겠습니까?')) {
            try {
                await apiClient.post(`/board/api/board/unregister/${postId}`);
                alert('게시글이 삭제되었습니다.');
                window.location.href = './boardindex.html';
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    actionContainer.appendChild(editText);
    actionContainer.appendChild(deleteText);
    postDetail.appendChild(actionContainer);
}

// 초기 데이터 로드
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkLoginStatus(); // 로그인 상태 확인
        await loadPostDetail();  // 게시글 상세 정보 로드
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
});
