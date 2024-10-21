const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('boardId');

document.getElementById('backToIndexBtn').addEventListener('click', () => {
    window.location.href = '../boardpost.html';
});

document.getElementById('submitCommentBtn').addEventListener('click', registerComment);

async function loadPostDetail() {
    try {
        const response = await fetch(`http://localhost:8080/posts/${boardId}`);
        const data = await response.json();

        const postDetailDiv = document.getElementById('postDetail');
        postDetailDiv.innerHTML = `
            <h3>${data.body.title}</h3>
            <p>${data.body.content}</p>
            <p>작성일: ${data.body.registeredAt}</p>
        `;
    } catch (error) {
        console.error('게시글 불러오기 실패:', error);
    }
}

async function registerComment() {
    const content = document.getElementById('commentContent').value;

    if (!content) {
        alert('댓글 내용을 입력하세요.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
                boardId: boardId
            }),
        });

        const data = await response.json();
        if (data.result.resultCode === 200) {
            alert('댓글이 등록되었습니다.');
            document.getElementById('commentContent').value = ''; // 댓글 입력란 초기화
            loadComments(); // 댓글 목록 다시 불러오기
        } else {
            alert('댓글 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 등록 실패:', error);
    }
}

// 댓글 목록 불러오기
async function loadComments() {
    const commentListDiv = document.getElementById('commentList');
    commentListDiv.innerHTML = '';

    try {
        const response = await fetch(`http://localhost:8080/posts/${boardId}/comments`);
        const data = await response.json();

        if (data.body) {
            data.body.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `
                    <p>${comment.content}</p>
                    <p>댓글 ID: ${comment.commentId}</p>
                    <button onclick="deleteComment(${comment.commentId})">삭제</button>
                `;
                commentListDiv.appendChild(commentElement);
            });
        } else {
            commentListDiv.innerHTML = '<p>댓글이 없습니다.</p>';
        }
    } catch (error) {
        console.error('댓글 목록 불러오기 실패:', error);
    }
}

// 댓글 삭제 기능
async function deleteComment(commentId) {
    if (confirm('댓글을 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`http://localhost:8080/comments/${commentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.result.resultCode === 200) {
                alert('댓글이 삭제되었습니다.');
                loadComments(); // 댓글 목록 다시 불러오기
            } else {
                alert('댓글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        }
    }
}

// 게시글 수정 기능
document.getElementById('modifyPostBtn').addEventListener('click', () => {
    window.location.href = `../boardmodify.html?boardId=${boardId}`;
});

// 게시글 삭제 기능
document.getElementById('deletePostBtn').addEventListener('click', async () => {
    if (confirm('게시글을 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`http://localhost:8080/posts/${boardId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.result.resultCode === 200) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = './index.html'; // 삭제 후 목록 페이지로 이동
            } else {
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
        }
    }
});

// 페이지 로드 시 게시글 상세 정보 및 댓글 목록 불러오기
loadPostDetail();
loadComments();

