import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../api/backend.api';
import { isAuthenticated, getUserInfo, getAccessToken } from '../utils/auth';
import './Comments.css';

interface Author {
  userId: number;
  nickname: string;
}

interface Comment {
  commentId: number;
  content: string;
  author?: Author;
  createdAt: string;
  updatedAt?: string;
}

interface CommentsProps {
  postId: number;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = getUserInfo();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentsAPI.getList(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn || submitting) return;

    setSubmitting(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      await commentsAPI.create(postId, newComment.trim(), accessToken);
      setNewComment('');
      await fetchComments();
    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      if (error.message?.includes('401')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      await commentsAPI.update(postId, commentId, editContent.trim(), accessToken);
      setEditingCommentId(null);
      setEditContent('');
      await fetchComments();
    } catch (error: any) {
      console.error('댓글 수정 실패:', error);
      if (error.message?.includes('403')) {
        alert('본인의 댓글만 수정할 수 있습니다.');
      } else {
        alert('댓글 수정에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      await commentsAPI.delete(postId, commentId, accessToken);
      await fetchComments();
    } catch (error: any) {
      console.error('댓글 삭제 실패:', error);
      if (error.message?.includes('403')) {
        alert('본인의 댓글만 삭제할 수 있습니다.');
      } else {
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        댓글 <span className="comments-count">{comments.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
      {isLoggedIn ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
            <textarea
              className="comment-input"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>댓글을 작성하려면 <a href="/login">로그인</a>이 필요합니다.</p>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">댓글을 불러오는 중...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">첫 댓글을 작성해보세요!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentId} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author?.nickname || '익명'}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>

              {editingCommentId === comment.commentId ? (
                <div className="comment-edit-form">
                  <textarea
                    className="comment-edit-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-edit-actions">
                    <button
                      className="comment-save-btn"
                      onClick={() => handleEditComment(comment.commentId)}
                      disabled={submitting}
                    >
                      저장
                    </button>
                    <button
                      className="comment-cancel-btn"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-content">{comment.content}</p>
                  {currentUser && comment.author && currentUser.userId === comment.author.userId && (
                    <div className="comment-actions">
                      <button
                        className="comment-action-btn"
                        onClick={() => startEdit(comment)}
                      >
                        수정
                      </button>
                      <button
                        className="comment-action-btn delete"
                        onClick={() => handleDeleteComment(comment.commentId)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;

