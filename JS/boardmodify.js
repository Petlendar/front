import apiClient from './interceptor.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const submitButton = document.getElementById('submit-btn');
    const titleInput = document.getElementById('title-input');
    const charCountDisplay = document.getElementById('char-count'); // 글자 수 표시 영역
    let selectedImages = [];

    // Quill 에디터 초기화
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: '#toolbar'
        }
    });

    quill.getModule('toolbar').addHandler('image', () => selectImage());

    // 게시글 상세 조회 및 초기값 설정
    async function loadPostData() {
        try {
            const response = await apiClient.get(`/board/open-api/board/${postId}`);
            const post = response.data.body;
            titleInput.value = post.title;
            quill.root.innerHTML = post.content;
        } catch (error) {
            console.error('게시글 상세 조회 오류:', error);
            alert('게시글 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 이미지 선택 및 업로드
    function selectImage() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const files = Array.from(input.files);
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await apiClient.post('/image/api/image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.data.result.resultCode === 200) {
                        const imageUrl = response.data.body.imageUrl;
                        const imageId = response.data.body.id;
                        selectedImages.push(imageId);
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'image', imageUrl);
                        quill.setSelection(range.index + 1);
                    } else {
                        console.error('이미지 업로드 실패:', response.data);
                        alert('이미지 업로드에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('이미지 업로드 오류:', error);
                    alert('이미지 업로드 중 오류가 발생했습니다.');
                }
            }
        };
    }

    // 글자 수 업데이트
    function updateCharCount() {
        const plainTextContent = quill.getText().trim();
        charCountDisplay.textContent = `${plainTextContent.length} / 1000`;
    }

    quill.on('text-change', updateCharCount);

    // 게시글 수정
    submitButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = quill.root.innerHTML;
        const byteLength = new Blob([quill.getText().trim()]).size;
        const category = "DOG";

        if (!title || !content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        if (byteLength > 1000) {
            alert('내용은 최대 1000바이트까지 가능합니다.');
            return;
        }

        try {
            const updateData = {
                boardId: parseInt(postId, 10),
                title,
                content,
                category
            };

            const response = await apiClient.post('/board/api/board/update', {
                body: updateData
            });

            if (response.data.result.resultCode === 200) {
                alert('게시글이 성공적으로 수정되었습니다.');
                window.location.href = `./boardpost.html?id=${postId}`;
            } else {
                console.error('게시글 수정 실패:', response.data);
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 실패:', error);
            alert('게시글 수정 중 오류가 발생했습니다.');
        }
    });

    // 초기 데이터 로드
    await loadPostData();
    updateCharCount();
});
