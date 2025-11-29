// 로컬 백엔드만 사용
const BACKEND_URL = 'http://localhost:8083';
const API_BASE_URL = '/api';  // 프록시가 /api를 /api/v1로 변환

// 초기화 시 설정 확인
console.log('🔧 [backend.api.js 초기화]', {
  BACKEND_URL,
  API_BASE_URL,
  description: 'setupProxy.js가 /api를 /api/v1로 변환합니다'
});

// 카테고리 상수 정의
export const POST_CATEGORIES = {
  // 복지
  WELFARE_SENIOR: 'WELFARE_SENIOR',           // 복지-어르신
  WELFARE_DISABLED: 'WELFARE_DISABLED',       // 복지-장애인
  WELFARE_WOMEN_FAMILY: 'WELFARE_WOMEN_FAMILY', // 복지-여성가족
  WELFARE_CHILD_YOUTH: 'WELFARE_CHILD_YOUTH',  // 복지-아동청소년
  WELFARE_YOUTH: 'WELFARE_YOUTH',             // 복지-청년
  // 서산시청
  HEALTH_WELLNESS: 'HEALTH_WELLNESS',         // 보건/건강
  NOTICE: 'NOTICE',                           // 공지사항
  PRESS_RELEASE: 'PRESS_RELEASE',             // 보도자료
  // 문화
  CULTURE_NEWS: 'CULTURE_NEWS',               // 문화소식
  CITY_TOUR: 'CITY_TOUR',                     // 시티투어
  TOUR_GUIDE: 'TOUR_GUIDE'                    // 관광/안내
};

