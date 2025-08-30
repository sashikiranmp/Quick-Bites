import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";

// Student imports
import AllStall from "./Pages/student/AllStalls";
import OrderStatus from "./Pages/student/Order";
import Favorites from "./Pages/student/Favorites";
import StudentOrderHistory from "./Pages/student/OrderHistory";
import ChatBot from "./Pages/student/ChatBot";
import StudentLayout from "./components/StudentLayout";

// Stall Owner imports
import CreateMenu from "./Pages/stall/CreateMenu";
import CheckOrders from "./Pages/stall/CheckOrders";
import StallOrderHistory from "./Pages/stall/OrderHistory";

import FloatingChatButton from "./components/FloatingChatButton";

function App() {
  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;

    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Routes>
          {/* Common Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          {/* Student Routes with StudentLayout */}
          <Route
            path="/allStall"
            element={
              <StudentLayout>
                <AllStall />
              </StudentLayout>
            }
          />
          <Route
            path="/orderStatus"
            element={
              <StudentLayout>
                <OrderStatus />
              </StudentLayout>
            }
          />
          <Route
            path="/favorites"
            element={
              <StudentLayout>
                <Favorites />
              </StudentLayout>
            }
          />
          <Route
            path="/orderHistory"
            element={
              <StudentLayout>
                <StudentOrderHistory />
              </StudentLayout>
            }
          />
          <Route
            path="/chatBot"
            element={
              <StudentLayout>
                <ChatBot />
              </StudentLayout>
            }
          />

          {/* Stall Owner Routes without StallLayout */}
          <Route path="/createMenu" element={<CreateMenu />} />
          <Route path="/checkOrders" element={<CheckOrders />} />
          <Route path="/stall/orderHistory" element={<StallOrderHistory />} />
        </Routes>
        <FloatingChatButton />
      </div>
    </Router>
  );
}

export default App;
