// Vercel Serverless Function — proxies /api/* requests to EC2 server
// This avoids Mixed Content issues (HTTPS Vercel → HTTP EC2)

const TARGET = 'http://3.95.226.54';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Extract path from URL — /api/auth/login → auth/login
  const fullPath = req.url.replace(/^\/?api\//, '').split('?')[0];
  const url = `${TARGET}/api/${fullPath}`;

  // Forward query string
  const qsIndex = req.url.indexOf('?');
  const queryString = qsIndex !== -1 ? req.url.substring(qsIndex) : '';

  try {
    // Build headers to forward
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Forward body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && typeof req.body === 'object') {
        fetchOptions.body = JSON.stringify(req.body);
      } else if (req.body) {
        fetchOptions.body = req.body;
      }
    }

    const response = await fetch(`${url}${queryString}`, fetchOptions);
    const data = await response.text();

    // Forward response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Forward CORS headers if present
    const corsOrigin = response.headers.get('access-control-allow-origin');
    if (corsOrigin) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    }

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ message: 'Bad Gateway', error: error.message });
  }
}
