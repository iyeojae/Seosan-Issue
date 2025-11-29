// 인증 관련 유틸리티 함수

/**
 * 로그인 여부 확인
 */
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
};

/**
 * Access Token 가져오기
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Refresh Token 가져오기
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * 토큰 저장
 */
export const saveTokens = (accessToken: string, refreshToken: string, tokenType: string = 'Bearer'): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenType', tokenType);
};

/**
 * 사용자 정보 저장
 */
export const saveUserInfo = (userInfo: any): void => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * 사용자 정보 가져오기
 */
export const getUserInfo = (): any | null => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return null;
  }
};

/**
 * 로그아웃 (모든 인증 정보 삭제)
 */
export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userInfo');
};

/**
 * Authorization 헤더 생성
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getAccessToken();
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';

  if (!token) {
    return {};
  }

  return {
    'Authorization': `${tokenType} ${token}`
  };
};

export default {
  isAuthenticated,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUserInfo,
  getUserInfo,
  logout,
  getAuthHeader
};

