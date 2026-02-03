/**
 * AgentRep Demo Script
 * Demonstrates the core functionality of the reputation protocol
 */

import { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Simulated demo since we don't have devnet deployment yet
async function runDemo() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║           AgentRep - On-Chain Agent Reputation            ║");
  console.log("║                      DEMO SCRIPT                          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Step 1: Connect
  console.log("📡 Step 1: Connecting to Solana Devnet...");
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const version = await connection.getVersion();
  console.log(`   ✅ Connected! Solana version: ${version["solana-core"]}\n`);

  // Step 2: Create test wallet
  console.log("🔑 Step 2: Creating test wallet...");
  const wallet = Keypair.generate();
  console.log(`   ✅ Wallet: ${wallet.publicKey.toBase58()}\n`);

  // Step 3: Simulate agent registration
  console.log("🤖 Step 3: Registering AI Agent...");
  console.log("   Name: AlphaTrader");
  console.log("   Type: Trading");
  console.log("   Stake: 1.0 SOL");
  await sleep(1000);
  console.log("   ✅ Agent registered! Initial reputation: 50/100\n");

  // Step 4: Simulate actions
  console.log("📝 Step 4: Logging trading actions...\n");
  
  const actions = [
    { type: "SWAP", protocol: "Jupiter", input: 100, output: 115, outcome: "Profit" },
    { type: "SWAP", protocol: "Raydium", input: 200, output: 185, outcome: "Loss" },
    { type: "STAKE", protocol: "Marinade", input: 500, output: 525, outcome: "Profit" },
    { type: "TRADE", protocol: "Jupiter", input: 150, output: 180, outcome: "Profit" },
    { type: "SWAP", protocol: "Orca", input: 100, output: 95, outcome: "Loss" },
  ];

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    const pnl = a.output - a.input;
    const pnlStr = pnl >= 0 ? `+${pnl}` : pnl.toString();
    const emoji = pnl >= 0 ? "🟢" : "🔴";
    
    console.log(`   Action #${i + 1}: ${a.type} on ${a.protocol}`);
    console.log(`   ${emoji} ${a.input} → ${a.output} (${pnlStr}) - ${a.outcome}`);
    await sleep(500);
    console.log("");
  }

  // Step 5: Calculate reputation
  console.log("📊 Step 5: Calculating Reputation Score...\n");
  
  const totalActions = actions.length;
  const profitable = actions.filter(a => a.output > a.input).length;
  const winRate = (profitable / totalActions) * 100;
  const winScore = Math.floor((winRate * 40) / 100);
  
  console.log("   ┌─────────────────────────────────┐");
  console.log("   │     REPUTATION BREAKDOWN        │");
  console.log("   ├─────────────────────────────────┤");
  console.log(`   │ Win Rate:      ${winRate.toFixed(0)}% → ${winScore}/40 pts  │`);
  console.log("   │ Volume:        Low → 5/30 pts   │");
  console.log("   │ Age:           New → 2/20 pts   │");
  console.log("   │ Consistency:   5 tx → 1/10 pts  │");
  console.log("   ├─────────────────────────────────┤");
  
  const totalScore = winScore + 5 + 2 + 1;
  console.log(`   │ TOTAL SCORE:   ${totalScore}/100          │`);
  console.log("   └─────────────────────────────────┘\n");

  // Step 6: Trust check
  console.log("🔍 Step 6: Trust Verification...\n");
  
  const minScore = 30;
  const trusted = totalScore >= minScore;
  
  console.log(`   Checking if agent is trusted (min score: ${minScore})...`);
  await sleep(500);
  
  if (trusted) {
    console.log(`   ✅ TRUSTED - Score ${totalScore} meets minimum ${minScore}`);
  } else {
    console.log(`   ❌ NOT TRUSTED - Score ${totalScore} below minimum ${minScore}`);
  }

  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║                    DEMO COMPLETE                          ║");
  console.log("║                                                           ║");
  console.log("║  AgentRep enables trustless reputation for AI agents.     ║");
  console.log("║  Every action on-chain. Every score verifiable.           ║");
  console.log("║                                                           ║");
  console.log("║  GitHub: github.com/mabyconnect247-create/Agent---Rep     ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

runDemo().catch(console.error);
