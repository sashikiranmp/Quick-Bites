import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const StallHeader = () => {
  const navigate = useNavigate();

  // Safely get user data with error handling
  let User, stallId;
  try {
    const userData = localStorage.getItem("User");
    if (userData) {
      User = JSON.parse(userData);
      stallId = User?.stall?._id;
    }
  } catch (error) {
    console.error("Error parsing user data in StallHeader:", error);
  }

  const handleLogout = () => {
    localStorage.removeItem("User");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-emerald-600/90 to-teal-600/90 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="text-white text-4xl font-bold tracking-tight">
            QuickBites
            <span className="text-yellow-300 text-sm ml-2 font-medium bg-yellow-300/20 px-3 py-1 rounded-full">
              Stall Owner
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/createMenu")}
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaUtensils className="text-xl" />
            <span>Menu</span>
          </button>
          <button
            onClick={() => navigate("/checkOrders")}
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaClipboardList className="text-xl" />
            <span>Orders</span>
          </button>

          {/* Theme Toggle */}
          <div className="px-2">
            <ThemeToggle stallId={stallId} />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default StallHeader;
