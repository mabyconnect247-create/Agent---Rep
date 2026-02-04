/*
  AgentRep Paper Agent Bot
  - Opens a paper trade via API
  - Waits holdSeconds
  - Closes it via API

  Env:
    AGENTREP_BASE_URL (default: https://agent-rep-gamma.vercel.app)
    AGENTREP_API_KEY  (required)

  Example:
    node paper-agent.js --mint <TOKEN_MINT> --mode SPOT --size 10 --tp 20 --sl 10 --holdSeconds 10
*/

const minimist = require('minimist');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(method, url, apiKey, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(`${msg} :: ${text.slice(0, 200)}`);
  }

  return json;
}

async function main() {
  const argv = minimist(process.argv.slice(2));

  const baseUrl = process.env.AGENTREP_BASE_URL || 'https://agent-rep-gamma.vercel.app';
  const apiKey = process.env.AGENTREP_API_KEY;
  if (!apiKey) {
    console.error('Missing env AGENTREP_API_KEY');
    process.exit(1);
  }

  const mint = String(argv.mint || '').trim();
  if (!mint) {
    console.error('Usage: node paper-agent.js --mint <TOKEN_MINT> [--mode SPOT|FUTURES] [--side LONG|SHORT] [--lev 5] [--size 10] [--tp 20] [--sl 10] [--holdSeconds 10]');
    process.exit(1);
  }

  const mode = String(argv.mode || 'SPOT').toUpperCase();
  const sizePct = Number(argv.size || 10);
  const tpPct = argv.tp === undefined ? 20 : Number(argv.tp);
  const slPct = argv.sl === undefined ? 10 : Number(argv.sl);
  const holdSeconds = Number(argv.holdSeconds || 10);

  const side = String(argv.side || 'LONG').toUpperCase();
  const leverage = Number(argv.lev || 5);

  console.log('Base URL:', baseUrl);
  console.log('Mode:', mode);
  console.log('Mint:', mint);

  const openPayload = {
    mint,
    mode,
    sizePct,
    tpPct,
    slPct,
  };

  if (mode === 'FUTURES') {
    openPayload.side = side;
    openPayload.leverage = leverage;
  }

  const opened = await req('POST', `${baseUrl}/api/eval/trades/open`, apiKey, openPayload);
  console.log('Opened trade:', opened?.trade?.id, 'entryPriceUsd:', opened?.trade?.entryPriceUsd);

  console.log(`Holding for ${holdSeconds}s...`);
  await sleep(holdSeconds * 1000);

  const tradeId = opened?.trade?.id;
  const closed = await req('POST', `${baseUrl}/api/eval/trades/close`, apiKey, { tradeId });

  console.log('Closed trade:', tradeId);
  console.log('PnL:', closed?.trade?.pnlPct?.toFixed?.(2) + '%', closed?.trade?.pnlUsd);
  console.log('Account equity:', closed?.account?.equityUsd);

  console.log('\nDone. Refresh dashboard to see it.');
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
