# JanSeva AI — Amazon Bedrock Setup Guide

## Prerequisites

### 1. Install & Configure AWS CLI

1. **Install AWS CLI**: [Download here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **Configure credentials** — run this in your terminal:
   ```bash
   aws configure
   ```
   It will prompt for:
   - **AWS Access Key ID** — get from IAM Console → Users → Security Credentials
   - **AWS Secret Access Key** — shown once when you create the key
   - **Default region** — enter `us-east-1`
   - **Output format** — enter `json`

   This stores credentials in `~/.aws/credentials` — the app picks them up automatically. **No keys in the project code.**

### 2. Enable Bedrock Model Access

1. Go to **AWS Console → Amazon Bedrock → Model access** ([direct link](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess))
2. Click **"Manage model access"**
3. Select **Amazon Titan Text Express** (or your preferred model)
4. Click **"Request model access"** → wait for **"Access granted"**

### 3. IAM Permissions

Your IAM user/role needs the **`AmazonBedrockFullAccess`** policy, or at minimum:
```json
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModelWithResponseStream", "bedrock:InvokeModel"],
  "Resource": "*"
}
```

---

## Setup Steps

### Step 1: Install Dependencies

```bash
# From project root
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### Step 2: Run the Application

**Development (two terminals):**

```bash
# Terminal 1: Backend
node server/index.js

# Terminal 2: Frontend
npm run dev
```

Open **http://localhost:5173**

**Production build:**

```bash
npm run build
npm run start
```

Open **http://localhost:3001**

### Step 3: Verify

1. Open **http://localhost:3001/api/health** — should show `"aiReady": true`
2. Click the **AI Chat** button → send a message → confirm streaming response

---

## Configuration (Optional)

Edit `server/.env` to customize region or model:

```env
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
PORT=3001
```

### Available Bedrock Models

| Model ID | Provider | Notes |
|----------|----------|-------|
| `amazon.titan-text-express-v1` | Amazon | Default, fast |
| `amazon.titan-text-premier-v1:0` | Amazon | Higher quality |
| `anthropic.claude-3-haiku-20240307-v1:0` | Anthropic | Fast Claude |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Anthropic | Balanced |
| `meta.llama3-8b-instruct-v1:0` | Meta | Open-source |

---

## How Credentials Work

The app uses the **AWS SDK default credential provider chain** — no access keys in the code. The SDK checks these sources in order:

1. **AWS CLI profile** (`~/.aws/credentials`) ← recommended for local dev
2. **IAM Instance Role** ← for EC2 deployment
3. **ECS Task Role** ← for container deployment
4. **Lambda Execution Role** ← for serverless
5. **Environment variables** (`AWS_ACCESS_KEY_ID` etc.) ← for CI/CD

---

## Deploying to Vercel

1. Push code to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in **Vercel → Project Settings → Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (Vercel doesn't have CLI access, so keys are needed here)
   - `AWS_REGION`
   - `BEDROCK_MODEL_ID`
4. Deploy — `api/chat.js` handles Bedrock streaming

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `CredentialsProviderError` | Run `aws configure` to set up your credentials |
| `Access denied` | Verify IAM user has `AmazonBedrockFullAccess` policy |
| `Could not resolve model` | Enable model access in Bedrock Console |
| `ValidationException` | Try `amazon.titan-text-express-v1` model |
| `ThrottlingException` | Rate limit — wait and retry |
