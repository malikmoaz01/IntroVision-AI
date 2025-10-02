# 🎙️ AI Mentor App — Interactive Self-Introduction Feedback System

An AI-powered interactive application that provides real-time feedback on your self-introduction. Speak for 2 minutes using your microphone and webcam, and receive instant mentor-like feedback on clarity, confidence, tone, and engagement — just like having a professional coach on a video call.

## ✨ Key Features

- **Live Audio & Video Capture** — Real-time microphone and webcam integration using WebRTC
- **Speech-to-Text (STT)** — Accurate transcription powered by GROQ API / Whisper
- **AI-Powered Analysis** — Intelligent evaluation of clarity, confidence, tone, and engagement
- **Instant Feedback Generation** — Constructive, actionable suggestions delivered in seconds
- **Text-to-Speech (TTS)** — Natural voice delivery of feedback using GROQ API
- **Seamless User Experience** — Modern React frontend with smooth video call interface

## 🛠️ Tech Stack

**Frontend:** React.js, WebRTC, Material UI / TailwindCSS  
**Backend:** FastAPI / Flask (Core Python)  
**AI/ML:** GROQ API (STT & TTS), OpenAI / HuggingFace (NLP Analysis)

## ⚡ Installation & Setup

Follow these steps to get the app running locally:

```bash
# Clone the repository
git clone https://github.com/malikmoaz01/ai-mentor-app.git
cd ai-mentor-app

# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your GROQ API key
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
# Or manually create .env file (see .env.example below)

# Start backend server
python app.py

# Frontend Setup (open new terminal)
cd ../frontend
npm install
npm start
```

The frontend will open at `http://localhost:3000` and backend at `http://localhost:5000`

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
DEBUG=True
```

**To get your GROQ API key:**

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/login
3. Navigate to API Keys section
4. Generate a new API key

## 🎯 How It Works

1. **User Starts Recording** → Click "Start" to activate webcam and microphone
2. **Audio Processing** → Real-time audio streaming to backend server
3. **Speech Transcription** → GROQ API converts speech to text with high accuracy
4. **AI Analysis** → Advanced NLP evaluates communication quality across multiple dimensions
5. **Feedback Generation** → Constructive suggestions created based on analysis
6. **Voice Delivery** → GROQ TTS converts feedback to natural speech
7. **User Receives Feedback** → Audio feedback delivered in real-time through speakers

## 📌 Example Interaction

**User Introduction:**  
_"Hi, my name is Alex. I am a software developer with 3 years of experience in building web applications. I specialize in React and Python..."_

**AI Feedback:**  
_"Your introduction is clear and well-structured. Consider adding more confidence when mentioning your technical skills. Try slowing down slightly during key points for better engagement. Great job highlighting your experience!"_

## 🚧 Technical Challenges Solved

- **Ultra-Low Latency** — Optimized WebRTC streaming for real-time interaction
- **Accent Recognition** — Robust speech recognition across diverse accents and speaking styles
- **Natural Feedback** — AI-generated responses that feel human and helpful, not robotic
- **Seamless Integration** — Smooth coordination between video, audio, and AI processing

## 🔮 Future Enhancements

- 📹 **Facial Expression Analysis** — Computer vision to evaluate non-verbal communication
- 🌍 **Multi-Language Support** — Feedback in multiple languages
- 📊 **Progress Analytics** — Detailed reports showing improvement over time
- 🎯 **Custom Scenarios** — Practice different types of introductions (interview, networking, etc.)
- 👥 **Multi-User Sessions** — Group practice with peer feedback

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GROQ for providing powerful AI APIs
- The open-source community for various libraries and tools

---

💡 **Think of this app as your personal AI communication coach** — sitting across from you like a mentor in a video call, giving you instant, actionable feedback to boost your presentation and communication skills.

**Star ⭐ this repo if you find it helpful!**
