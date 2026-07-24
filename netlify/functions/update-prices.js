const https = require('https');

exports.handler = async () => {
  const url = new URL(process.env.URL || 'http://localhost:8888');
  url.pathname = '/api/prices';

  return new Promise((resolve, reject) => {
    https.get(url.toString(), (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: data
        });
      });
    }).on('error', reject);
  });
};
