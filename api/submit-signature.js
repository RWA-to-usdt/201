// api/submit-signature.js - Test Version
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // POST request
    if (req.method === 'POST') {
        try {
            const { user, nonce, deadline, signature } = req.body;
            
            return res.json({
                success: true,
                message: 'Signature received! (Test mode)',
                received: {
                    user,
                    nonce,
                    deadline,
                    signature: signature ? signature.substring(0, 40) + '...' : null
                }
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
