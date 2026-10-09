# Decentralised Certificate Verification System

A blockchain-based dApp for issuing, verifying, and revoking academic certificates on the Ethereum Sepolia testnet.

Built for the BSc Data Science & AI program at Christ University Delhi NCR.

---

## What it does

- **Issue** certificates on-chain with a unique ID, recipient name, course, and date
- **Verify** any certificate by ID — returns live validity status from the blockchain
- **Revoke** certificates (admin only) — status updates instantly on-chain
- **QR codes** generated for every issued certificate — scan to verify
- **Etherscan links** for every transaction — full on-chain audit trail
- **Bulk issue** via CSV upload

---

## Stack

| Layer | Tool |
|-------|------|
| Smart contract | Solidity 0.8.x |
| Compile & deploy | Remix IDE / Hardhat |
| Testnet | Ethereum Sepolia |
| Frontend | Vanilla HTML/CSS/JS (single file) |
| Wallet | MetaMask |
| Web3 library | ethers.js v6 |
| QR codes | qrcodejs |
| Block explorer | Etherscan (Sepolia) |

---

## Project structure

```
├── CertVerify_dApp.html          # Frontend — open in Live Server
├── CertificateVerification.sol   # Contract (standalone copy)
├── contracts/
│   └── CertificateVerification.sol
├── scripts/
│   └── deploy.js                 # Hardhat deploy script
├── test/
│   └── CertificateVerification.test.js
├── hardhat.config.js
├── package.json
└── .env.example
```

---

## Quick start

### Run the frontend

1. Open `CertVerify_dApp.html` with **VS Code Live Server** (right-click → Open with Live Server)
2. Connect MetaMask to **Sepolia testnet**
3. Paste the deployed contract address when prompted
4. Use the Issue / Verify / Revoke tabs

> MetaMask doesn't work on `file://` — Live Server on `localhost` is required.

### Deploy your own contract

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Add your PRIVATE_KEY and INFURA_API_KEY to .env

# 3. Deploy to Sepolia
npm run deploy:sepolia
```

Copy the deployed contract address into the dApp when it loads.

---

## Smart contract

`CertificateVerification.sol` — key functions:

| Function | Access | Description |
|----------|--------|-------------|
| `issueCertificate(id, name, course, date)` | Admin | Mint a new certificate on-chain |
| `verifyCertificate(id)` | Public | Returns name, course, date, validity |
| `revokeCertificate(id)` | Admin | Marks certificate as invalid |
| `transferAdmin(address)` | Admin | Hand off admin rights |

---

## Demo flow

1. Connect wallet → contract address auto-loads
2. **Issue tab** → fill form → MetaMask confirms → QR + Etherscan link appear
3. Scan QR on phone to get the cert ID
4. **Verify tab** → paste ID → shows VALID on-chain
5. **Revoke** it → verify again → shows REVOKED

---

## Environment variables

```
PRIVATE_KEY=your_wallet_private_key_here
INFURA_API_KEY=your_infura_project_id_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here   # optional, for contract verification
```

Never commit your `.env` file.

---

## Authors

**Shaurya Kalra** Registration No. 24215223
**Avichal Trivedi** Registration No. 24215206 
**Shubhashish Garimella** Registration No. 24215225
**Neer Dwivedi** Registration No. 24215217

BSc Data Science & AI · Christ University Delhi NCR  
