import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaUtensils,
  FaInfo,
  FaFire,
  FaWeightHanging,
  FaExclamationTriangle,
} from "react-icons/fa";
import StallHeader from "../../components/StallHeader";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const CreateMenu = () => {
  console.log("CreateMenu component loaded");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuCreated, setIsMenuCreated] = useState(false);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    itemId: null,
    itemName: "",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [stallOwnerName, setStallOwnerName] = useState("");
  const [stallID, setStallID] = useState("");

  useEffect(() => {
    // Load user data and stall ID from localStorage
    try {
      const userDataString = localStorage.getItem("User");
      console.log("User data from localStorage:", userDataString);

      if (!userDataString) {
        console.error("No user data found in localStorage");
        setError("Please log in to access this page");
        return;
      }

      const userData = JSON.parse(userDataString);
      console.log("Parsed user data:", userData);

      // Get stallID from the stall property
      const stallID = userData?.stall?._id;
      console.log("Stall ID from user data:", stallID);

      if (!stallID) {
        console.error("No stall ID found in user data");
        setError("Stall information not found. Please log in again.");
        return;
      }

      // Store the stallID in state
      setStallID(stallID);
      setStallOwnerName(userData?.stall?.name || "Stall Owner");

      // Fetch menu immediately after getting stall ID
      fetchMenu(stallID);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setError("Error loading user data. Please try logging in again.");
    }
  }, []);

  const fetchMenu = async (stallId) => {
    try {
      if (!stallId) {
        console.error("No stall ID provided to fetchMenu");
        setError("Please log in again to access this page");
        return;
      }

      setLoading(true);
      setError(null);

      console.log("Fetching menu for stall ID:", stallId);
      const response = await axios.get(`http://localhost:8080/stall/${stallId}`);
      
      if (response.data) {
        console.log("Stall data received:", response.data);
        if (response.data.menu) {
          setMenu(response.data.menu);
          console.log("Menu loaded successfully:", response.data.menu);
        } else {
          console.log("No menu items found, initializing empty menu");
          setMenu([]);
        }
      } else {
        console.error("No data received from stall endpoint");
        setError("Failed to load stall data");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      setError(error.response?.data?.message || "Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle showing delete confirmation dialog
  const showDeleteConfirmation = (id, name) => {
    setDeleteConfirmation({
      show: true,
      itemId: id,
      itemName: name,
    });
  };

  // Handle confirmed deletion
  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      await handleDelete(deleteConfirmation.itemId);
      setDeleteConfirmation({ show: false, itemId: null, itemName: "" });
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newItem.name || !newItem.price) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate numeric fields
    if (newItem.price <= 0) {
      alert("Price must be greater than zero");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!stallID) {
        console.error("No stall ID found in state");
        setError("Please log in again to access this page");
        return;
      }

      console.log("Submitting menu item:", newItem);

      // Prepare request data
      const requestData = {
        stallID: stallID,
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description || "",
        nutritionInfo: {
          calories: newItem.calories ? Number(newItem.calories) : 0,
          protein: newItem.protein ? Number(newItem.protein) : 0,
          carbs: newItem.carbs ? Number(newItem.carbs) : 0,
          fat: newItem.fat ? Number(newItem.fat) : 0,
        },
      };

      console.log("Sending request data:", requestData);

      // Use the correct endpoint for creating menu items
      const response = await axios.post(
        `http://localhost:8080/stall/menu`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.stall) {
        alert("Item added successfully!");
        setIsModalOpen(false);
        setNewItem({
          name: "",
          description: "",
          price: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        });

        // Update the menu state directly with the new data
        setMenu(response.data.stall.menu);
        console.log("Menu updated successfully:", response.data.stall.menu);

        // Emit socket event for real-time menu updates
        socket.emit("menuUpdated", {
          stallID: stallID,
          menu: response.data.stall.menu,
        });
      } else {
        alert(response.data.message || "Failed to add menu item");
      }
    } catch (error) {
      console.error("Error adding menu item:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "An error occurred while adding the menu item. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (index) => {
    const item = menu[index];
    setEditingIndex(index);
    setNewItem({
      name: item.name,
      description: item.description || "", // Changed from item.info to item.description
      price: item.price,
      calories: item.nutritionInfo?.calories || "",
      protein: item.nutritionInfo?.protein || "",
      carbs: item.nutritionInfo?.carbs || "",
      fat: item.nutritionInfo?.fat || "",
    });
  };

  const handleUpdate = async (index) => {
    try {
      const stallID = localStorage.getItem("stallID");
      if (!stallID) {
        console.error("No stall ID found in localStorage");
        setError("Please log in again to access this page");
        return;
      }

      console.log("Updating menu item:", {
        stallID,
        itemId: menu[index]._id,
        newData: newItem,
      });

      const response = await axios.put(
        `http://localhost:8080/stall/menu/${stallID}/${menu[index]._id}`,
        {
          name: newItem.name,
          price: Number(newItem.price),
          description: newItem.description, // Changed from info to description
          nutritionInfo: {
            calories: newItem.calories ? Number(newItem.calories) : 0,
            protein: newItem.protein ? Number(newItem.protein) : 0,
            carbs: newItem.carbs ? Number(newItem.carbs) : 0,
            fat: newItem.fat ? Number(newItem.fat) : 0,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.stall) {
        alert("Item updated successfully!");
        setEditingIndex(-1);
        setNewItem({
          name: "",
          description: "",
          price: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        });
        // Update the menu state directly with the new data
        setMenu(response.data.stall.menu);
        console.log("Menu updated successfully:", response.data.stall.menu);

        // Emit socket event for real-time menu updates
        socket.emit("menuUpdated", {
          stallID: stallID,
          menu: response.data.stall.menu,
        });
      } else {
        alert(response.data.message || "Failed to update menu item");
      }
    } catch (error) {
      console.error("Error updating menu item:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "An error occurred while updating the menu item"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const stallID = localStorage.getItem("stallID");
      if (!stallID) {
        console.error("No stall ID found in localStorage");
        setError("Please log in again to access this page");
        return;
      }

      console.log("Deleting menu item:", { stallID, itemId: id });

      const response = await axios.delete(
        `http://localhost:8080/stall/menu/${stallID}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.stall) {
        alert("Item deleted successfully!");
        // Update the menu state directly with the new data
        setMenu(response.data.stall.menu);
        console.log("Menu updated after deletion:", response.data.stall.menu);

        // Emit socket event for real-time menu updates
        socket.emit("menuUpdated", {
          stallID: stallID,
          menu: response.data.stall.menu,
        });
      } else {
        alert(response.data.message || "Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "An error occurred while deleting the menu item"
      );
    }
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    setNewItem({
      name: "",
      description: "",
      price: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  if (error) {
    return (
      <>
        <StallHeader />
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <StallHeader />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <StallHeader />
      <div className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Welcome heading */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-amber-800 dark:text-amber-400">
              Welcome, {stallOwnerName}!
            </h1>
          </div>

          {/* Hero section */}
          <div className="mb-12 bg-gradient-to-r from-amber-100 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-lg border border-amber-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-xl"></div>
            <div className="absolute right-20 top-8 w-24 h-24 bg-orange-200/30 dark:bg-orange-700/10 rounded-full blur-xl"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-3">
                  Manage Your Menu
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-5 max-w-xl">
                  Easily add, edit, or remove dishes from your menu. Keep your
                  offerings fresh and exciting for your customers!
                </p>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {menu.length} Active Items
                  </span>
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <FaUtensils className="w-3 h-3 mr-2 text-amber-600 dark:text-amber-400" />
                    Stall Menu
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <FaPlus className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">
                  Add New Dish
                </span>
              </button>
            </div>
          </div>

          {/* Menu Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-md border border-amber-200 dark:border-gray-700">
                <div className="mb-6 bg-amber-100 dark:bg-amber-900/20 p-5 rounded-full">
                  <FaUtensils className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4">
                  Your Menu is Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  Start creating your delicious menu by adding your first dish.
                  Showcase your specialties to attract more customers!
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3"
                >
                  <FaPlus className="w-5 h-5" />
                  Add Your First Dish
                </button>
              </div>
            ) : (
              menu.map((menuItem, index) => (
                <div
                  key={menuItem._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 overflow-hidden group hover:-translate-y-1"
                >
                  <div className="border-b-2 border-amber-50 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-gray-700 dark:to-gray-800 py-3 px-4">
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400">
                      {menuItem.name}
                    </h3>
                  </div>

                  <div className="p-6">
                    {menuItem.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic">
                        "{menuItem.description}"
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-5">
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        ₹{menuItem.price}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                        <FaUtensils className="w-3 h-3" />
                        <span>Menu Item #{index + 1}</span>
                      </div>
                    </div>

                    {/* Nutrition Information */}
                    <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 dark:from-gray-700/50 dark:to-gray-800/50 p-3 rounded-xl mb-5">
                      <div className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2 font-semibold">
                        Nutrition Facts
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <FaFire className="w-3 h-3" />
                          <span>
                            {menuItem.nutritionInfo?.calories || 0} calories
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <FaWeightHanging className="w-3 h-3" />
                          <span>
                            {menuItem.nutritionInfo?.protein || 0}g protein
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <span className="font-bold text-xs">C</span>
                          <span>
                            {menuItem.nutritionInfo?.carbs || 0}g carbs
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <span className="font-bold text-xs">F</span>
                          <span>{menuItem.nutritionInfo?.fat || 0}g fat</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(index)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          showDeleteConfirmation(menuItem._id, menuItem.name)
                        }
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <FaTrash className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Item Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn">
                <div className="text-center mb-8">
                  <div className="inline-flex mb-4 bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
                    <FaUtensils className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    Add New Menu Item
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill in the details to create a delicious new menu item
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                      >
                        <span className="mr-1">Item Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newItem.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="E.g., Butter Chicken"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                          <FaUtensils />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                      >
                        <span className="mr-1">Price (₹)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={newItem.price}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="E.g., 150"
                          required
                          min="0"
                          step="any"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold">
                          ₹
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                    >
                      <span className="mr-1">Description</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="description"
                        name="description"
                        value={newItem.description}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="Describe your dish - ingredients, taste, etc."
                        rows="3"
                      />
                      <div className="absolute left-3 top-3 text-amber-500">
                        <FaInfo />
                      </div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      A good description helps customers understand what they're
                      ordering
                    </div>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-gray-700/30 p-5 rounded-xl border border-amber-100 dark:border-gray-700">
                    <h3 className="text-md font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <FaWeightHanging className="w-4 h-4" />
                      Nutrition Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="calories"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Calories
                        </label>
                        <input
                          type="number"
                          id="calories"
                          name="calories"
                          value={newItem.calories}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="kcal"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="protein"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          id="protein"
                          name="protein"
                          value={newItem.protein}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="carbs"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          id="carbs"
                          name="carbs"
                          value={newItem.carbs}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="fat"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          id="fat"
                          name="fat"
                          value={newItem.fat}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/20 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-50 dark:hover:bg-gray-700 transition-all duration-300 flex justify-center items-center gap-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transform transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <FaPlus className="w-5 h-5" />
                          <span>Add Item</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingIndex !== -1 && (
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn">
                <div className="text-center mb-8">
                  <div className="inline-flex mb-4 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <FaEdit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Edit Menu Item
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update the details of{" "}
                    {menu[editingIndex]?.name || "your dish"}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(editingIndex);
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="edit-name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                      >
                        <span className="mr-1">Item Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="edit-name"
                          name="name"
                          value={newItem.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="Enter item name"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                          <FaUtensils />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="edit-price"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                      >
                        <span className="mr-1">Price (₹)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="edit-price"
                          name="price"
                          value={newItem.price}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="Enter price"
                          required
                          min="0"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-bold">
                          ₹
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                    >
                      <span className="mr-1">Description</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="edit-description"
                        name="description"
                        value={newItem.description}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="Describe your dish - ingredients, taste, etc."
                        rows="3"
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <FaInfo />
                      </div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      A good description helps customers understand what they're
                      ordering
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-gray-700/30 p-5 rounded-xl border border-blue-100 dark:border-gray-700">
                    <h3 className="text-md font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <FaWeightHanging className="w-4 h-4" />
                      Nutrition Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="edit-calories"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Calories
                        </label>
                        <input
                          type="number"
                          id="edit-calories"
                          name="calories"
                          value={newItem.calories}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="kcal"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-protein"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          id="edit-protein"
                          name="protein"
                          value={newItem.protein}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-carbs"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          id="edit-carbs"
                          name="carbs"
                          value={newItem.carbs}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-fat"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          id="edit-fat"
                          name="fat"
                          value={newItem.fat}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900/20 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          placeholder="grams"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-6 py-3 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 flex justify-center items-center gap-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
                    >
                      <FaEdit className="w-5 h-5" />
                      <span>Update Item</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmation.show && (
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-[400px] max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Confirm Deletion
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{" "}
                    <strong>{deleteConfirmation.itemName}</strong>?
                  </p>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirmation({
                        show: false,
                        itemId: null,
                        itemName: "",
                      })
                    }
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium hover:from-red-700 hover:to-pink-700 transform transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                    disabled={submitting}
                  >
                    {submitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateMenu;