// 공통 fetch 함수
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔵 API 요청:', {
    url,
    method: options.method || 'GET',
    endpoint,
    API_BASE_URL,
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('🟢 API 응답:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // 204 No Content 또는 빈 응답 처리
    if (response.status === 204) {
      console.log('✅ API 성공 (No Content):', { url });
      return null;
    }

    // 응답 본문을 텍스트로 먼저 읽어서 확인
    const text = await response.text();
    console.log('📄 응답 본문 (처음 200자):', text.substring(0, 200));

    // 빈 응답 처리
    if (!text || text.trim() === '') {
      console.log('✅ API 성공 (Empty Response):', { url });
      return null;
    }

    // JSON 파싱 시도
    try {
      const data = JSON.parse(text);
      console.log('✅ API 데이터:', { url, dataLength: Array.isArray(data) ? data.length : 'object' });
      return data;
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', {
        url,
        responseText: text.substring(0, 500),
        error: parseError.message
      });
      throw new Error(`JSON 파싱 실패: ${parseError.message}. 응답: ${text.substring(0, 100)}`);
    }
  } catch (error) {
    console.error('❌ API 호출 실패:', {
      endpoint,
      url,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// 네이버 검색 API
export const naverSearchAPI = {
  search: async (query, types = 'news', display = 5) => {
    console.log('🔍 네이버 검색 API 호출 시작:', { query, types, display });

    const params = new URLSearchParams({
      q: query,
      types,
      display: display.toString()
    });

    const endpoint = `/v1/explore/naver?${params}`;
    console.log('🔍 생성된 엔드포인트:', endpoint);
    console.log('🔍 최종 URL:', `${API_BASE_URL}${endpoint}`);

    try {
      const result = await fetchAPI(endpoint);
      console.log('🔍 네이버 검색 결과:', {
        resultType: Array.isArray(result) ? 'array' : typeof result,
        length: Array.isArray(result) ? result.length : 'N/A'
      });
      return result;
    } catch (error) {
      console.error('🔍 네이버 검색 실패:', error);
      throw error;
    }
  },

  // 네이버 데일리 트렌드
  getDailyTrend: async (startDate = '2023-01-01', endDate = '2025-11-29', keywords) => {
    return fetchAPI(`/v1/naver-search/daily-trend?startDate=${startDate}&endDate=${endDate}`, {
      method: 'POST',
      body: JSON.stringify(keywords)
    });
  },

  // 네이버 주간 트렌드
  getWeeklyTrend: async (startDate = '2023-01-01', endDate = '2025-11-29', keywords) => {
    return fetchAPI(`/v1/naver-search/weekly-trend?startDate=${startDate}&endDate=${endDate}`, {
      method: 'POST',
      body: JSON.stringify(keywords)
    });
  }
};

// AI 검색 API
export const aiSearchAPI = {
  // AI 검색 간략 (One-Shot)
  searchBrief: async (query, maxExternal = 3) => {
    try {
      console.log('AI 간략 검색 API 호출, query:', query);
      const data = await fetchAPI('/v1/ai-search', {
        method: 'POST',
        body: JSON.stringify({ query, maxExternal })
      });
      console.log('AI 간략 검색 응답:', data);
      return data;
    } catch (error) {
      console.error('AI 간략 검색 API 호출 실패:', error);
      return {
        summary: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        sources: []
      };
    }
  },

  // AI 검색 상세 (Map-Reduce)
  searchDetail: async (query, maxExternal = 3) => {
    try {
      console.log('AI 상세 검색 API 호출, query:', query);
      const data = await fetchAPI('/v1/ai-search/detail', {
        method: 'POST',
        body: JSON.stringify({ query, maxExternal })
      });
      console.log('AI 상세 검색 응답:', data);
      return data;
    } catch (error) {
      console.error('AI 상세 검색 API 호출 실패:', error);
      return {
        finalSummary: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        documentSummaries: [],
        sources: []
      };
    }
  },
  
  // 프롬프트 미리보기 (디버깅용)
  getPreview: async (query, maxExternal = 3) => {
    return fetchAPI(`/v1/ai-search/preview?query=${encodeURIComponent(query)}&maxExternal=${maxExternal}`);
  },

  // 단건 URL 요약
  summarizeUrl: async (url) => {
    return fetchAPI('/v1/explore/summary', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  },

  // 배치 URL 요약
  summarizeUrls: async (urls) => {
    return fetchAPI('/v1/explore/summary/batch', {
      method: 'POST',
      body: JSON.stringify({ urls })
    });
  },

  // 요약 AI - Flask 엔드포인트 사용 (BART 모델)
  summarize: async (text) => {
    try {
      const data = await fetchAPI('/flask/summarize', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      return data;
    } catch (error) {
      console.error('요약 AI 호출 실패:', error);
      throw error;
    }
  }
};

// 게시글 API
export const postsAPI = {
  // 게시글 목록 조회
  getList: async (page = 1) => {
    return fetchAPI(`/posts/${page}`);
  },
  
  // 게시글 상세 조회
  getDetail: async (postId) => {
    try {
      console.log(`🔍 게시글 상세 조회: ${postId}`);
      const data = await fetchAPI(`/posts/${postId}`);
      console.log(`✅ 게시글 상세 조회 성공:`, data);
      return data;
    } catch (error) {
      console.error('❌ 게시글 상세 조회 실패:', error);
      throw error;
    }
  },
  
  // 게시물 목록 조회 (필터링)
  getFilteredList: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return fetchAPI(`/posts/filtered?${queryParams}`);
  },
  
  // 카테고리별 게시물 조회 (새로운 API)
  getByCategory: async (category, region = '대산읍', page = 0, size = 5) => {
    const params = new URLSearchParams({
      category,
      page: page.toString(),
      size: size.toString()
    });
    if (region && region !== 'null') {
      params.set('region', region);
    }

    try {
      console.log(`🔍 카테고리별 게시물 조회: ${category}, region: ${region}, page: ${page}, size: ${size}`);
      const data = await fetchAPI(`/posts?${params.toString()}`);
      console.log(`✅ 카테고리별 게시물 조회 성공 (${category}):`, data);
      // content 배열만 반환 (페이지네이션 정보가 필요하면 전체 data 반환)
      return data.content || [];
    } catch (error) {
      console.error(`❌ 카테고리별 게시물 조회 실패 (${category}):`, error);
      throw error;
    }
  }
};

// 날씨 API
export const weatherAPI = {
  // 초단기실황 날씨 조회
  getCurrentWeather: async (region = '해미면') => {
    return fetchAPI(`/v1/weather/ncst?region=${encodeURIComponent(region)}`);
  },

  // 초단기예보 날씨 조회
  getForecastWeather: async (region = '해미면') => {
    return fetchAPI(`/v1/weather/fcst?region=${encodeURIComponent(region)}`);
  },

  // 도시 전체 날씨 조회
  getCityWeather: async (city = '서산시') => {
    return fetchAPI(`/v1/weather/ncst?city=${encodeURIComponent(city)}`);
  },

  // 레거시 호환성 유지
  getByLocation: async (region = '해미면') => {
    return fetchAPI(`/v1/weather/ncst?region=${encodeURIComponent(region)}`);
  }
};

// 콘텐츠 통계 API
export const statsAPI = {
  // 콘텐츠 통계 조회 - Flask 엔드포인트
  getContentStats: async () => {
    try {
      console.log('📊 콘텐츠 통계 조회 시작');
      const data = await fetchAPI('/flask/content_stats');
      console.log('✅ 콘텐츠 통계 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 콘텐츠 통계 로드 실패:', error);
      return null;
    }
  }
};

// 지역 정보 API
export const regionAPI = {
  // 지역별로 조회 (페이징)
  getByRegion: async (region, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return fetchAPI(`/regions/${region}?${params}`);
  }
};

// 메인페이지 API
export const mainPageAPI = {
  // 일간/주간 검색어 - Flask 엔드포인트 사용 (프록시 경유)
  getTrendingKeywords: async (period = 'daily') => {
    try {
      console.log('🔥 트렌딩 키워드 API 요청 시작');

      const data = await fetchAPI('/flask/crawl_popular_terms');
      console.log('✅ 트렌딩 키워드 로드 성공:', data);

      return data;
    } catch (error) {
      console.error('❌ 트렌딩 키워드 로드 실패:', error);

      // 백엔드 문제 시 하드코딩된 데이터 반환 (임시 조치)
      console.log('백엔드 에러로 인해 기본 데이터 사용');
      return {
        daily: ["임용식", "한우", "신규", "폐기물", "영화", "봉사활동", "급식왕", "사회복지시설", "분리배출", "인구"],
        weekly: ["채용공고", "채용", "폐기물", "취업자격증", "강우량", "조직도", "인사발령", "전기차", "관아문", "공고"]
      };
    }
  }
};

// 크롤링 API
export const crawlingAPI = {
  getCrawledData: async (source) => {
    return fetchAPI(`/crawl/${source}`);
  }
};

// 복지 정보 API (새로운 엔드포인트 사용)
export const welfareAPI = {
  // 복지-어르신
  getElderly: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.WELFARE_SENIOR, region, page, size);
  },
  
  // 복지-장애인
  getDisabled: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.WELFARE_DISABLED, region, page, size);
  },
  
  // 복지-여성가족
  getWomenFamily: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.WELFARE_WOMEN_FAMILY, region, page, size);
  },
  
  // 복지-아동청소년
  getChildYouth: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.WELFARE_CHILD_YOUTH, region, page, size);
  },
  
  // 복지-청년
  getYouth: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.WELFARE_YOUTH, region, page, size);
  }
};

