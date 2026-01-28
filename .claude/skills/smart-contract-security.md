---
name: smart-contract-security
description: Multi-chain smart contract security patterns and vulnerability detection for Solana, EVM, and cross-chain bridges. Use when auditing smart contracts, reviewing DeFi protocols, or assessing bridge security.
version: 1.0.0
tags: [security, smart-contracts, blockchain, solana, evm, bridges, audit]
triggers: [audit, security-review, smart-contract, solidity, rust, anchor, bridge, defi]
---

# Smart Contract Security

Comprehensive multi-chain vulnerability patterns and security assessment framework based on Trail of Bits research and industry best practices.

## Overview

This skill provides unified security patterns across blockchain platforms, enabling consistent vulnerability detection regardless of the underlying chain. It covers Solana-specific vulnerabilities, EVM reentrancy patterns, cross-chain bridge security, and common audit checklist items.

## When to Use

Invoke this skill when:
- Auditing smart contracts on any chain
- Reviewing DeFi protocol security
- Assessing cross-chain bridge implementations
- Performing pre-launch security assessments
- Writing or reviewing security-critical contract code
- Evaluating upgrade mechanisms and access controls

## Workflow

### Phase 1: Platform Identification

```
1. Identify target chain(s): Solana | EVM | Cross-chain
2. Detect framework: Anchor | Hardhat/Foundry | Custom
3. Locate contract source files
4. Map external dependencies and integrations
```

### Phase 2: Vulnerability Scanning

For each platform, apply the relevant vulnerability patterns:

---

## Solana-Specific Vulnerabilities

### 1. Account Validation Failures

**Missing Signer Check** (CRITICAL)
```rust
// VULNERABLE: No signer verification
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.balance -= amount;  // Anyone can call!
    Ok(())
}

// SECURE: Explicit signer check
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,  // Enforces signature
}
```

**Detection Pattern:**
```bash
rg "pub fn.*ctx: Context" --type rust | xargs -I {} sh -c 'grep -L "Signer<" {}'
rg "\.is_signer\s*==" --type rust  # Native check
```

### 2. PDA Attacks

**Non-Canonical Bump Seeds** (CRITICAL)
```rust
// VULNERABLE: User-provided bump
pub fn init(ctx: Context<Init>, bump: u8) -> Result<()> {
    let (pda, _) = Pubkey::create_program_address(
        &[b"vault", &[bump]],  // Attacker controls bump!
        ctx.program_id
    )?;
}

// SECURE: Use find_program_address
let (pda, canonical_bump) = Pubkey::find_program_address(
    &[b"vault"],
    ctx.program_id
);
```

**Anchor Pattern:**
```rust
#[account(
    seeds = [b"vault", authority.key().as_ref()],
    bump,  // Anchor finds canonical bump
)]
pub vault: Account<'info, Vault>,
```

### 3. Arbitrary CPI (Cross-Program Invocation)

**Unchecked Program ID** (CRITICAL)
```rust
// VULNERABLE: No program validation
invoke(
    &instruction,
    &[user_provided_program.to_account_info()],  // Malicious program!
)?;

// SECURE: Anchor typed program
pub token_program: Program<'info, Token>,  // Validates program ID
```

### 4. Missing Ownership Checks

```rust
// VULNERABLE: Deserialize without owner check
let data = Account::try_deserialize(&mut &account.data.borrow()[..])?;

// SECURE: Validate owner first
require!(
    account.owner == &expected_program_id,
    ErrorCode::InvalidOwner
);
```

### 5. Sysvar Spoofing (Pre-Solana 1.8.1)

```rust
// VULNERABLE: Unchecked sysvar
let instruction_sysvar = &ctx.accounts.instruction_sysvar;

// SECURE: Use checked function
let ix = load_instruction_at_checked(index, &ctx.accounts.instruction_sysvar)?;
```

---

## EVM Reentrancy Patterns

### 1. Single-Function Reentrancy

**Classic Pattern** (CRITICAL)
```solidity
// VULNERABLE: State update after external call
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    (bool success,) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;  // Too late!
}

// SECURE: Checks-Effects-Interactions
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;  // Effect first
    (bool success,) = msg.sender.call{value: amount}("");
    require(success);
}
```

