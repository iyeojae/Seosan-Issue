import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/backend.api';
import { saveTokens, saveUserInfo } from '../utils/auth';
import './LoginPage.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 제거
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      console.log('🔐 로그인 시도:', { email: formData.email });

      // API 호출
      const response: LoginResponse = await usersAPI.login(formData.email, formData.password);

      console.log('✅ 로그인 성공:', response);

      // 토큰 저장 (auth 유틸리티 사용)
      saveTokens(response.accessToken, response.refreshToken, response.tokenType);

      // 사용자 정보 조회 (선택사항)
      try {
        const userInfo = await usersAPI.getMe(response.accessToken);
        saveUserInfo(userInfo);
        console.log('✅ 사용자 정보:', userInfo);
      } catch (error) {
        console.warn('⚠️ 사용자 정보 조회 실패 (로그인은 성공):', error);
      }

      // 로그인 성공 메시지
      alert('로그인 성공! 환영합니다 🎉');

      // 메인 페이지로 이동
      navigate('/');
    } catch (error: any) {
      console.error('❌ 로그인 에러:', error);

      if (error.message?.includes('401')) {
        setApiError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (error.message?.includes('403')) {
        setApiError('계정이 비활성화되었습니다. 관리자에게 문의하세요.');
      } else if (error.message?.includes('Network')) {
        setApiError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setApiError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  const handleGoToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-button" onClick={handleBackToAuth}>
            ← 뒤로
          </button>
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">서산에 뭐 issue?에 오신 것을 환영합니다!</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* API 에러 메시지 표시 */}
          {apiError && (
            <div className="api-error-message" style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#c33',
              fontSize: '14px'
            }}>
              ⚠️ {apiError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>로그인 상태 유지</span>
            </label>
            <a href="#" className="forgot-password">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            계정이 없으신가요?{' '}
            <button
              className="link-button"
              onClick={handleGoToSignup}
              disabled={isLoading}
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

