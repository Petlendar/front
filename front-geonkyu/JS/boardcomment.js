document.getElementById('registerCommentBtn').addEventListener('click', registerComment);

// 댓글 등록
async function registerComment() {
    const boardId = document.getElementById('boardId').value;
    const content = document.getElementById('commentContent').value;

    if (!boardId || !content) {
        alert("게시글 ID와 댓글 내용을 입력해주세요.");
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
        displayResult(data);
        loadCommentList(boardId); // 댓글 목록 갱신
    } catch (error) {
        console.error('Error registering comment:', error);
    }
}

// 결과 표시
function displayResult(data) {
    const resultDiv = document.getElementById('result');
    if (data.result.resultCode === 200) {
        resultDiv.innerHTML = `<p>${data.result.resultMessage}</p>`;
    } else {
        resultDiv.innerHTML = `<p class="error">${data.result.resultDescription}</p>`;
    }
}

// 댓글 목록 조회
async function loadCommentList(boardId) {
    const commentListDiv = document.getElementById('commentList');
    commentListDiv.innerHTML = ''; // 초기화

    try {
        const response = await fetch(`http://localhost:8080/comments?boardId=${boardId}`);
        const data = await response.json();

        if (data.body) {
            data.body.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `<p>${comment.content}</p>`;
                commentListDiv.appendChild(commentElement);
            });
        } else {
            commentListDiv.innerHTML = '<p>댓글이 없습니다.</p>';
        }
    } catch (error) {
        console.error('Error loading comment list:', error);
    }
}