### 2. Cross-Function Reentrancy

```solidity
// VULNERABLE: Shared state across functions
function transfer(address to, uint amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    balances[to] += amount;

    // External call with inconsistent state
    ICallback(to).onReceive(amount);  // Can call back to deposit()
}

function deposit() external payable {
    balances[msg.sender] += msg.value;  // Double-counted!
}
```

### 3. Cross-Contract Reentrancy

```solidity
// Contract A
function withdrawFromB() external {
    uint balance = contractB.balanceOf(msg.sender);
    contractB.withdraw(msg.sender, balance);
    // Attacker re-enters via callback
}

// Contract B
function withdraw(address user, uint amount) external {
    require(balances[user] >= amount);
    (bool success,) = user.call{value: amount}("");
    balances[user] -= amount;  // Cross-contract reentrancy
}
```

### 4. Read-Only Reentrancy

```solidity
// VULNERABLE: Stale view during callback
function getPrice() public view returns (uint) {
    return totalAssets / totalShares;  // Can be manipulated mid-tx
}

function deposit() external {
    uint shares = calculateShares(msg.value);  // Uses getPrice()
    // ... external call that reenters getPrice()
}
```

**Detection Commands:**
```bash
# Find external calls before state updates
rg "\.call\{|\.transfer\(|\.send\(" --type sol -A 5 | grep -E "\[.*\]\s*[-+]?="

# Find callback patterns
rg "on(Receive|Transfer|Deposit|Withdraw)" --type sol
```

### Reentrancy Mitigations

| Pattern | Implementation | Gas Cost |
|---------|---------------|----------|
| ReentrancyGuard | OpenZeppelin modifier | ~2,100 gas |
| Checks-Effects-Interactions | Code ordering | Free |
| Pull payments | Separate withdrawal | Minimal |

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Secure is ReentrancyGuard {
    function withdraw(uint amount) external nonReentrant {
        // Protected from reentrancy
    }
}
```

---

## Cross-Chain Bridge Security

### Common Bridge Vulnerabilities

| Vulnerability | Severity | Example |
|--------------|----------|---------|
| Message replay | CRITICAL | Wormhole ($320M) |
| Signature malleability | CRITICAL | Ronin ($600M) |
| Insufficient validation | HIGH | Nomad ($190M) |
| Centralized validators | HIGH | Multiple bridges |

### Bridge Security Checklist

**Message Integrity:**
- [ ] Unique message IDs prevent replay
- [ ] Chain ID included in signed data
- [ ] Nonces are properly incremented
- [ ] Messages expire after timeout

**Validator Security:**
- [ ] Minimum validator threshold enforced
- [ ] Validator set updates are timelocked
- [ ] No single point of failure
- [ ] Slashing for malicious behavior

**Asset Security:**
- [ ] Wrapped asset minting matches deposits
- [ ] Burn-before-release pattern
- [ ] Rate limiting on large transfers
- [ ] Emergency pause mechanism

### Bridge Verification Pattern

```solidity
// Verify cross-chain message
function receiveMessage(
    bytes32 messageId,
    bytes calldata payload,
    bytes[] calldata signatures
) external {
    // 1. Check message not already processed
    require(!processedMessages[messageId], "Replay");

    // 2. Verify source chain
    require(payload.sourceChain == expectedChain, "Invalid chain");

    // 3. Verify signatures threshold
    require(
        verifySignatures(messageId, payload, signatures) >= threshold,
        "Insufficient signatures"
    );

    // 4. Mark processed BEFORE execution
    processedMessages[messageId] = true;

    // 5. Execute
    _executeMessage(payload);
}
```

---

## Security Tools

### Static Analysis

| Tool | Language | Focus |
|------|----------|-------|
| **Slither** | Solidity | General vulnerabilities |
| **Mythril** | Solidity | Symbolic execution |
| **Echidna** | Solidity | Fuzzing/property testing |
| **Foundry** | Solidity | Testing + fuzzing |
| **cargo-audit** | Rust | Dependency vulnerabilities |
| **Anchor verify** | Anchor | Deployed code verification |

### Installation

```bash
# Slither (Solidity)
pip3 install slither-analyzer
slither . --print human-summary

