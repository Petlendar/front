document.getElementById('submitPostBtn').addEventListener('click', createPost);
document.getElementById('backToIndexBtn').addEventListener('click', () => {
    window.location.href = '../boardpost.html';
});

async function createPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title || !content) {
        alert('제목과 내용을 입력하세요.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category: 'DOG',
                imageIdList: [0]
            })
        });

        const data = await response.json();
        if (data.result.resultCode === 200) {
            alert('게시글이 등록되었습니다.');
            window.location.href = './index.html';  // 등록 후 목록 페이지로 이동
        } else {
            alert('게시글 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 등록 실패:', error);
    }
}
