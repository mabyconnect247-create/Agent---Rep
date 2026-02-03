/**
 * AgentRep Interactive Demo
 * Run with: node run-demo.js
 */

const readline = require('readline');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeWriter(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  console.log();
}

async function runDemo() {
  console.clear();
  
  // Title
  log('\n');
  log('╔═══════════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                                   ║', colors.cyan);
  log('║     █████╗  ██████╗ ███████╗███╗   ██╗████████╗██████╗ ███████╗██████╗    ║', colors.cyan);
  log('║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██╔════╝██╔══██╗   ║', colors.cyan);
  log('║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██████╔╝█████╗  ██████╔╝   ║', colors.cyan);
  log('║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗██╔══╝  ██╔═══╝    ║', colors.cyan);
  log('║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║  ██║███████╗██║        ║', colors.cyan);
  log('║    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝        ║', colors.cyan);
  log('║                                                                   ║', colors.cyan);
  log('║           On-Chain Agent Reputation Protocol for Solana           ║', colors.cyan);
  log('║                                                                   ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════════════╝', colors.cyan);
  log('\n');
  
  await sleep(2000);

  // Problem Statement
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.yellow);
  log('                        THE PROBLEM', colors.yellow);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.yellow);
  log('\n');
  
  await typeWriter('🤖 AI agents are everywhere...', 40);
  await sleep(500);
  await typeWriter('   They trade on Jupiter, Raydium, Orca', 30);
  await typeWriter('   They manage DeFi positions', 30);
  await typeWriter('   They handle user funds', 30);
  await sleep(1000);
  
  log('\n');
  log('   But how do you TRUST them?', colors.red);
  log('\n');
  await sleep(1500);
  
  await typeWriter('   ❓ Has this agent performed well?');
  await typeWriter('   ❓ Can you trust it with your funds?');
  await typeWriter('   ❓ Is it who it claims to be?');
  
  log('\n');
  log('   There is NO way to verify... until now.', colors.green);
  log('\n');
  
  await sleep(2000);

  // Solution
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
  log('                        THE SOLUTION', colors.green);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
  log('\n');
  
  await typeWriter('   AgentRep: Verifiable on-chain reputation for AI agents', 25);
  log('\n');
  
  await sleep(1000);

  // Demo: Register Agent
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('                   DEMO: REGISTER AGENT', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('\n');
  
  log('   $ agentrep register AlphaTrader --type Trading --stake 1.0', colors.blue);
  log('\n');
  await sleep(1500);
  
  log('   🔐 Creating agent wallet...', colors.yellow);
  await sleep(800);
  log('   📝 Registering on Solana...', colors.yellow);
  await sleep(800);
  log('   💰 Staking 1.0 SOL as commitment...', colors.yellow);
  await sleep(800);
  
  log('\n');
  log('   ✅ Agent Registered!', colors.green);
  log('   ┌─────────────────────────────────────┐', colors.green);
  log('   │ Name:       AlphaTrader             │', colors.green);
  log('   │ Type:       Trading                 │', colors.green);
  log('   │ Stake:      1.0 SOL                 │', colors.green);
  log('   │ Score:      50/100 (neutral)        │', colors.green);
  log('   │ PDA:        7xKX...abc              │', colors.green);
  log('   └─────────────────────────────────────┘', colors.green);
  log('\n');
  
  await sleep(2000);

  // Demo: Log Actions
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('                   DEMO: LOG ACTIONS', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('\n');
  
  const actions = [
    { type: 'SWAP', protocol: 'Jupiter', input: 100, output: 118, result: 'PROFIT' },
    { type: 'SWAP', protocol: 'Raydium', input: 200, output: 185, result: 'LOSS' },
    { type: 'STAKE', protocol: 'Marinade', input: 500, output: 530, result: 'PROFIT' },
    { type: 'TRADE', protocol: 'Jupiter', input: 150, output: 175, result: 'PROFIT' },
    { type: 'SWAP', protocol: 'Orca', input: 100, output: 92, result: 'LOSS' },
  ];
  
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    const pnl = a.output - a.input;
    const pnlStr = pnl >= 0 ? `+${pnl}` : `${pnl}`;
    const color = pnl >= 0 ? colors.green : colors.red;
    
    log(`   Action #${i + 1}: ${a.type} on ${a.protocol}`, colors.blue);
    await sleep(400);
    log(`   ${color}   ${a.input} → ${a.output} (${pnlStr}) ${a.result}${colors.reset}`);
    log('');
    await sleep(600);
  }
  
  await sleep(1000);

  // Demo: Reputation Score
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('                   DEMO: REPUTATION SCORE', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('\n');
  
  log('   $ agentrep check 7xKX...abc', colors.blue);
  log('\n');
  await sleep(1000);
  
  log('   ┌─────────────────────────────────────┐');
  log('   │      REPUTATION BREAKDOWN           │');
  log('   ├─────────────────────────────────────┤');
  log('   │ Win Rate:     60% →  24/40 pts      │', colors.green);
  log('   │ Volume:       $1050 →  8/30 pts     │', colors.yellow);
  log('   │ Age:          1 day →  1/20 pts     │', colors.yellow);
  log('   │ Consistency:  5 tx  →  1/10 pts     │', colors.yellow);
  log('   ├─────────────────────────────────────┤');
  log('   │ TOTAL SCORE:        34/100          │', colors.bright);
  log('   └─────────────────────────────────────┘');
  log('\n');
  
  await sleep(2000);

  // Demo: Trust Check
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('                   DEMO: TRUST VERIFICATION', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('\n');
  
  log('   $ agentrep trust 7xKX...abc --min-score 30', colors.blue);
  log('\n');
  await sleep(1000);
  
  log('   ✅ TRUSTED', colors.green);
  log('   Score 34 meets minimum threshold 30', colors.green);
  log('\n');
  
  log('   $ agentrep trust 7xKX...abc --min-score 60', colors.blue);
  log('\n');
  await sleep(1000);
  
  log('   ❌ NOT TRUSTED', colors.red);
  log('   Score 34 below minimum threshold 60', colors.red);
  log('\n');
  
  await sleep(2000);

  // Use Cases
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('                        USE CASES', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('\n');
  
  await typeWriter('   🏦 DeFi protocols require min reputation to interact', 25);
  await typeWriter('   🤝 Agents verify each other before collaboration', 25);
  await typeWriter('   🗳️  Governance with reputation-weighted voting', 25);
  await typeWriter('   📊 Marketplaces show verified track records', 25);
  await typeWriter('   ⚔️  Competitive outcomes as reputation signals', 25);
  log('\n');
  
  await sleep(2000);

  // Integrations
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('                    INTEGRATION INTEREST', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('\n');
  
  log('   6+ projects want to integrate:', colors.bright);
  log('');
  log('   • SOLPRISM      - Identity + Reputation', colors.yellow);
  log('   • Economic Zones - Governance trust', colors.yellow);
  log('   • AgentDEX      - Trading reputation', colors.yellow);
  log('   • AgentMemory   - Memory + Trust stack', colors.yellow);
  log('   • ZNAP          - Social profiles', colors.yellow);
  log('   • SIDEX         - Perps access control', colors.yellow);
  log('\n');
  
  await sleep(2000);

  // Closing
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
  log('\n');
  log('   AgentRep: The trust layer for the AI agent economy.', colors.bright);
  log('\n');
  log('   Every action on-chain. Every score verifiable.', colors.green);
  log('   Trust, verified.', colors.green);
  log('\n');
  log('   GitHub: github.com/mabyconnect247-create/Agent---Rep', colors.blue);
  log('\n');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
  log('\n');
}

runDemo().catch(console.error);
