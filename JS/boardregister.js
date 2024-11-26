import apiClient from './interceptor.js';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: '#toolbar'
        }
    });

    const submitButton = document.getElementById('submit-btn');
    const titleInput = document.getElementById('title-input');
    const charCountDisplay = document.getElementById('char-count'); // 글자 수 표시 영역
    let selectedImages = [];

    quill.getModule('toolbar').addHandler('image', () => selectImage());

    // 문자열의 바이트 길이를 계산하는 함수
    function getByteLength(text) {
        let byteLength = 0;
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode <= 0x7f) {
                byteLength += 1;
            } else if (charCode <= 0x7ff) {
                byteLength += 2;
            } else if (charCode <= 0xffff) {
                byteLength += 3;
            } else {
                byteLength += 4;
            }
        }
        return byteLength;
    }

    function updateCharCount() {
        const plainTextContent = quill.getText().trim();
        const byteLength = getByteLength(plainTextContent);
        charCountDisplay.textContent = `${byteLength} / 1000바이트`; // 1000 바이트 기준
    }

    quill.on('text-change', updateCharCount);

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

    submitButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = quill.root.innerHTML;
        const byteLength = getByteLength(quill.getText().trim());
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
            const postData = {
                title,
                content,
                category,
                imageIdList: selectedImages
            };

            const postResponse = await apiClient.post('/board/api/board', {
                result: {
                    resultCode: 200,
                    resultMessage: "string",
                    resultDescription: "string"
                },
                body: postData
            });

            if (postResponse.data.result && postResponse.data.result.resultCode === 200) {
                alert('게시글이 성공적으로 등록되었습니다.');
                window.location.href = 'boardindex.html';
            } else {
                console.error('게시글 등록 실패:', postResponse.data);
                alert('게시글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('등록 실패:', error);
            if (error.response && error.response.data) {
                console.error('서버 응답 오류 데이터:', error.response.data);
            }
            alert('게시글 등록에 실패했습니다.');
        }
    });

    updateCharCount(); // 초기 글자 수 업데이트
});

function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        const currentUrl = window.location.href;
        window.location.href = `./user/login.html?redirect=${encodeURIComponent(currentUrl)}`;
    }
}
