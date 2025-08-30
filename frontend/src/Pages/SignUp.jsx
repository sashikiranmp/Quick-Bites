import React, { useState } from "react";
import axios from "axios"; // Import Axios
import bg from "../assets/bg2.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaUserTie } from "react-icons/fa";

const SignUp = () => {
  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // State for role
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Determine the signup URL based on the selected role
      const signupUrl =
        role === "Stall Owner"
          ? "http://localhost:8080/stall/register"
          : "http://localhost:8080/student/signup";

      const requestData = { name, email, password };

      console.log("Sending request to:", signupUrl);
      console.log("Request data:", requestData);

      const response = await axios.post(signupUrl, requestData);

      console.log("Registration response:", response.data);

      if (response.data.stall || response.data.student) {
        // User registered successfully, now automatically log them in
        const loginUrl =
          role === "Stall Owner"
            ? "http://localhost:8080/stall/login"
            : "http://localhost:8080/student/login";

        try {
          const loginResponse = await axios.post(loginUrl, {
            email,
            password,
          });

          console.log("Login response:", loginResponse.data);

          if (loginResponse.data.stall || loginResponse.data.student) {
            // Save user details in local storage
            const userData = loginResponse.data;
            // For stall owners, ensure the stall data is properly structured
            if (role === "Stall Owner" && userData.stall) {
              userData.stall = {
                _id: userData.stall._id,
                name: userData.stall.name,
                email: userData.stall.email
              };
            }
            localStorage.setItem("User", JSON.stringify(userData));
            console.log("Stored user data:", userData);

            // Redirect based on role
            if (role === "Stall Owner") {
              navigate("/createMenu");
            } else {
              navigate("/allStall");
            }
          } else {
            // Login failed for some reason, redirect to login page
            navigate("/login");
          }
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          // If auto-login fails, redirect to regular login page
          navigate("/login");
        }
      } else {
        setError(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.response?.status === 400) {
        setError(
          error.response.data.message ||
            "Invalid input. Please check your details."
        );
      } else {
        setError("Signup failed. Please try again.");
      }
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

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Welcome to QuickBites! Please fill in the details below to get
            started.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select your role</option>
                  <option value="Student">Student</option>
                  <option value="Stall Owner">Stall Owner</option>
                </select>
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
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
