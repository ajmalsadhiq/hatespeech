
# Hate Speech Detection System 🚫

[![Python](https://img.shields.io/badge/Python-3.9-blue.svg)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-1.12-red.svg)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/🤗-Transformers-yellow.svg)](https://huggingface.co)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end NLP system for automatic detection of hate speech, offensive language, and neutral text. Built with **BERT fine-tuning**, **FastAPI backend**, and **Next.js frontend**.

📓 **Google Colab Notebook:** [Open in Colab](https://colab.research.google.com/drive/1DY161P0h8ChTQWdCJo7Jpc47ent99WEB?usp=sharing)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Dataset](#dataset)
- [Model Architecture](#model-architecture)
- [Results](#results)
- [Google Colab](#google-colab-)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
Hate speech detection is a critical NLP task for content moderation on social media, forums, and comment sections. This project fine-tunes **BERT-base-uncased** to classify text into three categories:
- **Hate Speech** – Direct attacks targeting groups/individuals
- **Offensive** – Profanity or targeted insults (non-protected groups)
- **Neutral** – Safe, non-offensive content

The system provides a **real-time web interface** and a **REST API** for integration into other applications.

---

## ✨ Features
- ✅ Real-time text classification (under 200ms latency)
- ✅ Confidence scores for each prediction
- ✅ Prediction history stored in PostgreSQL
- ✅ Responsive UI (dark/light mode toggle)
- ✅ Docker support for easy deployment
- ✅ Google Colab notebook for training from scratch

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.9) |
| **ML Model** | BERT-base-uncased + HuggingFace Transformers |
| **Database** | PostgreSQL 15 |
| **Deployment** | Vercel (frontend), Render (backend) |
| **Notebook** | Google Colab Pro |

---

## 📊 Dataset
**Source:** Davidson et al. (2017) – "Automated Hate Speech Detection"  
**Size:** 24,783 tweets  
**Distribution:**
- Hate Speech: 1,430 (5.8%)
- Offensive: 19,190 (77.4%)
- Neutral: 4,163 (16.8%)

**Preprocessing:**
- Lowercasing
- Remove URLs, mentions, and special characters
- Tokenization with BERT tokenizer (max length 128)
- Train/validation/test split: 70/15/15

---

## 🧠 Model Architecture

```
Input Text → BERT Tokenizer → BERT Embeddings (768) 
→ 12 Transformer Layers → Dropout(0.1) 
→ Linear(768, 3) → Softmax → [Hate, Offensive, Neutral]
```

**Training Hyperparameters:**
- Optimizer: AdamW (lr=2e-5)
- Loss: Cross-entropy with class weights
- Batch size: 16
- Epochs: 3
- Mixed precision (FP16) for faster training

---

## 📈 Results

| Class | Precision | Recall | F1-Score |
|-------|-----------|--------|-----------|
| Hate Speech | 0.87 | 0.82 | 0.84 |
| Offensive | 0.91 | 0.93 | 0.92 |
| Neutral | 0.96 | 0.95 | 0.95 |

**Overall Accuracy:** 92.3%  
**AUC-ROC:** 0.96  

---


### Google Colab Features Used
- GPU acceleration (NVIDIA T4)
- Google Drive mounting for saving models
- TensorBoard logging
- Early stopping callback

---

## 💻 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- pip & npm

### Backend Setup
```bash
# Clone repository
git clone https://github.com/ajmalsadhiq/hatespeech.git
cd hatespeech/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download pre-trained model (or train your own)
python download_model.py

# Run FastAPI server
uvicorn app:app --reload --port 8000
```

### Frontend Setup
```bash
cd ../frontend  # or just 'cd ..' if frontend is in root

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### Database Setup
```sql
-- Create database
CREATE DATABASE hatespeech_db;

-- Run migrations
psql -d hatespeech_db -f backend/migrations/001_create_predictions.sql
```

---

## 🔧 Usage

### Web Interface
1. Open `http://localhost:3000`
2. Enter text in the input box
3. Click "Analyze" to get prediction
4. View history in the table below


### API Usage
```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "You are worthless and don't belong here"}
)

print(response.json())
# Output: {"label": "hate_speech", "confidence": 0.94, "probabilities": {...}}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"This is stupid, you idiot"}'
```

---

## 📁 Project Structure

```
hatespeech/
├── backend/
│   ├── app.py              # FastAPI main application
│   ├── model.py            # BERT model wrapper
│   ├── preprocess.py       # Text preprocessing functions
│   ├── requirements.txt    # Python dependencies
│   └── migrations/         # Database schemas
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main UI component
│   │   ├── api/            # Next.js API routes
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom hooks (usePredict)
│   └── styles/             # Tailwind CSS files
├── notebooks/
│   └── hatespeech_training.ipynb  # Colab notebook
├── scripts/
│   └── download_dataset.py # Dataset download utility
├── screenshots/            # Images for README
├── docker-compose.yml      # Multi-container setup
└── README.md
```

---

## 🚧 Future Improvements

- [ ] Add multilingual support (Hindi, Spanish, Arabic)
- [ ] Deploy with Kubernetes for auto-scaling
- [ ] Integrate active learning for hard examples
- [ ] Add user reporting mechanism for false predictions
- [ ] Fine-tune with HateXplain dataset for explainability
- [ ] Create Chrome extension for real-time social media moderation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgements

- [HuggingFace Transformers](https://github.com/huggingface/transformers)
- [Davidson et al. (2017) Dataset](https://github.com/t-davidson/hate-speech-and-offensive-language)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/)

---

## 📧 Contact

Ajmal Sadhiq PE - [@ajmalsadhiq](https://github.com/ajmalsadhiq)  
Project Link: [https://github.com/ajmalsadhiq/hatespeech](https://github.com/ajmalsadhiq/hatespeech)  

---

**⭐ Star this repository if you found it useful!**
```

