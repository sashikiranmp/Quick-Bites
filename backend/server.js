const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const studentRoutes = require("./routes/studentRoutes");
const stallRoutes = require("./routes/stallRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userPreferencesRoutes = require("./routes/userPreferencesRoutes");
const connectDB = require("./config/db");
const Stall = require("./models/Stall");
const SimpleStall = require("./models/SimpleStall");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/student", studentRoutes);
app.use("/stall", stallRoutes);
app.use("/reviews", reviewRoutes);
app.use("/preferences", userPreferencesRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for new orders from students
  socket.on("newOrder", async (data) => {
    console.log("New order received:", data);

    try {
      // Extract the order details
      const { stallID, stallName, order } = data;

      if (!stallID) {
        console.error("StallID missing in the order data");
        return;
      }

      console.log(`Attempting to save order to stall with ID: ${stallID}`);

      // Try to find the stall in both models
      let stall = await Stall.findById(stallID);
      let isSimpleStall = false;

      // If not found in Stall model, try SimpleStall model
      if (!stall) {
        stall = await SimpleStall.findById(stallID);
        isSimpleStall = true;
      }

      if (!stall) {
        console.error(`Stall not found with ID: ${stallID}`);
        return;
      }

      // Create a new order object
      const newOrder = {
        name: order.name,
        items: order.items,
        studentID: order.studentID,
        time: order.time,
        status: "pending",
        createdAt: new Date(),
      };

      // Initialize orders array if it doesn't exist
      if (!stall.orders) {
        stall.orders = [];
      }

      // Add the order to the stall
      stall.orders.push(newOrder);

      // Save the updated stall
      await stall.save();

      console.log(`Order saved successfully to stall: ${stallName}`);

      // Broadcast the new order to all connected clients (stalls)
      io.emit("newOrder", data);
    } catch (error) {
      console.error("Error saving order to stall:", error);
    }
  });

  socket.on("updateStatus", (status) => {
    console.log("Status update received:", status);
    io.emit("statusUpdate", status); // Broadcast to all connected clients
  });

  // Listen for menu updates from stalls
  socket.on("menuUpdated", (data) => {
    console.log("Menu update received:", data);
    io.emit("menuUpdated", data); // Broadcast to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

httpServer.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
