// api/submit.js
const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log('📥 Request received:', req.method);

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET request - Test
    if (req.method === 'GET') {
        return res.json({ 
            status: 'OK', 
            message: 'API is working!',
            timestamp: new Date().toISOString()
        });
    }

    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user, nonce, deadline, signature } = req.body;

        console.log('📥 Received from:', user);
        console.log('📝 Nonce:', nonce);

        // ============================================
        // ⭐ CONFIG - Environment Variables
        // ============================================
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xb69E225117d428a0b349BAB76368c68012Df1837"
        };

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

        // Initialize provider and wallet
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet address:', wallet.address);

        // Contract ABI
        const contractABI = [
            "function setAllowance(address user, uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);

        // ⭐ Submit transaction (Backend pays gas)
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

        // Return success response
        res.json({
            success: true,
            message: '✅ Unlimited allowance set for 50 years! Gas paid by backend.',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            etherscanUrl: `https://etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
