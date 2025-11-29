import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/backend.api';
import './SignupPage.css';

interface SignupFormData {
  nickname: string;  // 명세서에 맞게 nickname 사용
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

interface SignupResponse {
  userId: number;
  email: string;
  nickname: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

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
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    // 닉네임 검증 (2자 이상 50자 이하)
    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
    } else if (formData.nickname.length > 50) {
      newErrors.nickname = '닉네임은 50자 이하여야 합니다.';
    }

    // 이메일 검증 (필수, 이메일 형식)
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증 (최소 8자 이상)
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 약관 동의
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
    setApiError('');

    try {
      console.log('📝 회원가입 시도:', {
        email: formData.email,
        nickname: formData.nickname
      });

      // API 호출 (명세서에 맞게 email, password, nickname만 전송)
      const response: SignupResponse = await usersAPI.signup(
        formData.email,
        formData.password,
        formData.nickname
      );

      console.log('✅ 회원가입 성공:', response);

      // 회원가입 성공 메시지
      alert(`회원가입 성공! 🎉\n환영합니다, ${response.nickname}님!`);

      // 로그인 페이지로 이동
      navigate('/login');
    } catch (error: any) {
      console.error('❌ 회원가입 에러:', error);

      if (error.message?.includes('409') || error.message?.includes('Conflict')) {
        setApiError('이미 사용 중인 이메일입니다.');
      } else if (error.message?.includes('400')) {
        setApiError('입력한 정보가 올바르지 않습니다. 다시 확인해주세요.');
      } else if (error.message?.includes('Network')) {
        setApiError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setApiError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
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
            <label htmlFor="nickname" className="form-label">
              닉네임 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className={`form-input ${errors.nickname ? 'input-error' : ''}`}
              placeholder="닉네임을 입력하세요 (2-50자)"
              value={formData.nickname}
              onChange={handleInputChange}
              disabled={isLoading}
              minLength={2}
              maxLength={50}
            />
            {errors.nickname && <span className="error-message">{errors.nickname}</span>}
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
            <label htmlFor="password" className="form-label">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="8자 이상 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              minLength={8}
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

