import apiClient from './interceptor.js';

const commentsSection = document.getElementById('comments-section');
const commentsList = document.getElementById('comments-list');
const postId = new URLSearchParams(window.location.search).get('id');

let currentUserId = null; // 현재 로그인된 사용자 ID

// 현재 로그인된 사용자 정보 조회
async function loadCurrentUser() {
    try {
        const response = await apiClient.get('/user/api/user', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        currentUserId = response.data.body.id; // 사용자 ID 설정
        console.log('현재 로그인된 사용자 ID:', currentUserId);
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
    }
}

// 댓글 조회
async function loadComments() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            commentsList.innerHTML = '<p>로그인이 필요합니다.</p>';
            return;
        }

        const response = await apiClient.get(`/board/api/comment/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const comments = response.data.body;

        commentsList.innerHTML = ''; // 기존 댓글 초기화

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<p>댓글이 없습니다.</p>';
        } else {
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.innerHTML = `
                    <p>${comment.content}</p>
                    <div class="comment-meta">
                        작성자: ${comment.userId} · ${new Date(comment.registeredAt).toLocaleDateString()}
                    </div>
                `;

                // 자신의 댓글만 수정/삭제 버튼 표시
                if (comment.userId === currentUserId) {
                    const actions = document.createElement('div');
                    actions.classList.add('comment-actions');

                    // 수정 버튼
                    const editButton = document.createElement('span');
                    editButton.textContent = '수정';
                    editButton.classList.add('action-button');
                    editButton.onclick = () => showEditCommentInput(commentElement, comment);

                    // 삭제 버튼
                    const deleteButton = document.createElement('span');
                    deleteButton.textContent = '삭제';
                    deleteButton.classList.add('action-button');
                    deleteButton.onclick = () => deleteComment(comment.commentId);

                    actions.appendChild(editButton);
                    actions.appendChild(deleteButton);
                    commentElement.appendChild(actions);
                }

                commentsList.appendChild(commentElement);
            });
        }

        // 댓글 입력창 추가
        addCommentInput();
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('댓글이 없습니다. 404 상태를 무시합니다.');
            commentsList.innerHTML = '<p>댓글이 없습니다.</p>';
            addCommentInput(); // 댓글 입력창 추가
        } else {
            console.error('댓글 조회 오류:', error);
            commentsList.innerHTML = '<p>댓글을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }
}

// 댓글 수정 입력창 표시
function showEditCommentInput(commentElement, comment) {
    const existingForm = document.querySelector('.edit-comment-form');
    if (existingForm) existingForm.remove();

    commentElement.querySelector('p').style.display = 'none';
    const metaElement = commentElement.querySelector('.comment-meta');
    if (metaElement) metaElement.style.display = 'none';

    const editForm = document.createElement('div');
    editForm.classList.add('edit-comment-form');

    const editInput = document.createElement('textarea');
    editInput.value = comment.content;
    editInput.classList.add('edit-input');

    const saveButton = document.createElement('button');
    saveButton.textContent = '저장';
    saveButton.classList.add('save-button');
    saveButton.onclick = async () => {
        const updatedContent = editInput.value.trim();
        if (!updatedContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            const payload = {
                body: {
                    commentId: comment.commentId,
                    content: updatedContent
                }
            };

            const response = await apiClient.post('/board/api/comment/update', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.data.result.resultCode === 200) {
                alert('댓글이 수정되었습니다.');
                loadComments();
            } else {
                alert('댓글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 수정 중 오류 발생:', error);
            alert('댓글 수정 중 문제가 발생했습니다.');
        }
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '취소';
    cancelButton.classList.add('cancel-button');
    cancelButton.onclick = () => {
        commentElement.querySelector('p').style.display = 'block';
        if (metaElement) metaElement.style.display = 'block';
        editForm.remove();
    };

    editForm.appendChild(editInput);
    editForm.appendChild(saveButton);
    editForm.appendChild(cancelButton);

    commentElement.appendChild(editForm);
}

// 댓글 삭제
async function deleteComment(commentId) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
        const response = await apiClient.post(`/board/api/comment/unregister/${commentId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (response.data.result.resultCode === 200) {
            alert('댓글이 삭제되었습니다.');
            loadComments();
        } else {
            alert('댓글 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        alert('댓글 삭제 중 문제가 발생했습니다.');
    }
}

// 댓글 입력창 추가
function addCommentInput() {
    const existingForm = document.querySelector('.comment-form');
    if (existingForm) existingForm.remove();

    const commentForm = document.createElement('div');
    commentForm.classList.add('comment-form');

    const commentInput = document.createElement('textarea');
    commentInput.placeholder = '댓글을 입력하세요...';

    const submitButton = document.createElement('button');
    submitButton.textContent = '등록';
    submitButton.classList.add('submit-button');
    submitButton.onclick = async () => {
        const content = commentInput.value.trim();
        if (!content) {
            alert('댓글을 입력해주세요.');
            return;
        }

        try {
            const payload = {
                body: {
                    content: content,
                    boardId: parseInt(postId, 10)
                }
            };

            const response = await apiClient.post('/board/api/comment', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.data.result.resultCode === 200) {
                alert('댓글이 등록되었습니다.');
                loadComments();
            } else {
                alert('댓글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 등록 중 오류 발생:', error);
            alert('댓글 등록 중 문제가 발생했습니다.');
        }
    };

    commentForm.appendChild(commentInput);
    commentForm.appendChild(submitButton);
    commentsSection.appendChild(commentForm);
}

// 초기 데이터 로드
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser(); // 사용자 정보 로드
    await loadComments();
});
