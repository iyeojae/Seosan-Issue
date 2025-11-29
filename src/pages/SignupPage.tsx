import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name as keyof SignupFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '이용약관에 동의해주세요.';
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요.';
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
      // const response = await signupAPI(formData);

      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('회원가입 데이터:', formData);

      // 회원가입 성공 시 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setErrors({ email: '회원가입에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <button className="back-button" onClick={handleBackToAuth}>
            ← 뒤로
          </button>
          <h1 className="signup-title">회원가입</h1>
          <p className="signup-subtitle">서산시민을 위한 종합 정보 플랫폼에 가입하세요</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일 <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              전화번호 <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="영문, 숫자 포함 8자 이상"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className={`form-input ${errors.passwordConfirm ? 'input-error' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {errors.passwordConfirm && (
              <span className="error-message">{errors.passwordConfirm}</span>
            )}
          </div>

          <div className="agreement-section">
            <div className="agreement-item">
              <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>이용약관에 동의합니다 (필수)</span>
              </label>
              {errors.agreeTerms && (
                <span className="error-message">{errors.agreeTerms}</span>
              )}
            </div>

            <div className="agreement-item">
              <label className={`checkbox-label ${errors.agreePrivacy ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>개인정보처리방침에 동의합니다 (필수)</span>
              </label>
              {errors.agreePrivacy && (
                <span className="error-message">{errors.agreePrivacy}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <button
              className="link-button"
              onClick={handleGoToLogin}
              disabled={isLoading}
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

