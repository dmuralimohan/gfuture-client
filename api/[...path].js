// Vercel Serverless Function — proxies /api/* requests to EC2 server
// This avoids Mixed Content issues (HTTPS Vercel → HTTP EC2)

const TARGET = 'http://3.95.226.54';

export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  const url = `${TARGET}/api/${apiPath}`;

  // Forward query string
  const queryString = new URL(req.url, `https://${req.headers.host}`).search || '';

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
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(`${url}${queryString}`, fetchOptions);
    const data = await response.text();

    // Forward response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ message: 'Bad Gateway', error: error.message });
  }
}
