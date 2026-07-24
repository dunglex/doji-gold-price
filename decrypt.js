const crypto = require('crypto');

const key = Buffer.from(
  '7a4b8c3d1e9f2a5b6c0d4e8f3a7b1c5d' +
  '9e2f6a0b4c8d3e7f1a5b9c2d6e0f4a8b',
  'hex'
);

const data = require('fs').readFileSync('gold_prices_doji_encrypted.json', 'utf8');
const encryptedData = JSON.parse(data).data;
const raw = Buffer.from(encryptedData, 'base64');

const iv = raw.subarray(0,16);
const ciphertext = raw.subarray(16);

const decipher = crypto.createDecipheriv(
  'aes-256-cbc',
  key,
  iv
);

let result =
  decipher.update(ciphertext) +
  decipher.final('utf8');

// write the decrypted data to a gold_prices_doji.json file
require('fs').writeFileSync('gold_prices_doji.json', JSON.stringify(JSON.parse(result), null, 2));