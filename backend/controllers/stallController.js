const Stall = require("../models/Stall");
const SimpleStall = require("../models/SimpleStall");

const registerStall = async (req, res) => {
  console.log("Received registration request:", req.body);
  const { name, email, password, cuisineType = "Other" } = req.body;

  if (!name || !email || !password) {
    console.log("Missing required fields:", { name, email, password });
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists in either model
    const existingStall = await Stall.findOne({ email: email.toLowerCase() });
    const existingSimpleStall = await SimpleStall.findOne({
      email: email.toLowerCase(),
    });

    if (existingStall || existingSimpleStall) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new stall with cuisine type
    const newStall = new SimpleStall({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      cuisineType,
    });

    await newStall.save();

    // Remove password from response
    const responseStall = newStall.toObject();
    delete responseStall.password;

    res.status(201).json({
      message: "Stall registered successfully",
      stall: responseStall,
    });
  } catch (error) {
    console.error("Error registering stall:", error);
    res.status(500).json({
      message: "Error registering stall",
      error: error.message,
    });
  }
};

const loginStall = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Try to find the stall owner in both models
    let stall = await Stall.findOne({ email });

    // If not found in Stall, check SimpleStall
    if (!stall) {
      stall = await SimpleStall.findOne({ email });
    }

    if (!stall || stall.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Remove password from response
    const stallResponse = stall.toObject();
    delete stallResponse.password;

    res.status(200).json({
      message: "Login successful",
      stall: stallResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const getAllStalls = async (req, res) => {
  try {
    const simpleStalls = await SimpleStall.find().select("-password");
    const stalls = await Stall.find().select("-password");
    const allStalls = [...simpleStalls, ...stalls];
    res.status(200).json(allStalls);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stalls", error: error.message });
  }
};

const getSingleStall = async (req, res) => {
  const { id } = req.params;
  console.log("Getting single stall with ID:", id);

  try {
    // Try to find the stall in both models
    let stall = await Stall.findById(id);
    let isSimpleStall = false;

    // If not found in Stall model, try SimpleStall
    if (!stall) {
      console.log("Stall not found in Stall model, trying SimpleStall");
      stall = await SimpleStall.findById(id);
      isSimpleStall = true;
    }

    if (!stall) {
      console.log("Stall not found in either model");
      return res.status(404).json({ message: "Stall not found" });
    }

    // Ensure menu array exists
    if (!stall.menu) {
      stall.menu = [];
    }

    // Create response object
    const stallResponse = {
      _id: stall._id,
      name: stall.name,
      description: stall.description,
      image: stall.image,
      menu: stall.menu,
      isSimpleStall
    };

    console.log("Found stall:", {
      id: stall._id,
      name: stall.name,
      modelType: isSimpleStall ? "SimpleStall" : "Stall",
      menuItems: stall.menu.length
    });

    res.status(200).json(stallResponse);
  } catch (error) {
    console.error("Error getting single stall:", error);
    res.status(500).json({ message: "Error getting stall details", error: error.message });
  }
};

const createMenu = async (req, res) => {
  try {
    console.log("Received createMenu request:", req.body);
    const { stallID, name, price, description, nutritionInfo } = req.body;

    if (!stallID) {
      console.log("Missing stallID");
      return res.status(400).json({ message: "Stall ID is required" });
    }

    if (!name || !price) {
      console.log("Missing required fields:", { name, price });
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Try to find the stall in both models
    console.log("Searching for stall with ID:", stallID);

    // First try SimpleStall model since that's what we use for registration
    let stall = await SimpleStall.findById(stallID);
    let isSimpleStall = true;

    // If not found in SimpleStall model, try Stall model
    if (!stall) {
      console.log("Stall not found in SimpleStall model, trying Stall model");
      stall = await Stall.findById(stallID);
      isSimpleStall = false;
    }

    if (!stall) {
      console.log(
        "Stall not found in either model. Checking database contents:"
      );
      const simpleStalls = await SimpleStall.find({});
      const stalls = await Stall.find({});
      console.log(
        "SimpleStalls:",
        simpleStalls.map((s) => ({ id: s._id, name: s.name }))
      );
      console.log(
        "Stalls:",
        stalls.map((s) => ({ id: s._id, name: s.name }))
      );
      return res.status(404).json({
        message: "Stall not found",
        details: "The stall ID provided does not exist in either database",
      });
    }

    console.log("Found stall:", {
      id: stall._id,
      name: stall.name,
      model: isSimpleStall ? "SimpleStall" : "Stall",
      hasMenu: !!stall.menu,
    });

    // Create menu item with correct field mapping and include nutritional information
    const menuItem = {
      name: name,
      price: Number(price),
      description: description || "", // Use description directly
      isAvailable: true,
      averageRating: 0,
      totalReviews: 0,
      nutritionInfo: {
        calories:
          nutritionInfo && nutritionInfo.calories !== undefined
            ? Number(nutritionInfo.calories)
            : 0,
        protein:
          nutritionInfo && nutritionInfo.protein !== undefined
            ? Number(nutritionInfo.protein)
            : 0,
        carbs:
          nutritionInfo && nutritionInfo.carbs !== undefined
            ? Number(nutritionInfo.carbs)
            : 0,
        fat:
          nutritionInfo && nutritionInfo.fat !== undefined
            ? Number(nutritionInfo.fat)
            : 0,
      },
    };

    console.log("Created menu item:", menuItem);

    // Initialize menu array if it doesn't exist
    if (!stall.menu) {
      console.log("Initializing menu array");
      stall.menu = [];
    }

    // Add the menu item to the stall's menu array
    stall.menu.push(menuItem);

    console.log("Saving updated stall");
    // Save the updated stall
    const updatedStall = await stall.save();

    // Remove sensitive information from response
    const responseStall = updatedStall.toObject();
    delete responseStall.password;

    console.log("Menu item added successfully");
    return res.status(200).json({
      message: "Menu item added successfully",
      stall: responseStall,
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error creating menu item",
      error: error.message,
      details: error.stack,
    });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { stallID, name, items, studentID, time } = req.body; // items should be an array of objects

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items array is required and cannot be empty." });
    }

    const stall = await Stall.findById(stallID);

    if (!stall) {
      return res.status(404).json({ message: "Stall not found." });
    }

    // Create a new order object with the name and items
    const newOrder = {
      name: name, // Customer's name
      items: items, // The array of items with name and price
      studentID: studentID,
      time: time,
    };

    // Push the new order to the orders array
    stall.orders.push(newOrder);

    // Save the updated stall document
    await stall.save();

    return res
      .status(200)
      .json({ message: "Order placed successfully", stall });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
};

const removeOrder = async (req, res) => {
  try {
    const { stallId, orderId } = req.body;

    console.log("Received stallId:", stallId);
    console.log("Received orderId:", orderId);

    // Validate input
    if (!stallId || !orderId) {
      return res
        .status(400)
        .json({ message: "Stall ID and Order ID are required." });
    }

    // Find the stall and remove the order by its ID
    const updatedStall = await Stall.findByIdAndUpdate(
      stallId,
      { $pull: { orders: { _id: orderId } } },
      { new: true } // Return the updated document
    );

    if (!updatedStall) {
      return res.status(404).json({ message: "Stall or Order not found." });
    }

    res.status(200).json({
      message: "Order removed successfully.",
      updatedStall,
    });
  } catch (error) {
    console.error("Error during order removal:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { stallId, itemId } = req.params;
    const { name, price, description, nutritionInfo } = req.body;

    // Try to find the stall in both models
    let stall = await SimpleStall.findById(stallId);
    let isSimpleStall = true;

    // If not found in SimpleStall model, try Stall model
    if (!stall) {
      stall = await Stall.findById(stallId);
      isSimpleStall = false;
    }

    if (!stall) {
      return res.status(404).json({ message: "Stall not found" });
    }

    // Find the menu item and update it
    const menuItem = stall.menu.id(itemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    menuItem.name = name;
    menuItem.price = Number(price);
    menuItem.description = description || menuItem.description;

    // Update nutritional information if provided
    if (nutritionInfo) {
      menuItem.nutritionInfo = {
        calories:
          nutritionInfo.calories !== undefined
            ? Number(nutritionInfo.calories)
            : menuItem.nutritionInfo?.calories || 0,
        protein:
          nutritionInfo.protein !== undefined
            ? Number(nutritionInfo.protein)
            : menuItem.nutritionInfo?.protein || 0,
        carbs:
          nutritionInfo.carbs !== undefined
            ? Number(nutritionInfo.carbs)
            : menuItem.nutritionInfo?.carbs || 0,
        fat:
          nutritionInfo.fat !== undefined
            ? Number(nutritionInfo.fat)
            : menuItem.nutritionInfo?.fat || 0,
      };
    }

    // Save the updated stall
    const updatedStall = await stall.save();

    // Remove sensitive information from response
    const responseStall = updatedStall.toObject();
    delete responseStall.password;

    res.status(200).json({
      message: "Menu item updated successfully",
      stall: responseStall,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({
      message: "Error updating menu item",
      error: error.message,
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { stallId, itemId } = req.params;
    console.log("Attempting to delete menu item:", { stallId, itemId });

    // Try to find and update the stall in both models
    let updatedStall = await SimpleStall.findByIdAndUpdate(
      stallId,
      { $pull: { menu: { _id: itemId } } },
      { new: true }
    );

    // If not found in SimpleStall model, try Stall model
    if (!updatedStall) {
      console.log("Stall not found in SimpleStall, trying Stall model");
      updatedStall = await Stall.findByIdAndUpdate(
        stallId,
        { $pull: { menu: { _id: itemId } } },
        { new: true }
      );
    }

    if (!updatedStall) {
      console.log("Stall not found in either model");
      return res.status(404).json({ message: "Stall not found" });
    }

    console.log("Stall updated successfully");

    // Remove sensitive information from response
    const responseStall = updatedStall.toObject();
    delete responseStall.password;

    res.status(200).json({
      message: "Menu item deleted successfully",
      stall: responseStall,
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      message: "Error deleting menu item",
      error: error.message,
    });
  }
};

const getStallOrders = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching orders for stall:", id);

    // Try to find the stall in both models
    let stall = await SimpleStall.findById(id);
    let isSimpleStall = true;

    // If not found in SimpleStall model, try Stall model
    if (!stall) {
      console.log("Stall not found in SimpleStall, trying Stall model");
      stall = await Stall.findById(id);
      isSimpleStall = false;
    }

    if (!stall) {
      console.log("Stall not found in either model");
      return res.status(404).json({ message: "Stall not found" });
    }

    // Initialize orders array if it doesn't exist
    if (!stall.orders) {
      stall.orders = [];
    }

    console.log("Found stall with orders:", {
      id: stall._id,
      name: stall.name,
      model: isSimpleStall ? "SimpleStall" : "Stall",
      orderCount: stall.orders.length,
    });

    // Remove sensitive information from response
    const responseStall = stall.toObject();
    delete responseStall.password;

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: responseStall.orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

module.exports = {
  registerStall,
  loginStall,
  getAllStalls,
  getSingleStall,
  createMenu,
  placeOrder,
  removeOrder,
  updateMenuItem,
  deleteMenuItem,
  getStallOrders,
};
