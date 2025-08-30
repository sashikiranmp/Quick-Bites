// This entire file is commented out to prevent conflicts with the Chatbase implementation
/*
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import ChatInterface from "../../components/ChatInterface";
import { useNavigate } from "react-router-dom";

const ChatBot = () => {
  // All the original code goes here
  // This component is disabled to prevent conflicts with the Chatbase integration
};

export default ChatBot;
*/

// Simple placeholder component that redirects users
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatBot = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page since we're using Chatbase now
    navigate("/");
  }, [navigate]);

  return null;
};

export default ChatBot;
