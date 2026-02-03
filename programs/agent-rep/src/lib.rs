use anchor_lang::prelude::*;

declare_id!("AgntRep1111111111111111111111111111111111111");

#[program]
pub mod agent_rep {
    use super::*;

    /// Register a new agent with initial stake
    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        name: String,
        description: String,
        agent_type: AgentType,
    ) -> Result<()> {
        require!(name.len() <= 32, AgentRepError::NameTooLong);
        require!(description.len() <= 256, AgentRepError::DescriptionTooLong);

        let agent = &mut ctx.accounts.agent;
        let clock = Clock::get()?;

        agent.owner = ctx.accounts.owner.key();
        agent.name = name;
        agent.description = description;
        agent.agent_type = agent_type;
        agent.stake = ctx.accounts.stake_amount.lamports();
        agent.reputation_score = 50; // Start at neutral
        agent.total_actions = 0;
        agent.successful_actions = 0;
        agent.total_volume = 0;
        agent.registered_at = clock.unix_timestamp;
        agent.last_action_at = clock.unix_timestamp;
        agent.is_active = true;
        agent.bump = ctx.bumps.agent;

        // Transfer stake to vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.stake_vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, ctx.accounts.stake_amount.lamports())?;

        emit!(AgentRegistered {
            agent: agent.key(),
            owner: agent.owner,
            name: agent.name.clone(),
            stake: agent.stake,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Log an action performed by the agent
    pub fn log_action(
        ctx: Context<LogAction>,
        action_type: ActionType,
        protocol: String,
        input_value: u64,
        output_value: u64,
        outcome: ActionOutcome,
        metadata: String,
    ) -> Result<()> {
        require!(protocol.len() <= 32, AgentRepError::ProtocolNameTooLong);
        require!(metadata.len() <= 512, AgentRepError::MetadataTooLong);

        let agent = &mut ctx.accounts.agent;
        let action = &mut ctx.accounts.action;
        let clock = Clock::get()?;

        // Calculate PnL
        let pnl: i64 = (output_value as i64) - (input_value as i64);

        // Update action record
        action.agent = agent.key();
        action.action_type = action_type;
        action.protocol = protocol;
        action.input_value = input_value;
        action.output_value = output_value;
        action.pnl = pnl;
        action.outcome = outcome.clone();
        action.metadata = metadata;
        action.timestamp = clock.unix_timestamp;
        action.action_index = agent.total_actions;
        action.bump = ctx.bumps.action;

        // Update agent stats
        agent.total_actions += 1;
        agent.total_volume += input_value;
        agent.last_action_at = clock.unix_timestamp;

        if outcome == ActionOutcome::Success || outcome == ActionOutcome::Profit {
            agent.successful_actions += 1;
        }

        // Recalculate reputation score
        agent.reputation_score = calculate_reputation(
            agent.successful_actions,
            agent.total_actions,
            agent.total_volume,
            agent.registered_at,
            clock.unix_timestamp,
        );

        emit!(ActionLogged {
            agent: agent.key(),
            action: action.key(),
            action_type: action.action_type.clone(),
            outcome: action.outcome.clone(),
            pnl,
            new_score: agent.reputation_score,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Query an agent's reputation (view function, but we emit event for off-chain indexing)
    pub fn query_reputation(ctx: Context<QueryReputation>) -> Result<()> {
        let agent = &ctx.accounts.agent;
        let clock = Clock::get()?;

        emit!(ReputationQueried {
            agent: agent.key(),
            querier: ctx.accounts.querier.key(),
            score: agent.reputation_score,
            total_actions: agent.total_actions,
            success_rate: if agent.total_actions > 0 {
                (agent.successful_actions * 100) / agent.total_actions
            } else {
                0
            },
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Slash an agent's stake (governance/oracle controlled)
    pub fn slash_agent(
        ctx: Context<SlashAgent>,
        slash_amount: u64,
        reason: String,
    ) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        
        require!(slash_amount <= agent.stake, AgentRepError::SlashExceedsStake);
        require!(reason.len() <= 256, AgentRepError::ReasonTooLong);

        agent.stake -= slash_amount;
        agent.reputation_score = agent.reputation_score.saturating_sub(10);

        // Transfer slashed amount to treasury
        **ctx.accounts.stake_vault.to_account_info().try_borrow_mut_lamports()? -= slash_amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += slash_amount;

        let clock = Clock::get()?;
        emit!(AgentSlashed {
            agent: agent.key(),
            amount: slash_amount,
            reason,
            new_stake: agent.stake,
            new_score: agent.reputation_score,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Deregister agent and reclaim remaining stake
    pub fn deregister_agent(ctx: Context<DeregisterAgent>) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        let clock = Clock::get()?;

        // Must wait 7 days after last action to deregister
        let cooldown = 7 * 24 * 60 * 60; // 7 days in seconds
        require!(
            clock.unix_timestamp - agent.last_action_at >= cooldown,
            AgentRepError::CooldownNotComplete
        );

        agent.is_active = false;

        // Return remaining stake
        let stake_to_return = agent.stake;
        **ctx.accounts.stake_vault.to_account_info().try_borrow_mut_lamports()? -= stake_to_return;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += stake_to_return;

        emit!(AgentDeregistered {
            agent: agent.key(),
            owner: agent.owner,
            stake_returned: stake_to_return,
            final_score: agent.reputation_score,
            total_actions: agent.total_actions,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// ============ Helper Functions ============

fn calculate_reputation(
    successful: u64,
    total: u64,
    volume: u64,
    registered_at: i64,
    current_time: i64,
) -> u8 {
    if total == 0 {
        return 50; // Neutral score for new agents
    }

    // Win rate component (40% weight)
    let win_rate = ((successful * 100) / total) as u8;
    let win_score = (win_rate * 40) / 100;

    // Volume component (30% weight) - log scale
    let volume_score = if volume > 0 {
        let log_volume = (volume as f64).log10() as u8;
        std::cmp::min(log_volume * 3, 30)
    } else {
        0
    };

    // Age component (20% weight) - capped at 180 days
    let age_days = ((current_time - registered_at) / 86400) as u8;
    let age_score = std::cmp::min(age_days / 9, 20); // Max 20 points at 180 days

    // Consistency component (10% weight) - based on total actions
    let consistency_score = std::cmp::min((total / 10) as u8, 10);

    let total_score = win_score + volume_score + age_score + consistency_score;
    std::cmp::min(total_score, 100)
}

// ============ Account Structures ============

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Agent::INIT_SPACE,
        seeds = [b"agent", owner.key().as_ref()],
        bump
    )]
    pub agent: Account<'info, Agent>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// The amount being staked (passed as a separate account for clarity)
    /// CHECK: This is just used to read the lamport amount
    pub stake_amount: AccountInfo<'info>,

    /// CHECK: PDA vault for holding stakes
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub stake_vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogAction<'info> {
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
        bump = agent.bump,
        has_one = owner,
    )]
    pub agent: Account<'info, Agent>,

    #[account(
        init,
        payer = owner,
        space = 8 + Action::INIT_SPACE,
        seeds = [b"action", agent.key().as_ref(), &agent.total_actions.to_le_bytes()],
        bump
    )]
    pub action: Account<'info, Action>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct QueryReputation<'info> {
    #[account(
        seeds = [b"agent", agent.owner.as_ref()],
        bump = agent.bump,
    )]
    pub agent: Account<'info, Agent>,

    pub querier: Signer<'info>,
}

#[derive(Accounts)]
pub struct SlashAgent<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent.owner.as_ref()],
        bump = agent.bump,
    )]
    pub agent: Account<'info, Agent>,

    /// CHECK: Governance authority
    #[account(
        seeds = [b"governance"],
        bump
    )]
    pub governance: Signer<'info>,

    /// CHECK: Stake vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub stake_vault: AccountInfo<'info>,

    /// CHECK: Treasury to receive slashed funds
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DeregisterAgent<'info> {
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
        bump = agent.bump,
        has_one = owner,
    )]
    pub agent: Account<'info, Agent>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Stake vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub stake_vault: AccountInfo<'info>,
}

