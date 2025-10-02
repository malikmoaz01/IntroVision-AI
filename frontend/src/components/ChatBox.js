import React, { useEffect, useRef } from "react";

const ChatBox = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const containerStyle = {
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    borderRadius: "20px",
    padding: "1.5rem",
    margin: "2rem auto",
    maxWidth: "800px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const headerStyle = {
    color: "#ecf0f1",
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    textAlign: "center",
    borderBottom: "2px solid #3498db",
    paddingBottom: "1rem",
  };

  const messagesContainerStyle = {
    height: "400px",
    overflowY: "auto",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "15px",
    padding: "1rem",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  const messageStyle = (role) => ({
    marginBottom: "1rem",
    padding: "1rem",
    borderRadius: "15px",
    backgroundColor:
      role === "user" ? "rgba(52, 152, 219, 0.3)" : "rgba(46, 204, 113, 0.3)",
    border: `1px solid ${role === "user" ? "#3498db" : "#2ecc71"}`,
    color: "#ecf0f1",
    animation: "fadeIn 0.5s ease-in",
  });

  const roleStyle = {
    fontWeight: "bold",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const scoreStyle = {
    display: "inline-block",
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    marginLeft: "1rem",
  };

  const loadingStyle = {
    textAlign: "center",
    color: "#3498db",
    fontStyle: "italic",
    padding: "1rem",
  };

  const emptyStyle = {
    textAlign: "center",
    color: "#7f8c8d",
    fontStyle: "italic",
    padding: "2rem",
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>🤖 AI Interview Feedback & Analysis</h3>

      <div style={messagesContainerStyle}>
        {loading && (
          <div style={loadingStyle}>
            🔄 AI is analyzing your interview performance...
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div style={emptyStyle}>
            📝 Complete your interview recording to receive detailed AI feedback
            and scoring!
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} style={messageStyle(msg.role)}>
            <div style={roleStyle}>
              {msg.role === "user" ? "👤 User" : "🤖 AI Feedback"}
              {msg.score && (
                <span style={scoreStyle}>Score: {msg.score}/100</span>
              )}
            </div>
            <div
              style={{
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                fontSize: "1rem",
              }}
            >
              {msg.content}
            </div>
            {msg.improvements && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "rgba(241, 196, 15, 0.2)",
                  borderRadius: "10px",
                  border: "1px solid #f1c40f",
                }}
              >
                <strong style={{ color: "#f1c40f" }}>
                  💡 Suggested Improvements:
                </strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {msg.improvements.map((improvement, i) => (
                    <li key={i} style={{ marginBottom: "0.3rem" }}>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatBox;
