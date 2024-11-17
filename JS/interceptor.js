
// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://114.70.216.57', // API 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증이 필요하지 않은 경로 정의
const publicPaths = ['/board/open-api/board', '/board/api/comments'];

// 요청 인터셉터: 요청마다 Access Token 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const isPublicRequest = publicPaths.some((path) => config.url.startsWith(path));

  // 인증이 필요한 요청에만 토큰 추가
  if (token && !isPublicRequest) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터: 401 응답 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response); // 성공적인 응답 출력
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Access Token이 만료된 경우 (401 오류)
    const isPublicRequest = publicPaths.some((path) => originalRequest.url.startsWith(path));
    if (error.response && error.response.status === 401 && !isPublicRequest) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const refreshSuccess = await refreshAccessToken();
        if (refreshSuccess) {
          // 새 Access Token을 요청 헤더에 추가
          const newToken = localStorage.getItem('accessToken');
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          console.log('New Access Token obtained:', newToken);

          // 실패했던 요청 재시도
          return apiClient(originalRequest);
        } else {
          console.error('Failed to refresh token. Redirecting to login...');
        }
      }
    }

    console.error('Error response:', error.response); // 오류 응답 출력
    return Promise.reject(error);
  }
);

// 토큰 갱신 함수
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.error('No refresh token found. Redirecting to login...');
    handleLogout();
    return false;
  }

  try {
    const response = await axios.post('http://114.70.216.57/open-api/token/reissue', { refreshToken });
    if (response.status === 200 && response.data.result.resultCode === 0) {
      const accessToken = response.data.body.token; // 갱신된 Access Token
      localStorage.setItem('accessToken', accessToken);
      console.log('Access Token successfully refreshed:', accessToken);
      return true;
    } else {
      console.error('Failed to refresh token. Response:', response.data);
      handleLogout();
      return false;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    handleLogout();
    return false;
  }
}

// 로그아웃 처리 함수
function handleLogout() {
  // 토큰 제거 및 로그인 페이지로 리디렉션
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = './user/login.html';
}

export default apiClient;
