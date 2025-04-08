
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the HRM dashboard
    navigate("/hrm");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-pulse text-lg">Redirecting to HRM Dashboard...</div>
      </div>
    </div>
  );
};

export default Dashboard;
