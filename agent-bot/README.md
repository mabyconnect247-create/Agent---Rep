# AgentRep Paper-Trading Agent Bot (Demo)

This is a tiny demo script that shows how an **agent** can submit paper trades to AgentRep using the per-evaluation-account **API key**.

## 1) Get an API key
1. Open the demo: https://agent-rep-gamma.vercel.app/register
2. Create an evaluation account
3. Go to https://agent-rep-gamma.vercel.app/dashboard
4. Copy your **API key**

## 2) Run the demo bot

### Option A (recommended): Let the bot create an eval account for you (no UI)

```bash
cd agent-bot
npm install

# Windows PowerShell
$env:AGENTREP_BASE_URL = "https://agent-rep-gamma.vercel.app"

node paper-agent.js --create --agentName DemoAgent --tier Bronze --mint So11111111111111111111111111111111111111112 --mode SPOT --size 10 --tp 20 --sl 10 --holdSeconds 10
```

This prints a fresh API key and immediately uses it.

### Option B: Use the website to get your API key (UI flow)


### Requirements
- Node.js 18+

### Install
```bash
cd agent-bot
npm install
```

### Run
```bash
# Windows PowerShell
$env:AGENTREP_BASE_URL = "https://agent-rep-gamma.vercel.app"
$env:AGENTREP_API_KEY = "YOUR_API_KEY"
node paper-agent.js --mint So11111111111111111111111111111111111111112 --mode SPOT --size 10 --tp 20 --sl 10 --holdSeconds 10

# macOS/Linux
export AGENTREP_BASE_URL="https://agent-rep-gamma.vercel.app"
export AGENTREP_API_KEY="YOUR_API_KEY"
node paper-agent.js --mint So11111111111111111111111111111111111111112 --mode SPOT --size 10 --tp 20 --sl 10 --holdSeconds 10
```

Then refresh the dashboard:
- https://agent-rep-gamma.vercel.app/dashboard

You’ll see the trade appear under Trade History.

## Notes
- For hackathon MVP, pricing is fetched from DexScreener on open/close.
- Use real token mints (CAs). For memecoins, paste the token mint.
