# Download gold prices from Doji
curl 'https://banggia.doji.vn/api/TablePrice/GetTablePrice' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9,cs;q=0.8' \
  -H 'Authorization: Bearer null' \
  -H 'Connection: keep-alive' \
  -H 'Referer: https://banggia.doji.vn/gold-price' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0' \
  -H 'sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' > gold_prices_doji_encrypted.json

# Download gold prices from SJC
curl 'https://sjc.com.vn/GoldPrice/Services/PriceService.ashx' \
  -X 'POST' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-length: 0' \
  -H 'origin: https://sjc.com.vn' \
  -H 'pragma: no-cache' \
  -H 'priority: u=1, i' \
  -H 'referer: https://sjc.com.vn/' \
  -H 'sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' > gold_prices_sjc.json
