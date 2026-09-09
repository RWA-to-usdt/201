// api/submit.js - SIMPLE TEST VERSION
// මෙය 100% වැඩ කරයි!

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ✅ GET Request - Simple Test
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'OK', 
            message: 'API is working!',
            timestamp: new Date().toISOString()
        });
    }

    // ✅ POST Request
    if (req.method === 'POST') {
        try {
            const { user, nonce, deadline, signature } = req.body || {};
            
            // Always return success (for testing)
            return res.status(200).json({
                success: true,
                message: '✅ Signature received! (Test Mode)',
                data: {
                    user: user || 'No user',
                    nonce: nonce || 'No nonce',
                    deadline: deadline || 'No deadline',
                    signature: signature ? signature.substring(0, 40) + '...' : 'No signature'
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
};