// 서산시청 정보 API (새로운 엔드포인트 사용)
export const seosanAPI = {
  // 보건/건강
  getHealth: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.HEALTH_WELLNESS, region, page, size);
  },
  
  // 공지사항
  getNotices: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.NOTICE, region, page, size);
  },
  
  // 보도자료
  getPressRelease: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.PRESS_RELEASE, region, page, size);
  }
};

// 문화 정보 API (새로운 추가)
export const cultureAPI = {
  // 문화소식
  getCultureNews: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.CULTURE_NEWS, region, page, size);
  },
  
  // 시티투어
  getCityTour: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.CITY_TOUR, region, page, size);
  },
  
  // 관광/안내
  getTourGuide: async (region = '대산읍', page = 0, size = 5) => {
    return postsAPI.getByCategory(POST_CATEGORIES.TOUR_GUIDE, region, page, size);
  }
};

// 사용자 인증 API
export const usersAPI = {
  // 회원가입
  signup: async (email, password, nickname) => {
    return fetchAPI('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname })
    });
  },

  // 로그인
  login: async (email, password) => {
    return fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    return fetchAPI('/users/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  // 내 정보 조회 (인증 필요)
  getMe: async (accessToken) => {
    return fetchAPI('/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 회원 탈퇴 (인증 필요)
  deleteMe: async (accessToken) => {
    return fetchAPI('/users/me', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 내가 북마크한 게시글 조회
  getMyBookmarks: async (accessToken, page = 0, size = 10) => {
    return fetchAPI(`/users/me/bookmarks?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 내가 좋아요한 게시글 조회
  getMyLikes: async (accessToken, page = 0, size = 10) => {
    return fetchAPI(`/users/me/likes?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 내가 작성한 댓글 조회
  getMyComments: async (accessToken, page = 0, size = 10) => {
    return fetchAPI(`/users/me/comments?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
};

// 댓글 API
export const commentsAPI = {
  // 댓글 목록 조회
  getList: async (postId) => {
    return fetchAPI(`/posts/${postId}/comments`);
  },

  // 댓글 작성 (인증 필요)
  create: async (postId, content, accessToken) => {
    return fetchAPI(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 댓글 수정 (인증 필요)
  update: async (postId, commentId, content, accessToken) => {
    return fetchAPI(`/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 댓글 삭제 (인증 필요)
  delete: async (postId, commentId, accessToken) => {
    return fetchAPI(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
};

// 좋아요 API
export const likesAPI = {
  // 좋아요 추가 (인증 필요)
  add: async (postId, accessToken) => {
    return fetchAPI(`/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 좋아요 취소 (인증 필요)
  remove: async (postId, accessToken) => {
    return fetchAPI(`/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
};

// 북마크 API
export const bookmarksAPI = {
  // 북마크 추가 (인증 필요)
  add: async (postId, accessToken) => {
    return fetchAPI(`/posts/${postId}/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

  // 북마크 삭제 (인증 필요)
  remove: async (postId, accessToken) => {
    return fetchAPI(`/posts/${postId}/bookmarks`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
};

export default {
  naverSearchAPI,
  aiSearchAPI,
  postsAPI,
  weatherAPI,
  statsAPI,
  regionAPI,
  mainPageAPI,
  crawlingAPI,
  welfareAPI,
  seosanAPI,
  cultureAPI,
  usersAPI,
  commentsAPI,
  likesAPI,
  bookmarksAPI,
  POST_CATEGORIES
};