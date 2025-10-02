import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const VideoChat = ({ onComplete, onTranscription }) => {
  const localVideoRef = useRef();
  const mediaRecorderRef = useRef();
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef(null);
  const MAX_TIME = 120;

  useEffect(() => {
    socket.on("feedback", (msg) => console.log("Feedback:", msg));
    socket.on("transcription", (data) => {
      console.log("Transcription:", data.text);
      setTranscription(data.text);
      onTranscription && onTranscription(data.text);
      setCurrentStep(3); // Move to AI analysis step
    });
    socket.on("ai_feedback", (data) => {
      setProcessing(false);
      setCurrentStep(0);
      onComplete && onComplete(data);
    });
    socket.on("processing_step", (data) => {
      setCurrentStep(data.step);
    });
  }, [onComplete, onTranscription]);

  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev < MAX_TIME) return prev + 1;
        clearInterval(timerRef.current);
        stopRecording();
        return MAX_TIME;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimer(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          const buffer = await e.data.arrayBuffer();
          socket.emit("video-chunk", buffer);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setProcessing(true);
        setCurrentStep(1); // Start with video conversion
        socket.emit("video-complete", { blob: blob });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setPaused(false);
      startTimer();
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);
      stopTimer();
    }
  };

  const formatTime = (sec) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, "0");
    const seconds = String(sec % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const containerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    padding: "2rem",
    margin: "2rem auto",
    maxWidth: "800px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const videoStyle = {
    width: "100%",
    maxWidth: "600px",
    borderRadius: "15px",
    border: "3px solid rgba(255,255,255,0.3)",
    marginBottom: "1rem",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  };

  const timerStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "monospace",
  };

  const buttonStyle = (color, disabled = false) => ({
    padding: "12px 24px",
    margin: "0 8px",
    border: "none",
    borderRadius: "25px",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: disabled ? "#888" : color,
    boxShadow: disabled ? "none" : "0 4px 15px rgba(0,0,0,0.2)",
    transform: disabled ? "none" : "translateY(0)",
    transition: "all 0.3s ease",
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <div style={containerStyle}>
      <h2
        style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2rem" }}
      >
        🎥 Record Your Interview
      </h2>

      <div style={{ textAlign: "center" }}>
        <video ref={localVideoRef} autoPlay muted style={videoStyle} />
      </div>

      <div style={{ textAlign: "center", ...timerStyle }}>
        {formatTime(timer)} / {formatTime(MAX_TIME)}
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        {!recording && !processing && (
          <button onClick={startRecording} style={buttonStyle("#28a745")}>
            🎬 Start Recording
          </button>
        )}

        {recording && !paused && (
          <>
            <button onClick={pauseRecording} style={buttonStyle("#ffc107")}>
              ⏸️ Pause
            </button>
            <button onClick={stopRecording} style={buttonStyle("#dc3545")}>
              ⏹️ Stop
            </button>
          </>
        )}

        {recording && paused && (
          <>
            <button onClick={resumeRecording} style={buttonStyle("#17a2b8")}>
              ▶️ Resume
            </button>
            <button onClick={stopRecording} style={buttonStyle("#dc3545")}>
              ⏹️ Stop
            </button>
          </>
        )}

        {processing && (
          <div>
            <div
              style={{
                background: "rgba(0,0,0,0.8)",
                borderRadius: "15px",
                padding: "2rem",
                color: "white",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: "2rem", color: "#3b82f6" }}>
                🔄 Processing Your Interview...
              </h3>

              {[
                { id: 1, label: "Converting Video to Audio", icon: "🎥" },
                { id: 2, label: "Transcribing Speech to Text", icon: "📝" },
                { id: 3, label: "AI Analyzing Performance", icon: "🤖" },
                { id: 4, label: "Generating Feedback", icon: "✨" },
              ].map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    margin: "0.5rem 0",
                    borderRadius: "10px",
                    backgroundColor:
                      step.id < currentStep
                        ? "rgba(34, 197, 94, 0.3)"
                        : step.id === currentStep
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(107, 114, 128, 0.2)",
                    border:
                      step.id === currentStep
                        ? "2px solid #3b82f6"
                        : "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.5s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      marginRight: "1rem",
                      opacity: step.id <= currentStep ? 1 : 0.5,
                    }}
                  >
                    {step.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "left",
                      fontSize: "1.1rem",
                      fontWeight: step.id === currentStep ? "bold" : "normal",
                      opacity: step.id <= currentStep ? 1 : 0.7,
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      color:
                        step.id < currentStep
                          ? "#22c55e"
                          : step.id === currentStep
                          ? "#3b82f6"
                          : "#6b7280",
                    }}
                  >
                    {step.id < currentStep
                      ? "✅"
                      : step.id === currentStep
                      ? "🔄"
                      : "⏳"}
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginTop: "2rem",
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                }}
              >
                Step {currentStep} of 4 - Please wait...
              </div>

              <button
                onClick={() => {
                  setProcessing(false);
                  setCurrentStep(0);
                }}
                style={{
                  marginTop: "1rem",
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ❌ Cancel Processing
              </button>
            </div>
          </div>
        )}
      </div>

      {transcription && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "15px",
            padding: "1.5rem",
            marginTop: "1rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <h4 style={{ marginBottom: "1rem", color: "#ffd700" }}>
            📝 Live Transcription:
          </h4>
          <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
            {transcription}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
