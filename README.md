# 🎵 LoFi Studio - AI Mix Architect

A production-ready platform for creators to generate AI-powered lofi tracks and assemble long-form YouTube mixes with professional export assets.

## 🚀 Quick Start (Hostinger VPS)

Follow these steps to get LoFi Studio up and running on your Hostinger VPS in minutes.

### 1. Prerequisites
Ensure you have **Docker** and **Docker Compose** installed on your VPS.

### 2. Deployment
Clone your repository or upload the files to your VPS.

### 3. Launch
Run the automated launcher script:
```bash
chmod +x launcher.sh
./launcher.sh
```

The script will:
-   Check for Docker/Docker Compose.
-   Prompt you for your **Gemini API Key**.
-   Build and start the application using Docker.

### 4. Access
Once the script finishes, your studio will be live at:
`http://your-vps-ip:8080`

---

## 🛠️ Features

-   **AI Track Generation**: Create unique lofi beats using multiple AI providers.
-   **Smart Model Selector**: Choose from Gemini, OpenAI, Mistral, and more.
-   **Cost Estimator**: Real-time cost estimation for each model.
-   **YouTube SEO Pack**: Automated generation of titles, descriptions, and timestamps.
-   **HD Video Loops**: Generate high-quality background loops using Veo.

## ⚙️ Configuration

Manage your API keys and model preferences in the **Studio Config** section within the app. Keys are stored locally in your browser for maximum security.

## 📦 Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS v4.
-   **AI**: Gemini API (@google/genai), OpenAI, Mistral, DeepSeek.
-   **Deployment**: Docker, Nginx.

---

*Produced with LoFi Studio AI. Stay chill, stay focused.*
