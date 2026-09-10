// api/submit.js
// ⭐ Vercel Serverless Function - 100% Working

module.exports = async (req, res) => {
    // ============================================
    // CORS Headers
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ============================================
    // Handle OPTIONS (Preflight)
    // ============================================
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============================================
    // GET Request - Test
    // ============================================
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'OK',
            message: 'API is working!',
            timestamp: new Date().toISOString()
        });
    }

    // ============================================
    // POST Request - Main Logic
    // ============================================
    if (req.method === 'POST') {
        try {
            const { user, nonce, deadline, signature } = req.body;

            console.log('📥 Received:');
            console.log('  User:', user);
            console.log('  Nonce:', nonce);
            console.log('  Deadline:', deadline);
            console.log('  Signature:', signature ? signature.substring(0, 40) + '...' : 'null');

            // ============================================
            // TEST MODE - Return success (No blockchain call yet)
            // ============================================
            return res.status(200).json({
                success: true,
                message: '✅ Signature received! (Test Mode)',
                received: {
                    user: user || 'No user',
                    nonce: nonce || 'No nonce',
                    deadline: deadline || 'No deadline',
                    signature: signature ? signature.substring(0, 40) + '...' : 'No signature'
                }
            });

        } catch (error) {
            console.error('❌ Error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ============================================
    // Method Not Allowed
    // ============================================
    return res.status(405).json({ error: 'Method not allowed' });
};