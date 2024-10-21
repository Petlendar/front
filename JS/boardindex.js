document.getElementById('createPostPageBtn').addEventListener('click', () => {
    // 게시글 등록 페이지로 이동
    window.location.href = '../boardregister.html';
});

document.addEventListener('DOMContentLoaded', loadPostList);

// 게시글 목록 불러오기
async function loadPostList() {
    const postListDiv = document.getElementById('postList');
    postListDiv.innerHTML = '';

    try {
        const response = await fetch('http://localhost:8080/posts');
        const data = await response.json();

        if (data.body) {
            data.body.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post-item';
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                `;
                postElement.addEventListener('click', () => {
                    window.location.href = `./post.html?boardId=${post.boardId}`;
                });
                postListDiv.appendChild(postElement);
            });
        } else {
            postListDiv.innerHTML = '<p>게시글이 없습니다.</p>';
        }
    } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
    }
}
