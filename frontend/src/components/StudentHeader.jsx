import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaUtensils,
  FaClipboardList,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const StudentHeader = () => {
  const User = JSON.parse(localStorage.getItem("User"));
  const studentId = User?.student?._id;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-indigo-600/90 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo with enhanced styling */}
        <div className="flex items-center space-x-4">
          <div className="text-white text-4xl font-bold tracking-tight">
            QuickBites
            <span className="text-yellow-300 text-sm ml-2 font-medium bg-yellow-300/20 px-3 py-1 rounded-full">
              Student
            </span>
          </div>
        </div>

        {/* Navigation Links with improved styling */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/allStall"
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaUtensils className="text-xl" />
            <span>All Stalls</span>
          </Link>
          <Link
            to="/orderStatus"
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaClipboardList className="text-xl" />
            <span>Order Status</span>
          </Link>
          <Link
            to="/favorites"
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaHeart className="text-xl" />
            <span>Favorites</span>
          </Link>
          <Link
            to="/orderHistory"
            className="flex items-center space-x-2 text-white/90 hover:text-yellow-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <FaChartLine className="text-xl" />
            <span>Analytics</span>
          </Link>

          {/* Theme Toggle with improved positioning */}
          <div className="px-2">
            <ThemeToggle studentId={studentId} />
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("User");
              window.location.href = "/";
            }}
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

export default StudentHeader;
