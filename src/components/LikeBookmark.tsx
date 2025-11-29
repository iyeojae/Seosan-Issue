import React, { useState, useEffect } from 'react';
import { likesAPI, bookmarksAPI } from '../api/backend.api';
import { isAuthenticated, getAccessToken } from '../utils/auth';
import './LikeBookmark.css';

interface LikeBookmarkProps {
  postId: number;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
}

const LikeBookmark: React.FC<LikeBookmarkProps> = ({
  postId,
  initialLiked = false,
  initialBookmarked = false
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [processing, setProcessing] = useState(false);

  const isLoggedIn = isAuthenticated();

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
      return;
    }

    if (processing) return;

    setProcessing(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      if (liked) {
        await likesAPI.remove(postId, accessToken);
        setLiked(false);
      } else {
        await likesAPI.add(postId, accessToken);
        setLiked(true);
      }
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error);
      if (error.message?.includes('401')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      } else {
        alert('좋아요 처리에 실패했습니다.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
      return;
    }

    if (processing) return;

    setProcessing(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      if (bookmarked) {
        await bookmarksAPI.remove(postId, accessToken);
        setBookmarked(false);
      } else {
        await bookmarksAPI.add(postId, accessToken);
        setBookmarked(true);
      }
    } catch (error: any) {
      console.error('북마크 처리 실패:', error);
      if (error.message?.includes('401')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      } else {
        alert('북마크 처리에 실패했습니다.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="like-bookmark-container">
      <button
        className={`action-btn like-btn ${liked ? 'active' : ''}`}
        onClick={handleLike}
        disabled={processing}
        title={liked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          className="action-icon"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="action-text">{liked ? '좋아요' : '좋아요'}</span>
      </button>

      <button
        className={`action-btn bookmark-btn ${bookmarked ? 'active' : ''}`}
        onClick={handleBookmark}
        disabled={processing}
        title={bookmarked ? '북마크 취소' : '북마크'}
      >
        <svg
          className="action-icon"
          viewBox="0 0 24 24"
          fill={bookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="action-text">{bookmarked ? '저장됨' : '저장'}</span>
      </button>
    </div>
  );
};

export default LikeBookmark;

