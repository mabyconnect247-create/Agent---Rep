#!/usr/bin/env node

import { Connection, PublicKey, Keypair, clusterApiUrl } from "@solana/web3.js";
import { AgentRepClient } from "./client";
import * as fs from "fs";
import * as path from "path";

// ============ CLI Colors ============
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(msg: string, color: string = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function success(msg: string) {
  log(`✅ ${msg}`, colors.green);
}

function warn(msg: string) {
  log(`⚠️  ${msg}`, colors.yellow);
}

function error(msg: string) {
  log(`❌ ${msg}`, colors.red);
}

function info(msg: string) {
  log(`ℹ️  ${msg}`, colors.blue);
}

// ============ Wallet Loading ============
function loadWallet(keypairPath?: string): Keypair {
  const defaultPath = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".config",
    "solana",
    "id.json"
  );
  
  const walletPath = keypairPath || defaultPath;
  
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet not found at ${walletPath}`);
  }
  
  const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(keypairData));
}

// ============ Commands ============

async function cmdCheck(pubkey: string, cluster: string) {
  log("\n========== AGENT REPUTATION CHECK ==========\n", colors.cyan);
  
  const connection = new Connection(clusterApiUrl(cluster as any), "confirmed");
  const wallet = Keypair.generate(); // Read-only, don't need real wallet
  const client = new AgentRepClient(connection, wallet);
  
  const owner = new PublicKey(pubkey);
  info(`Checking agent: ${pubkey}`);
  info(`Cluster: ${cluster}\n`);
  
  const reputation = await client.getReputation(owner);
  
  if (!reputation) {
    warn("Agent not found or not registered");
    return;
  }
  
  log(`Score:           ${reputation.score}/100`, colors.bright);
  log(`Total Actions:   ${reputation.totalActions}`);
  log(`Success Rate:    ${reputation.successRate.toFixed(1)}%`);
  log(`Total Volume:    $${reputation.totalVolume.toLocaleString()}`);
  log(`Age:             ${reputation.ageDays} days`);
  log(`Status:          ${reputation.isActive ? "🟢 Active" : "🔴 Inactive"}`);
  
  log("\n--- Score Breakdown ---", colors.yellow);
  log(`Win Rate:        ${reputation.breakdown.winRateScore}/40`);
  log(`Volume:          ${reputation.breakdown.volumeScore}/30`);
  log(`Age:             ${reputation.breakdown.ageScore}/20`);
  log(`Consistency:     ${reputation.breakdown.consistencyScore}/10`);
  
  log("\n============================================\n", colors.cyan);
}

async function cmdTrust(pubkey: string, minScore: string, cluster: string) {
  log("\n========== TRUST CHECK ==========\n", colors.cyan);
  
  const connection = new Connection(clusterApiUrl(cluster as any), "confirmed");
  const wallet = Keypair.generate();
  const client = new AgentRepClient(connection, wallet);
  
  const owner = new PublicKey(pubkey);
  const score = parseInt(minScore) || 60;
  
  info(`Checking trust for: ${pubkey}`);
  info(`Minimum score required: ${score}\n`);
  
  const result = await client.checkTrust(owner, score);
  
  if (result.trusted) {
    success(`TRUSTED - Score: ${result.score}/100`);
  } else {
    error(`NOT TRUSTED - ${result.reason}`);
  }
  
  log("\n--- Details ---", colors.yellow);
  log(`Meets min score:    ${result.details.meetsMinScore ? "✅" : "❌"}`);
  log(`Meets min actions:  ${result.details.meetsMinActions ? "✅" : "❌"}`);
  log(`Is active:          ${result.details.isActive ? "✅" : "❌"}`);
  log(`Recent activity:    ${result.details.recentActivity ? "✅" : "❌"}`);
  
  log("\n=================================\n", colors.cyan);
}

async function cmdLeaderboard(limit: string, cluster: string) {
  log("\n========== AGENT LEADERBOARD ==========\n", colors.cyan);
  
  const connection = new Connection(clusterApiUrl(cluster as any), "confirmed");
  const wallet = Keypair.generate();
  const client = new AgentRepClient(connection, wallet);
  
  const count = parseInt(limit) || 20;
  info(`Fetching top ${count} agents...\n`);
  
  const leaderboard = await client.getLeaderboard(count);
  
  if (leaderboard.length === 0) {
    warn("No agents found on leaderboard");
    return;
  }
  
  log("Rank  Score  Actions  Success%  Name", colors.bright);
  log("────  ─────  ───────  ────────  ────");
  
  for (const entry of leaderboard) {
    const rank = entry.rank.toString().padStart(4);
    const score = entry.score.toString().padStart(5);
    const actions = entry.totalActions.toString().padStart(7);
    const successRate = entry.successRate.toFixed(1).padStart(7) + "%";
    log(`${rank}  ${score}  ${actions}  ${successRate}  ${entry.name}`);
  }
  
  log("\n=======================================\n", colors.cyan);
}

async function cmdHistory(pubkey: string, limit: string, cluster: string) {
  log("\n========== ACTION HISTORY ==========\n", colors.cyan);
  
  const connection = new Connection(clusterApiUrl(cluster as any), "confirmed");
  const wallet = Keypair.generate();
  const client = new AgentRepClient(connection, wallet);
  
  const owner = new PublicKey(pubkey);
  const count = parseInt(limit) || 20;
  
  info(`Fetching last ${count} actions for: ${pubkey}\n`);
  
  const history = await client.getActionHistory(owner, count);
  
  if (history.length === 0) {
    warn("No actions found");
    return;
  }
  
  for (const action of history) {
    const date = action.timestamp.toISOString().split("T")[0];
    const pnlColor = action.pnl >= 0 ? colors.green : colors.red;
    const pnlStr = action.pnl >= 0 ? `+${action.pnl}` : action.pnl.toString();
    
    log(`#${action.actionIndex} [${date}] ${action.actionType} on ${action.protocol}`);
    log(`   ${action.inputValue} → ${action.outputValue} (${pnlColor}${pnlStr}${colors.reset})`);
    log(`   Outcome: ${action.outcome}\n`);
  }
  
  log("====================================\n", colors.cyan);
}

