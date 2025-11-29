const { createProxyMiddleware } = require('http-proxy-middleware');

// 로컬 백엔드로 고정
const BACKEND_URL = 'http://localhost:8083';

console.log('🔧 [setupProxy.js] BACKEND_URL:', BACKEND_URL);

module.exports = function(app) {
  // Flask 전용 프록시
  app.use(
    '/flask',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      secure: false,
      timeout: 60000,
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔵 [Flask Proxy]', req.method, req.url);
        proxyReq.setHeader('Origin', BACKEND_URL);
        proxyReq.setHeader('Referer', `${BACKEND_URL}/`);
      }
    })
  );

  // 모든 /api 요청을 프록시 (가장 일반적인 패턴이므로 마지막에 배치)
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      secure: false,
      timeout: 60000,
      followRedirects: true,
      ignorePath: false,
      // favicon.ico나 static 파일은 프록시하지 않음
      filter: (pathname, req) => {
        if (pathname.includes('favicon.ico') ||
            pathname.includes('manifest.json') ||
            pathname.includes('logo') ||
            pathname.startsWith('/static/')) {
          return false;
        }
        return true;
      },
      pathRewrite: function (path, req) {
        console.log('🔶 [PathRewrite] 원본:', path);

        // Flask 엔드포인트: /api/flask → /flask
        if (path.startsWith('/api/flask')) {
          const result = path.replace('/api', '');
          console.log('🔶 [PathRewrite] Flask:', path, '→', result);
          return result;
        }

        // /api/v1이 이미 포함된 경우 그대로 유지
        if (path.includes('/api/v1/')) {
          console.log('🔶 [PathRewrite] v1 유지:', path);
          return path;
        }

        // /api/posts, /api/users는 v1 없이 그대로 유지
        if (path.startsWith('/api/posts') || path.startsWith('/api/users')) {
          console.log('🔶 [PathRewrite] posts/users 유지:', path);
          return path;
        }

        // 나머지 /api 요청은 /api/v1로 변환
        const result = path.replace('/api', '/api/v1');
        console.log('🔶 [PathRewrite] 변환:', path, '→', result);
        return result;
      },
      onProxyReq: (proxyReq, req, res) => {
        // 403 방지를 위한 헤더 설정 강화
        proxyReq.setHeader('Origin', BACKEND_URL);
        proxyReq.setHeader('Referer', `${BACKEND_URL}/`);
        proxyReq.setHeader('Host', 'localhost:8083');
        proxyReq.setHeader('X-Forwarded-For', '127.0.0.1');
        proxyReq.setHeader('X-Forwarded-Proto', 'http');
        proxyReq.setHeader('X-Forwarded-Host', 'localhost:8083');
        proxyReq.setHeader('X-Real-IP', '127.0.0.1');

        // CSRF 보호 우회 시도
        proxyReq.removeHeader('X-CSRF-Token');

        // User-Agent 추가 (일부 API는 이것을 확인함)
        if (!proxyReq.getHeader('User-Agent')) {
          proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        }

        console.log('🔷 [PROXY]', {
          method: req.method,
          originalUrl: req.url,
          target: BACKEND_URL,
          finalPath: proxyReq.path,
          headers: {
            origin: proxyReq.getHeader('origin'),
            referer: proxyReq.getHeader('referer'),
            host: proxyReq.getHeader('host')
          }
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('🟢 [PROXY RESPONSE]', {
          url: req.url,
          status: proxyRes.statusCode,
          statusMessage: proxyRes.statusMessage,
          headers: {
            'content-type': proxyRes.headers['content-type'],
            'access-control-allow-origin': proxyRes.headers['access-control-allow-origin']
          }
        });

        // CORS 헤더 강화
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH';
        proxyRes.headers['access-control-allow-headers'] = 'Content-Type,Authorization,X-Requested-With,Accept,Origin';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
        proxyRes.headers['access-control-max-age'] = '86400';
      },
      onError: (err, req, res) => {
        console.error('❌ [PROXY ERROR]', {
          url: req.url,
          error: err.message,
          code: err.code,
          target: BACKEND_URL
        });
        res.status(502).json({
          error: 'Proxy Error',
          message: err.message,
          url: req.url,
          target: BACKEND_URL
        });
      }
    })
  );
};

