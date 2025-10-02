import React from "react";

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Converting Video to Audio", icon: "🎥" },
    { id: 2, label: "Transcribing Speech to Text", icon: "📝" },
    { id: 3, label: "AI Analyzing Performance", icon: "🤖" },
    { id: 4, label: "Generating Feedback", icon: "✨" },
  ];

  const containerStyle = {
    background: "rgba(0,0,0,0.8)",
    borderRadius: "15px",
    padding: "2rem",
    margin: "2rem auto",
    maxWidth: "600px",
    color: "white",
    textAlign: "center",
  };

  const stepStyle = (step) => ({
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
  });

  const iconStyle = (step) => ({
    fontSize: "2rem",
    marginRight: "1rem",
    opacity: step.id <= currentStep ? 1 : 0.5,
  });

  const labelStyle = (step) => ({
    flex: 1,
    textAlign: "left",
    fontSize: "1.1rem",
    fontWeight: step.id === currentStep ? "bold" : "normal",
    opacity: step.id <= currentStep ? 1 : 0.7,
  });

  const statusStyle = (step) => ({
    fontSize: "1.5rem",
    color:
      step.id < currentStep
        ? "#22c55e"
        : step.id === currentStep
        ? "#3b82f6"
        : "#6b7280",
  });

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: "2rem", color: "#3b82f6" }}>
        🔄 Processing Your Interview...
      </h3>

      {steps.map((step) => (
        <div key={step.id} style={stepStyle(step)}>
          <span style={iconStyle(step)}>{step.icon}</span>
          <span style={labelStyle(step)}>{step.label}</span>
          <span style={statusStyle(step)}>
            {step.id < currentStep
              ? "✅"
              : step.id === currentStep
              ? "🔄"
              : "⏳"}
          </span>
        </div>
      ))}

      <div style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#9ca3af" }}>
        Step {currentStep} of {steps.length} - Please wait...
      </div>
    </div>
  );
};

export default ProgressIndicator;
