import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#1a1a2e",
    borderBottom: "2px solid #16213e",
    color: "white",
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#00d4ff",
  };

  const tabsStyle = {
    display: "flex",
    gap: "1rem",
  };

  const buttonStyle = (isActive) => ({
    padding: "10px 20px",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: isActive ? "#00d4ff" : "transparent",
    color: isActive ? "#1a1a2e" : "white",
    border: isActive ? "none" : "2px solid #00d4ff",
    transition: "all 0.3s ease",
  });

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🤖 AI Interview Assistant</div>
      <div style={tabsStyle}>
        <button
          onClick={() => setActiveTab("record")}
          style={buttonStyle(activeTab === "record")}
        >
          📹 Record Interview
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          style={buttonStyle(activeTab === "upload")}
        >
          📁 Upload Video
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
