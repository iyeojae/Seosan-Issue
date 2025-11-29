import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserInfo, logout, getAccessToken } from '../utils/auth';
import { usersAPI } from '../api/backend.api';
import './MyPage.css';

interface Post {
  postId: number;
  title: string;
  region: string;
  category: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  interactionAt?: string;
}

interface MyComment {
  commentId: number;
  postId: number;
  postTitle: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'likes' | 'comments'>('bookmarks');
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCounts, setTotalCounts] = useState({
    bookmarks: 0,
    likes: 0,
    comments: 0
  });
  const userInfo = getUserInfo();

  useEffect(() => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    fetchMyData();
  }, [navigate]);

  const fetchMyData = async () => {
    setLoading(true);
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      // 병렬로 세 가지 데이터 모두 가져오기
      const [bookmarksRes, likesRes, commentsRes] = await Promise.all([
        usersAPI.getMyBookmarks(accessToken, 0, 10),
        usersAPI.getMyLikes(accessToken, 0, 10),
        usersAPI.getMyComments(accessToken, 0, 10)
      ]);

      setBookmarkedPosts(bookmarksRes?.content || []);
      setLikedPosts(likesRes?.content || []);
      setMyComments(commentsRes?.content || []);

      setTotalCounts({
        bookmarks: bookmarksRes?.totalElements || 0,
        likes: likesRes?.totalElements || 0,
        comments: commentsRes?.totalElements || 0
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 에러 시 빈 배열 유지
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      alert('로그아웃되었습니다.');
      navigate('/');
    }
  };

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'WELFARE_SENIOR': '복지 - 어르신',
      'WELFARE_DISABLED': '복지 - 장애인',
      'WELFARE_WOMEN_FAMILY': '복지 - 여성가족',
      'WELFARE_CHILD_YOUTH': '복지 - 아동청소년',
      'WELFARE_YOUTH': '복지 - 청년',
      'HEALTH_WELLNESS': '보건/건강',
      'NOTICE': '공지사항',
      'PRESS_RELEASE': '보도자료',
      'CULTURE_NEWS': '문화소식',
      'CITY_TOUR': '시티투어',
      'TOUR_GUIDE': '관광/안내'
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="mypage">
      <div className="mypage-container">
        {/* 헤더 */}
        <div className="mypage-header">
          <h1 className="mypage-title">마이페이지</h1>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="user-info-card">
          <div className="user-avatar">
            {userInfo?.nickname?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="user-details">
            <h2 className="user-nickname">{userInfo?.nickname || '사용자'}</h2>
            <p className="user-email">{userInfo?.email || ''}</p>
          </div>
        </div>

        {/* 활동 섹션 (탭 방식) */}
        <div className="activity-section">
          <div className="activity-tabs">
            <button
              className={`activity-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              🔖 북마크 <span className="tab-count">{totalCounts.bookmarks}</span>
            </button>
            <button
              className={`activity-tab ${activeTab === 'likes' ? 'active' : ''}`}
              onClick={() => setActiveTab('likes')}
            >
              ❤️ 좋아요 <span className="tab-count">{totalCounts.likes}</span>
            </button>
            <button
              className={`activity-tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              💬 댓글 <span className="tab-count">{totalCounts.comments}</span>
            </button>
          </div>

          {loading ? (
            <div className="activity-loading">
              <div className="loading-spinner"></div>
              <p>불러오는 중...</p>
            </div>
          ) : (
            <div className="activity-content">
              {/* 북마크 탭 */}
              {activeTab === 'bookmarks' && (
                bookmarkedPosts.length === 0 ? (
                  <div className="activity-empty">
                    <div className="empty-icon">🔖</div>
                    <h3>저장한 게시글이 없습니다</h3>
                    <p>마음에 드는 게시글을 북마크해보세요!</p>
                    <button className="explore-btn" onClick={() => navigate('/explore')}>
                      게시글 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="posts-list">
                    {bookmarkedPosts.map((post) => (
                      <div
                        key={post.postId}
                        className="post-card"
                        onClick={() => navigate(`/explore?view=detail&id=${post.postId}`)}
                      >
                        <div className="post-category">
                          {getCategoryName(post.category)}
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span>📍 {post.region}</span>
                          <span>🕐 {formatDate(post.createdAt)}</span>
                          <span>👁️ {post.viewCount}</span>
                          {post.likeCount !== undefined && <span>❤️ {post.likeCount}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 좋아요 탭 */}
              {activeTab === 'likes' && (
                likedPosts.length === 0 ? (
                  <div className="activity-empty">
                    <div className="empty-icon">❤️</div>
                    <h3>좋아요한 게시글이 없습니다</h3>
                    <p>마음에 드는 게시글에 좋아요를 눌러보세요!</p>
                    <button className="explore-btn" onClick={() => navigate('/explore')}>
                      게시글 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="posts-list">
                    {likedPosts.map((post) => (
                      <div
                        key={post.postId}
                        className="post-card"
                        onClick={() => navigate(`/explore?view=detail&id=${post.postId}`)}
                      >
                        <div className="post-category">
                          {getCategoryName(post.category)}
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span>📍 {post.region}</span>
                          <span>🕐 {formatDate(post.createdAt)}</span>
                          <span>👁️ {post.viewCount}</span>
                          {post.likeCount !== undefined && <span>❤️ {post.likeCount}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 댓글 탭 */}
              {activeTab === 'comments' && (
                myComments.length === 0 ? (
                  <div className="activity-empty">
                    <div className="empty-icon">💬</div>
                    <h3>작성한 댓글이 없습니다</h3>
                    <p>게시글에 댓글을 남겨보세요!</p>
                    <button className="explore-btn" onClick={() => navigate('/explore')}>
                      게시글 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="comments-list-mypage">
                    {myComments.map((comment) => (
                      <div
                        key={comment.commentId}
                        className="comment-card"
                        onClick={() => navigate(`/explore?view=detail&id=${comment.postId}`)}
                      >
                        <div className="comment-post-title">{comment.postTitle}</div>
                        <p className="comment-content-mypage">{comment.content}</p>
                        <div className="comment-date">
                          🕐 {formatDate(comment.createdAt)}
                          {comment.updatedAt && ' (수정됨)'}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="stats-section">
          <div className="stat-card" onClick={() => setActiveTab('comments')}>
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <div className="stat-value">{totalCounts.comments}</div>
              <div className="stat-label">작성한 댓글</div>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('likes')}>
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <div className="stat-value">{totalCounts.likes}</div>
              <div className="stat-label">좋아요한 게시글</div>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('bookmarks')}>
            <div className="stat-icon">🔖</div>
            <div className="stat-info">
              <div className="stat-value">{totalCounts.bookmarks}</div>
              <div className="stat-label">저장한 게시글</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

