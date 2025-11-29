import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
// @ts-ignore
import Header from './Header/Header.jsx';
import { LoadingSpinner } from './components/LoadingStates';

// Lazy loading으로 초기 번들 크기 감소
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const AiSearchPage = lazy(() => import('./pages/AiSearchPage'));
const AuthSelectionPage = lazy(() => import('./pages/AuthSelectionPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const Footer = lazy(() => import('./components/Footer'));
// @ts-ignore
const TestNaverAPI = lazy(() => import('./TestNaverAPI'));
// @ts-ignore
const ApiTest = lazy(() => import('./components/ApiTest'));
// @ts-ignore
const ApiStatusCheck = lazy(() => import('./components/ApiStatusCheck'));

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner size="large" message="페이지를 불러오고 있습니다..." />}>
            <Routes>
              {/* 인증 페이지 - Header/Footer 없음 */}
              <Route path="/auth" element={<AuthSelectionPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* 일반 페이지 - Header/Footer 포함 */}
              <Route
                path="/*"
                element={
                  <div className="App">
                    <Header />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/ai-search" element={<AiSearchPage />} />
                      <Route path="/mypage" element={<MyPage />} />
                      <Route path="/test-naver" element={<TestNaverAPI />} />
                      <Route path="/api-test" element={<ApiTest />} />
                      <Route path="/api-status" element={<ApiStatusCheck />} />
                    </Routes>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;