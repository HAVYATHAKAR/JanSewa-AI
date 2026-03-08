# JanSeva AI — Amazon Bedrock Setup Guide

## Prerequisites

### 1. AWS Account with Bedrock Access

1. **Create an AWS Account** at [aws.amazon.com](https://aws.amazon.com) (if you don't have one)
2. **Enable Bedrock Model Access**:
   - Go to **AWS Console → Amazon Bedrock → Model access** ([direct link for us-east-1](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess))
   - Click **"Manage model access"**
   - Select the model you want to use (e.g., **Amazon Titan Text Express**)
   - Click **"Request model access"** → wait for it to show **"Access granted"**

### 2. AWS Credentials (IAM)

1. Go to **AWS Console → IAM → Users**
2. Create a new user or select an existing one
3. Attach the policy: **`AmazonBedrockFullAccess`** (or a custom policy with `bedrock:InvokeModelWithResponseStream`)
4. Go to **Security Credentials → Create access key**
5. Copy the **Access Key ID** and **Secret Access Key**

---

## Setup Steps

### Step 1: Configure Environment Variables

Edit `server/.env` and replace the placeholders with your real credentials:

```env
AWS_ACCESS_KEY_ID=AKIA...your_real_key
AWS_SECRET_ACCESS_KEY=your_real_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
PORT=3001
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Run the Application

**Option A — Development (two terminals):**

```bash
# Terminal 1: Start backend
node server/index.js

# Terminal 2: Start frontend (from project root)
npm run dev
```

Then open **http://localhost:5173** in your browser.

**Option B — Production build:**

```bash
npm run build      # Build frontend
npm run start      # Start server (serves built frontend + API)
```

Then open **http://localhost:3001** in your browser.

### Step 4: Verify

1. Open **http://localhost:3001/api/health** — you should see:
   ```json
   { "status": "ok", "aiReady": true, "modelId": "amazon.titan-text-express-v1" }
   ```
2. Open the application and click the **AI Chat** button
3. Send a message like **"What schemes are available for farmers?"**
4. You should see a streaming response from Amazon Bedrock

---

## Available Bedrock Models

| Model ID | Provider | Notes |
|----------|----------|-------|
| `amazon.titan-text-express-v1` | Amazon | Default, fast, cost-effective |
| `amazon.titan-text-premier-v1:0` | Amazon | Higher quality responses |
| `anthropic.claude-3-haiku-20240307-v1:0` | Anthropic | Fast, requires separate model access |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Anthropic | Balanced quality, requires access |
| `meta.llama3-8b-instruct-v1:0` | Meta | Open-source, requires access |

> **Note:** You must enable access for each model separately in the AWS Bedrock console.

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `AI chat is not configured` | Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in `server/.env` |
| `Access denied` | Verify IAM user has `AmazonBedrockFullAccess` policy attached |
| `ValidationException` | The model may not support the Converse API — try `amazon.titan-text-express-v1` |
| `ThrottlingException` | You've hit the rate limit — wait a moment and try again |
| `Could not resolve model` | Model access not enabled — go to Bedrock Console → Model access |

---

## Deploying to Vercel

The project includes `api/` serverless functions for Vercel deployment:

1. Push code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel → Project Settings → Environment Variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `BEDROCK_MODEL_ID`
4. Deploy — the `api/chat.js` serverless function handles Bedrock streaming
