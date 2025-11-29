import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
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

    try {
      // TODO: API 연동
      // const response = await loginAPI(formData);

      // 임시 로그인 로직 (2초 딜레이)
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('로그인 데이터:', formData);

      // 로그인 성공 시 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      setErrors({ email: '로그인에 실패했습니다. 다시 시도해주세요.' });
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