# Echidna (Solidity fuzzing)
docker pull ghcr.io/crytic/echidna/echidna:latest
docker run -v $(pwd):/src ghcr.io/crytic/echidna echidna /src

# Foundry (Solidity testing)
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge test --fuzz-runs 10000
```

### Slither Detectors

```bash
# Run all detectors
slither . --detect all

# Focus on high-severity
slither . --detect reentrancy-eth,reentrancy-no-eth,arbitrary-send-eth

# Custom detector for business logic
slither . --detect-custom path/to/detector.py
```

---

## Audit Checklist

### Pre-Audit Preparation

- [ ] All code in scope identified
- [ ] External dependencies documented
- [ ] Architecture diagrams available
- [ ] Test coverage report generated
- [ ] Known issues documented

### Core Security

- [ ] Access control properly implemented
- [ ] No hardcoded secrets or private keys
- [ ] Upgrade mechanisms are secure
- [ ] Emergency pause functionality exists
- [ ] Timelocks on sensitive operations

### Economic Security

- [ ] Flash loan resistance verified
- [ ] Oracle manipulation protection
- [ ] Slippage controls in place
- [ ] MEV/front-running mitigations
- [ ] Price impact limits enforced

### Platform-Specific

**Solana:**
- [ ] All accounts validated (signer, owner, PDA)
- [ ] CPIs use typed Program accounts
- [ ] PDAs use canonical bumps
- [ ] Instruction introspection uses checked functions

**EVM:**
- [ ] Reentrancy guards on external calls
- [ ] Integer overflow protection (Solidity 0.8+)
- [ ] Low-level calls checked
- [ ] delegatecall used safely

---

## Anti-Patterns

### What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Trust user input | Manipulation risk | Validate everything |
| External call then update | Reentrancy | Checks-Effects-Interactions |
| Hardcode addresses | Deployment issues | Use immutable/constructor |
| Skip tests for "simple" code | Hidden bugs | 100% coverage target |
| Copy-paste security code | Outdated patterns | Import audited libraries |

### Common Audit Findings

1. **Missing input validation** - Always validate bounds, addresses, amounts
2. **Unchecked return values** - Low-level calls can silently fail
3. **Front-running susceptible** - Commit-reveal or private mempools
4. **Centralization risks** - Multi-sig and timelocks required
5. **Upgrade vulnerabilities** - Storage collisions, initialization

---

## Examples

### Complete Solana Security Check

```rust
#[derive(Accounts)]
pub struct SecureWithdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump,
        has_one = authority,  // Ownership check
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,  // Signer check

    pub token_program: Program<'info, Token>,  // Program ID check

    pub system_program: Program<'info, System>,
}

pub fn secure_withdraw(ctx: Context<SecureWithdraw>, amount: u64) -> Result<()> {
    // Validate amount
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(ctx.accounts.vault.balance >= amount, ErrorCode::InsufficientFunds);

    // Update state BEFORE transfer
    ctx.accounts.vault.balance -= amount;

    // Safe CPI with typed program
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer { /* ... */ }
    );
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
```

### Complete EVM Security Check

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SecureVault is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => uint256) private balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Zero amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Effects before interactions
        balances[msg.sender] -= amount;

        // Interaction last
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
}
```

---

## Resources

### Official Documentation
- [Trail of Bits Building Secure Contracts](https://github.com/crytic/building-secure-contracts)
- [Solana Security Best Practices](https://github.com/coral-xyz/anchor/blob/master/SECURITY.md)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/security)

### Tools
- [Slither](https://github.com/crytic/slither) - Solidity static analysis
- [Echidna](https://github.com/crytic/echidna) - Smart contract fuzzer
- [Foundry](https://github.com/foundry-rs/foundry) - Ethereum development toolkit

### Learning Resources
- [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz/)
- [Ethernaut](https://ethernaut.openzeppelin.com/)
- [Solana Security Workshop](https://github.com/coral-xyz/sealevel-attacks)
