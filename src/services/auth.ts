// 인증 관련 API 서비스

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8083';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

/**
 * 로그인 API
 */
export const loginAPI = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('로그인에 실패했습니다.');
    }

    const data = await response.json();

    // 토큰을 로컬스토리지에 저장
    if (data.data?.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

/**
 * 회원가입 API
 */
export const signupAPI = async (signupData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      throw new Error('회원가입에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Signup API Error:', error);
    throw error;
  }
};

/**
 * 로그아웃 API
 */
export const logoutAPI = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');

    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // 로컬스토리지 클리어
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout API Error:', error);
    // 에러가 발생해도 로컬 데이터는 삭제
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

/**
 * 토큰 검증 API
 */
export const verifyTokenAPI = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Verify Token API Error:', error);
    return false;
  }
};

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

/**
 * 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

/**
 * 인증 토큰 가져오기
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

