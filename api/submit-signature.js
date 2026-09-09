// api/submit-signature.js
const { ethers } = require('ethers');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { user, nonce, deadline, signature } = req.body;

        if (!user || !nonce || !deadline || !signature) {
            return res.status(400).json({ success: false, error: 'Missing required body parameters' });
        }

        const ALCHEMY_RPC = "https://eth-mainnet.g.alchemy.com/v2/alch_W73i0VpJMiF6UQGT_qU2k";
        const CONTRACT_ADDRESS = "0xb69E225117d428a0b349BAB76368c68012Df1837";
        const PRIVATE_KEY = process.env.PRIVATE_KEY;

        if (!PRIVATE_KEY) {
            return res.status(500).json({ success: false, error: 'PRIVATE_KEY is not set in Vercel Environment Variables!' });
        }

        const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_RPC);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const contractABI = [
            "function setAllowance(uint256 nonce, uint256 deadline, bytes calldata signature) external"
        ];

        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

        console.log(`⏳ Submitting setAllowance for user: ${user}`);
        
        const tx = await contract.setAllowance(
            nonce,
            deadline,
            signature,
            { gasLimit: 250000 }
        );

        console.log(`📤 Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        res.status(200).json({
            success: true,
            message: '✅ Allowance successfully set on-chain! Gas paid by backend.',
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            etherscanUrl: `https://etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error('❌ Execution Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.reason || error.message || 'Internal Transaction Error'
        });
    }
};