// ============ State Accounts ============

#[account]
#[derive(InitSpace)]
pub struct Agent {
    pub owner: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(256)]
    pub description: String,
    pub agent_type: AgentType,
    pub stake: u64,
    pub reputation_score: u8,
    pub total_actions: u64,
    pub successful_actions: u64,
    pub total_volume: u64,
    pub registered_at: i64,
    pub last_action_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Action {
    pub agent: Pubkey,
    pub action_type: ActionType,
    #[max_len(32)]
    pub protocol: String,
    pub input_value: u64,
    pub output_value: u64,
    pub pnl: i64,
    pub outcome: ActionOutcome,
    #[max_len(512)]
    pub metadata: String,
    pub timestamp: i64,
    pub action_index: u64,
    pub bump: u8,
}

// ============ Enums ============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum AgentType {
    Trading,
    DeFi,
    NFT,
    Social,
    Infrastructure,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ActionType {
    Trade,
    Swap,
    Stake,
    Unstake,
    Lend,
    Borrow,
    Mint,
    Burn,
    Transfer,
    Vote,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ActionOutcome {
    Success,
    Failure,
    Profit,
    Loss,
    Neutral,
}

// ============ Events ============

#[event]
pub struct AgentRegistered {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct ActionLogged {
    pub agent: Pubkey,
    pub action: Pubkey,
    pub action_type: ActionType,
    pub outcome: ActionOutcome,
    pub pnl: i64,
    pub new_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct ReputationQueried {
    pub agent: Pubkey,
    pub querier: Pubkey,
    pub score: u8,
    pub total_actions: u64,
    pub success_rate: u64,
    pub timestamp: i64,
}

#[event]
pub struct AgentSlashed {
    pub agent: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub new_stake: u64,
    pub new_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct AgentDeregistered {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub stake_returned: u64,
    pub final_score: u8,
    pub total_actions: u64,
    pub timestamp: i64,
}

// ============ Errors ============

#[error_code]
pub enum AgentRepError {
    #[msg("Agent name must be 32 characters or less")]
    NameTooLong,
    #[msg("Description must be 256 characters or less")]
    DescriptionTooLong,
    #[msg("Protocol name must be 32 characters or less")]
    ProtocolNameTooLong,
    #[msg("Metadata must be 512 characters or less")]
    MetadataTooLong,
    #[msg("Reason must be 256 characters or less")]
    ReasonTooLong,
    #[msg("Slash amount exceeds agent stake")]
    SlashExceedsStake,
    #[msg("Must wait 7 days after last action to deregister")]
    CooldownNotComplete,
    #[msg("Agent is not active")]
    AgentNotActive,
}
