import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StallHeader from "./StallHeader";

const StallLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is a stall owner
    const user = JSON.parse(localStorage.getItem("User"));
    console.log("StallLayout - User data:", user);

    if (!user) {
      console.log("StallLayout - No user found, redirecting to login");
      navigate("/login");
      return;
    }

    if (!user.stall) {
      console.log(
        "StallLayout - User is not a stall owner, redirecting to login"
      );
      navigate("/login");
    } else {
      console.log("StallLayout - Valid stall owner detected");
    }
  }, [navigate]);

  // Apply the theme from localStorage when component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <StallHeader />
      <main className="flex-grow text-gray-900 dark:text-white">
        {children}
      </main>
    </div>
  );
};

export default StallLayout;
