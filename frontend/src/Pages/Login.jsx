import React, { useState } from "react";
import axios from "axios"; // Import Axios
import bg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // State for role selection
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const userCredentials = {
      email,
      password,
    };

    // Determine the login URL based on the selected role
    const loginUrl =
      role === "Stall Owner"
        ? "http://localhost:8080/stall/login"
        : "http://localhost:8080/student/login";

    try {
      console.log("Selected Role:", role); // Log the selected role
      const response = await axios.post(loginUrl, userCredentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Data:", response.data); // Log the response data

      // Check if we have a stall object (for stall owners) or student object in the response
      if (
        response.data.stall ||
        response.data.student ||
        response.data.success
      ) {
        // Store user data in localStorage
        localStorage.setItem("User", JSON.stringify(response.data));

        // If it's a stall owner, store the stall ID separately
        if (role === "Stall Owner" && response.data.stall) {
          localStorage.setItem("stallID", response.data.stall._id);
          console.log("Stall ID stored:", response.data.stall._id);
        }

        console.log("User data stored in localStorage");

        // Show alert and navigate after clicking OK
        alert("Login successful!");
        console.log("Alert shown");

        // Navigate based on role selection
        if (role === "Stall Owner") {
          console.log("Attempting to navigate to /createMenu");
          navigate("/createMenu");
        } else {
          console.log("Attempting to navigate to /allStall");
          navigate("/allStall");
        }
      } else {
        console.log("Login not successful:", response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
      {/* Project Name */}
      <div className="text-white text-5xl font-bold mb-8">QuickBites</div>

      {/* Background image with fallback */}
      {!imageError && (
        <img
          className="w-[40vw] object-contain"
          src={bg}
          alt="Background"
          onError={() => setImageError(true)}
        />
      )}

      {/* Login Form Box */}
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Stall Owner">Stall Owner</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Sign Up Text */}
        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signUp" className="text-blue-500 hover:text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
