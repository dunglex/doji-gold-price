const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const https = require('https');
const http = require('http');

const CURL = path.join(__dirname, 'curl-impersonate');

const KEY = Buffer.from(
  '7a4b8c3d1e9f2a5b6c0d4e8f3a7b1c5d' +
  '9e2f6a0b4c8d3e7f1a5b9c2d6e0f4a8b',
  'hex'
);

function curl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const args = ['--compressed', '--impersonate', 'chrome146'];
    for (const [k, v] of Object.entries(headers)) {
      args.push('-H', `${k}: ${v}`);
    }
    args.push(url);

    const child = spawn(CURL, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`curl exited ${code}: ${stderr}`));
      resolve(stdout);
    });
  });
}

function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, {
      method: opts.method || 'GET',
      headers: opts.headers || {}
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 200)}`));
        } else {
          resolve(text);
        }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

function decryptDoji(encryptedBase64) {
  const raw = Buffer.from(encryptedBase64, 'base64');
  const iv = raw.subarray(0, 16);
  const ciphertext = raw.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  let result = decipher.update(ciphertext) + decipher.final('utf8');
  return JSON.parse(result);
}

async function fetchDoji() {
  const text = await curl('https://banggia.doji.vn/api/TablePrice/GetTablePrice', {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Authorization': 'Bearer null',
    'Connection': 'keep-alive',
    'Referer': 'https://banggia.doji.vn/gold-price',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
    'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  });
  const parsed = JSON.parse(text);
  return decryptDoji(parsed.data);
}

async function fetchSjc() {
  const text = await curl('https://sjc.com.vn/GoldPrice/Services/PriceService.ashx', {
    method: 'POST',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'content-length': '0',
    'origin': 'https://sjc.com.vn',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://sjc.com.vn/',
    'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
  });
  return JSON.parse(text);
}

async function fetchGoldprice() {
  try {
    const text = await curl('https://data-asg.goldprice.org/dbXRates/USD', {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'origin': 'https://goldprice.org',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://goldprice.org/',
      'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
    });
    return JSON.parse(text);
  } catch (e) {
    return { error: e.message };
  }
}

exports.handler = async () => {
  try {
    const [doji, sjc, goldprice] = await Promise.all([
      fetchDoji(),
      fetchSjc(),
      fetchGoldprice()
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      },
      body: JSON.stringify({ doji, sjc, goldprice })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
