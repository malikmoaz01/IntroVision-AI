import React, { useState } from "react";
import Navbar from "./components/Navbar";
import VideoChat from "./components/VideoChat";
import ChatBox from "./components/ChatBox";

const VideoUploader = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/process_video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      onUploadComplete(data);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadComplete({
        error: "Failed to process video. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const containerStyle = {
    background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
    borderRadius: "20px",
    padding: "2rem",
    margin: "2rem auto",
    maxWidth: "800px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const dropZoneStyle = {
    border: `3px dashed ${dragOver ? "#fff" : "rgba(255,255,255,0.5)"}`,
    borderRadius: "15px",
    padding: "3rem",
    textAlign: "center",
    backgroundColor: dragOver
      ? "rgba(255,255,255,0.1)"
      : "rgba(255,255,255,0.05)",
    transition: "all 0.3s ease",
    marginBottom: "2rem",
  };

  const uploadButtonStyle = {
    padding: "12px 30px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2rem" }}
      >
        📁 Upload Video for AI Analysis
      </h2>

      <div
        style={dropZoneStyle}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          style={{ display: "none" }}
          id="video-upload"
        />

        {!selectedFile ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📹</div>
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              Drag & drop your interview video here
            </p>
            <label
              htmlFor="video-upload"
              style={{
                ...uploadButtonStyle,
                backgroundColor: "#3498db",
                display: "inline-block",
              }}
            >
              Choose Video File
            </label>
          </>
        ) : (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              Selected: {selectedFile.name}
            </p>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              ...uploadButtonStyle,
              backgroundColor: uploading ? "#95a5a6" : "#27ae60",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "🔄 Processing with AI..." : "🚀 Analyze with AI"}
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState("record");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRecordingComplete = (aiResponse) => {
    setLoading(false);
    if (aiResponse && aiResponse.feedback) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse.feedback,
          score: aiResponse.score,
          improvements: aiResponse.improvements,
        },
      ]);
    }
  };

  const handleTranscription = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `Interview Transcription: ${text}`,
      },
    ]);
    setLoading(true);
  };

  const handleUploadComplete = (result) => {
    setLoading(false);
    if (result.error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${result.error}`,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.feedback || "Video processed successfully!",
          score: result.score,
          improvements: result.improvements,
        },
      ]);
    }
  };

  const appStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const mainStyle = {
    padding: "0 1rem",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  return (
    <div style={appStyle}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={mainStyle}>
        {activeTab === "record" && (
          <VideoChat
            onComplete={handleRecordingComplete}
            onTranscription={handleTranscription}
          />
        )}

        {activeTab === "upload" && (
          <VideoUploader onUploadComplete={handleUploadComplete} />
        )}

        <ChatBox messages={messages} loading={loading} />
      </main>
    </div>
  );
}

export default App;