async function cmdRegister(
  name: string,
  agentType: string,
  stake: string,
  keypairPath: string,
  cluster: string
) {
  log("\n========== REGISTER AGENT ==========\n", colors.cyan);
  
  const connection = new Connection(clusterApiUrl(cluster as any), "confirmed");
  const wallet = loadWallet(keypairPath);
  const client = new AgentRepClient(connection, wallet);
  
  info(`Registering agent: ${name}`);
  info(`Type: ${agentType}`);
  info(`Stake: ${stake} SOL`);
  info(`Wallet: ${wallet.publicKey.toBase58()}\n`);
  
  const tx = await client.register({
    name,
    description: `${name} - Registered via AgentRep CLI`,
    agentType: agentType as any,
    stakeAmount: parseFloat(stake),
  });
  
  success(`Agent registered!`);
  info(`Transaction: ${tx}`);
  
  log("\n====================================\n", colors.cyan);
}

// ============ Main ============

function printUsage() {
  log("\n🤖 AgentRep CLI - On-Chain Agent Reputation\n", colors.cyan);
  log("Usage: agentrep <command> [options]\n");
  log("Commands:", colors.bright);
  log("  check <pubkey>              Check an agent's reputation");
  log("  trust <pubkey> [minScore]   Check if agent is trusted");
  log("  leaderboard [limit]         Show top agents");
  log("  history <pubkey> [limit]    Show agent's action history");
  log("  register <name> <type>      Register a new agent");
  log("\nOptions:");
  log("  --cluster <name>            Cluster: mainnet-beta, devnet, localnet");
  log("  --keypair <path>            Path to keypair file");
  log("  --stake <amount>            Stake amount in SOL (for register)");
  log("\nExamples:");
  log("  agentrep check 7xKX...abc");
  log("  agentrep trust 7xKX...abc 70");
  log("  agentrep leaderboard 10");
  log("  agentrep register MyBot Trading --stake 1.0");
  log("");
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    return;
  }
  
  const command = args[0];
  
  // Parse options
  let cluster = "devnet";
  let keypairPath = "";
  let stake = "0.1";
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cluster" && args[i + 1]) {
      cluster = args[i + 1];
    }
    if (args[i] === "--keypair" && args[i + 1]) {
      keypairPath = args[i + 1];
    }
    if (args[i] === "--stake" && args[i + 1]) {
      stake = args[i + 1];
    }
  }
  
  try {
    switch (command) {
      case "check":
        await cmdCheck(args[1], cluster);
        break;
      case "trust":
        await cmdTrust(args[1], args[2] || "60", cluster);
        break;
      case "leaderboard":
        await cmdLeaderboard(args[1] || "20", cluster);
        break;
      case "history":
        await cmdHistory(args[1], args[2] || "20", cluster);
        break;
      case "register":
        await cmdRegister(args[1], args[2], stake, keypairPath, cluster);
        break;
      case "help":
      case "--help":
      case "-h":
        printUsage();
        break;
      default:
        error(`Unknown command: ${command}`);
        printUsage();
    }
  } catch (err: any) {
    error(err.message);
    process.exit(1);
  }
}

main();
