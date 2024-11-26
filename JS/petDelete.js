document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('petId');
  const accessToken = localStorage.getItem('accessToken');
  const responseMessage = document.getElementById('response-message');

  if (!accessToken || !petId) {
    responseMessage.textContent = '로그인 또는 유효한 반려동물 ID가 필요합니다.';
    responseMessage.style.display = 'block';
    return;
  }

  document.getElementById('delete-confirm-btn').addEventListener('click', async function () {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://114.70.216.57/pet/api/pet/unregister/${petId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.result.resultCode === 200) {
        responseMessage.textContent = '반려동물이 삭제되었습니다.';
        responseMessage.style.display = 'block';
        setTimeout(() => {
          window.location.href = './petlist.html';
        }, 1000);
      } else {
        responseMessage.textContent = '삭제 실패: ' + data.result.resultMessage;
        responseMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      responseMessage.textContent = '오류 발생: 반려동물 삭제 실패';
      responseMessage.style.display = 'block';
    }
  });
});
