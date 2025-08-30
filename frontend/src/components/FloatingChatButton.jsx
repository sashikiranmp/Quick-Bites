import React from "react";
import { Link } from "react-router-dom";
import { FaComments } from "react-icons/fa";

const FloatingChatButton = () => {
  /* 
  // Commented out to disable old chat functionality
  // Only show for student users
  const user = JSON.parse(localStorage.getItem("User"));
  if (!user || !user.student) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/chatBot"
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
      >
        <FaComments className="text-2xl" />
      </Link>
    </div>
  );
  */

  // Return null to prevent rendering the button
  return null;
};

export default FloatingChatButton;
