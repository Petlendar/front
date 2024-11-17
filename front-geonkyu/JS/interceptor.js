// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://114.70.216.57', // API 기본 URL 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 요청마다 Access Token 추가
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('Request:', config); // 요청 정보 출력
  }
  return config;
});

// 응답 인터셉터: 401 응답 시 토큰 갱신 로직 실행
apiClient.interceptors.response.use(
  response => {
    console.log('Response received:', response); // 성공적인 응답 출력
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Access Token이 만료된 경우 (401 오류)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('Access token expired, attempting to refresh...'); // 토큰 만료 로그
      originalRequest._retry = true; // 중복 갱신 요청 방지

      const refreshSuccess = await refreshAccessToken();
      if (refreshSuccess) {
        const newToken = localStorage.getItem('accessToken');
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        console.log('New Access Token obtained:'); // 새 Access Token 로그
        return apiClient(originalRequest); // 실패했던 요청 재시도
      } else {
        console.error('Failed to refresh token. Redirecting to login...'); // 갱신 실패 로그
      }
    }
    console.error('Error response:', error.response); // 오류 응답 출력
    return Promise.reject(error);
  }
);

// 토큰 갱신 함수
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    const response = await axios.post('http://114.70.216.57/open-api/token/reissue', { refreshToken });
    if (response.status === 200 && response.data.result.resultCode === 0) {
      const accessToken = response.data.body.token; // 갱신된 Access Token
      localStorage.setItem('accessToken', accessToken);
      console.log('Access Token successfully refreshed:', accessToken); // 갱신된 Access Token 로그
      return true;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    
    // 토큰 갱신 실패 시 로그아웃 처리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = './user/login.html'; // 로그인 페이지로 이동
    return false;
  }
}

export default apiClient;
