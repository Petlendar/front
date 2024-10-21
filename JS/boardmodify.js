const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('boardId');

document.getElementById('backToPostBtn').addEventListener('click', () => {
    window.history.back(); // 이전 페이지로 돌아가기
});

document.getElementById('updatePostBtn').addEventListener('click', updatePost);

// 게시글 상세 정보 로드
async function loadPostDetail() {
    try {
        const response = await fetch(`http://localhost:8080/posts/${boardId}`);
        const data = await response.json();

        document.getElementById('postTitle').value = data.body.title;
        document.getElementById('postContent').value = data.body.content;
    } catch (error) {
        console.error('게시글 불러오기 실패:', error);
    }
}

// 게시글 수정
async function updatePost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title || !content) {
        alert('제목과 내용을 입력하세요.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/posts/${boardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category: 'DOG',
                imageIdList: [0]
            }),
        });

        const data = await response.json();
        if (data.result.resultCode === 200) {
            alert('게시글이 수정되었습니다.');
            window.location.href = `./boardpost.html?boardId=${boardId}`; // 수정 후 상세 페이지로 이동
        } else {
            alert('게시글 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 수정 실패:', error);
    }
}

// 페이지 로드 시 게시글 상세 정보 로드
loadPostDetail();
