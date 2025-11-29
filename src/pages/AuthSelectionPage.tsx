import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthSelectionPage.css';

// 이미지 import - 이미지 파일을 assets 폴더에 추가해주세요
// import characterLeft from '../../assets/character-left-full.png';
// import characterRight from '../../assets/character-right-small.png';

const AuthSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="auth-selection-page">
      {/* 왼쪽 캐릭터 섹션 */}
      <div className="character-section">
        <div className="character-placeholder">
          {/* 왼쪽 큰 캐릭터 이미지 (말풍선 포함) */}
          {/* <img src={characterLeft} alt="캐릭터" className="character-img" /> */}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {/* 로고 */}
        <div className="logo-large">
          <span className="logo-text-kr">서산에</span>
          <span className="logo-space"></span>
          <span className="logo-text-kr">뭐</span>
          <span className="logo-emoji-wrapper">
          </span>
          <span className="logo-text-en">issue</span>
          <span className="logo-question">?</span>
        </div>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <button
            className="auth-button signup-button"
            onClick={handleSignupClick}
          >
            회원가입
          </button>
          <button
            className="auth-button login-button"
            onClick={handleLoginClick}
          >
            로그인
          </button>
        </div>

        {/* 오른쪽 작은 캐릭터 */}
        <div className="small-character">
          {/* 오른쪽 작은 캐릭터 이미지 */}
          {/* <img src={characterRight} alt="작은 캐릭터" className="small-character-img" /> */}
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;

