import React, { useEffect, useState } from "react";
import axios from "axios";
import cafe from "../../assets/cafe.png";
import {
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaSort,
  FaClock,
  FaStar,
  FaFire,
  FaWeightHanging,
  FaExclamationTriangle,
} from "react-icons/fa";
import io from "socket.io-client";
import PaymentModal from '../../components/PaymentModal';

const socket = io("http://localhost:8080");

const AllStalls = () => {
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [selectedStallMenu, setSelectedStallMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [stall, setStall] = useState(null);
  const [stallName, setStallName] = useState("");
  const [time, setTime] = useState("");
  const [favoriteStalls, setFavoriteStalls] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(true); // New state for toggling time picker mode
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Get user data from localStorage
  const User = JSON.parse(localStorage.getItem("User"));
  // Fix: handle both possible structures of the user data
  const studentId = User?.student?._id || (User?.student && User.student._id);

  // Fetch all stalls
  useEffect(() => {
    const fetchStalls = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching stalls from http://localhost:8080/stall/");
        const response = await axios.get("http://localhost:8080/stall/", {
          timeout: 10000, // Set a timeout to avoid hanging requests
        });
        console.log("Stalls response:", response.data);
        if (Array.isArray(response.data)) {
          setStalls(response.data);
          setFilteredStalls(response.data);
        } else if (response.data && typeof response.data === "object") {
          // Handle case where response might be an object instead of array
          const stallsArray = Array.isArray(response.data.stalls)
            ? response.data.stalls
            : response.data.data && Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setStalls(stallsArray);
          setFilteredStalls(stallsArray);
        } else {
          console.error("Unexpected response format:", response.data);
          setError(
            "Received invalid data format from server. Please try again."
          );
        }
      } catch (error) {
        console.error("Error fetching stalls:", error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          setError(
            `Failed to fetch stalls: ${
              error.response.data?.message ||
              error.response.statusText ||
              "Server error"
            }`
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          setError(
            "No response from server. Please check if the backend is running."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${error.message || "Unknown error occurred"}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStalls();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!studentId) {
        console.log("No student ID found, skipping favorites fetch");
        setFavoriteStalls(new Set());
        return;
      }

      try {
        console.log(`Fetching favorites for student ID: ${studentId}`);
        const response = await axios.get(
          `http://localhost:8080/preferences/${studentId}/favorites`
        );

        if (response.data.success) {
          // Safely extract unique stall IDs from favorites with null checks
          const stallIds = new Set();

          if (Array.isArray(response.data.data)) {
            response.data.data.forEach((fav) => {
              if (fav && fav.stallId) {
                // Handle both object format and string format
                const id = fav.stallId._id
                  ? fav.stallId._id.toString()
                  : fav.stallId.toString();
                stallIds.add(id);
              }
            });
          }

          console.log(`Found ${stallIds.size} favorite stalls`);
          setFavoriteStalls(stallIds);
        } else {
          console.log("No favorites found in response");
          setFavoriteStalls(new Set()); // Initialize as empty Set if no favorites
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        if (error.response?.status === 404) {
          // Student not found, initialize empty favorites
          console.log("Student not found (404), setting empty favorites");
          setFavoriteStalls(new Set());
        } else {
          // Other error, but don't alert to avoid disrupting UX
          console.log("Failed to fetch favorites:", error.message);
          setFavoriteStalls(new Set());
        }
      }
    };

    fetchFavorites();
  }, [studentId]);

  // Filter and sort stalls based on search query and sort option
  useEffect(() => {
    let filtered = [...stalls];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((stall) =>
        stall.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "popularity":
          return (b.rating || 0) - (a.rating || 0);
        case "favorites":
          return (
            (favoriteStalls.has(b._id.toString()) ? 1 : 0) -
            (favoriteStalls.has(a._id.toString()) ? 1 : 0)
          );
        default:
          return 0;
      }
    });

    setFilteredStalls(filtered);
  }, [stalls, searchQuery, sortBy, favoriteStalls]);

  // Open menu modal and set the menu for the selected stall
  const openMenuModal = (stall) => {
    setStallName(stall.name);
    setStall(stall._id);
    setSelectedStallMenu(stall.menu);
    setSelectedItems([]); // Reset selected items
    setTime(""); // Reset time field
    setIsMenuModalOpen(true);
  };

  // Handle item selection
  const toggleItemSelection = (item) => {
    setSelectedItems((prevItems) =>
      prevItems.includes(item)
        ? prevItems.filter((i) => i !== item)
        : [...prevItems, item]
    );
  };

  const handlePlaceOrderStudent = async () => {
    if (!time) {
      alert("Please select a pickup time");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    const orderItems = selectedItems.map((item) => ({
      item: item.name,
      price: item.price,
    }));

    // Calculate total amount
    const amount = orderItems.reduce((sum, item) => sum + item.price, 0);
    setTotalAmount(amount);
    
    // Open payment modal instead of directly placing order
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const orderItems = selectedItems.map((item) => ({
        item: item.name,
        price: item.price,
      }));

      // Place order for student
      const response = await axios.post("http://localhost:8080/student/order", {
        studentID: studentId,
        name: stallName,
        items: orderItems,
        pickupTime: time,
        paymentStatus: 'paid',
        transactionId: paymentResult.transactionId
      });

      if (response.data && response.data.success) {
        socket.emit("newOrder", {
          stallName: stallName,
          stallID: stall,
          order: {
            _id: response.data.order?._id || new Date().getTime(),
            name: User.student.name,
            studentID: studentId,
            items: orderItems,
            time: time,
            createdAt: new Date().toISOString(),
            status: "pending",
            paymentStatus: 'paid',
            transactionId: paymentResult.transactionId
          },
        });

        setIsMenuModalOpen(false);
        setIsOrderModalOpen(true);
        setTimeout(() => setIsOrderModalOpen(false), 3000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPaymentModalOpen(false);
    }
  };

  const handlePaymentFailure = (errorMessage) => {
    alert(errorMessage);
    setIsPaymentModalOpen(false);
  };

  // Toggle favorite status for a stall
  const toggleFavorite = async (stallId, e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    if (!studentId) {
      console.log("Student ID not available");
      return;
    }

    try {
      // Convert stallId to string for consistent comparison
      const stallIdStr = stallId.toString();

      // Check if the stall is already in favorites using string comparison
      const isFavorite = favoriteStalls.has(stallIdStr);

      if (isFavorite) {
        // Using DELETE request for removing favorites
        const response = await axios.delete(
          `http://localhost:8080/preferences/${studentId}/favorites`,
          {
            data: {
              stallId: stallIdStr,
              menuItemId: "all",
            },
          }
        );

        if (response.status === 200) {
          setFavoriteStalls((prevFavorites) => {
            const newFavorites = new Set(prevFavorites);
            newFavorites.delete(stallIdStr);
            return newFavorites;
          });
        }
      } else {
        // Using POST request for adding favorites
        const response = await axios.post(
          `http://localhost:8080/preferences/${studentId}/favorites`,
          {
            stallId: stallIdStr,
            menuItemId: "all",
          }
        );

        if (response.status === 200) {
          setFavoriteStalls((prevFavorites) => {
            const newFavorites = new Set(prevFavorites);
            newFavorites.add(stallIdStr);
            return newFavorites;
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);

      // If we get a 400, it might be because the item is already in the desired state
      if (error.response && error.response.status === 400) {
        console.log(
          "Item may already be in desired state:",
          error.response.data
        );

        // Force refresh favorites to ensure UI is in sync with server
        try {
          const response = await axios.get(
            `http://localhost:8080/preferences/${studentId}/favorites`
          );

          if (response.data.success) {
            const stallIds = new Set();

            if (Array.isArray(response.data.data)) {
              response.data.data.forEach((fav) => {
                if (fav && fav.stallId) {
                  const id = fav.stallId._id
                    ? fav.stallId._id.toString()
                    : fav.stallId.toString();
                  stallIds.add(id);
                }
              });
            }

            setFavoriteStalls(stallIds);
          }
        } catch (refreshError) {
          console.error("Error refreshing favorites:", refreshError);
        }
      }
    }
  };

  // Add time slots helper
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  // Listen for menu updates from stalls
  useEffect(() => {
    // Listen for real-time menu updates from stalls
    socket.on("menuUpdated", (data) => {
      console.log("Received menu update:", data);

      // Update the stalls state if we have the updated stall in our list
      if (data && data.stallID && data.menu) {
        setStalls((prevStalls) =>
          prevStalls.map((stall) =>
            stall._id === data.stallID ? { ...stall, menu: data.menu } : stall
          )
        );

        // Also update filtered stalls to ensure UI reflects changes
        setFilteredStalls((prevStalls) =>
          prevStalls.map((stall) =>
            stall._id === data.stallID ? { ...stall, menu: data.menu } : stall
          )
        );

        // Update selected stall menu if the current stall is being viewed
        if (stall === data.stallID) {
          setSelectedStallMenu(data.menu);
        }
      }
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("menuUpdated");
    };
  }, [stall]); // Depend on stall to ensure we capture the current stall ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                QuickBites
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                Discover delicious meals from your favorite campus food stalls
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            <input
              type="text"
              placeholder="Search your favorite food stalls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg"
            />
          </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaSort className="text-blue-500 dark:text-blue-400 text-xl" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 dark:bg-gray-700 dark:text-white cursor-pointer transition-all duration-300 text-lg appearance-none bg-no-repeat bg-right pr-10"
                  style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')" }}
            >
              <option value="name">Sort by Name</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="favorites">Sort by Favorites</option>
            </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Stalls Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStalls.map((stall) => (
            <div
              key={stall._id}
                className="group bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src={cafe}
                  alt={stall.name}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                  </div>
                <button
                  onClick={(e) => toggleFavorite(stall._id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:scale-110"
                >
                  {favoriteStalls.has(stall._id.toString()) ? (
                      <FaHeart className="w-4 h-4 text-red-500 animate-pulse" />
                  ) : (
                      <FaRegHeart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5 shadow-lg">
                    <FaClock className="w-3 h-3 text-blue-500" />
                    <span>9:00 AM - 9:00 PM</span>
                </div>
              </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {stall.name}
                  </h2>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 shadow-sm">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      {stall.rating || "4.5"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openMenuModal(stall)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm group"
                >
                    <span>View Menu</span>
                  <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
            <div className="flex">
              {/* Left Side - Menu Items */}
              <div className="w-2/3 p-8">
                {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stallName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select your items and preferred pickup time
              </p>
            </div>

            {/* Menu Items */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Menu Items
              </h3>
              {selectedStallMenu.map((menuItem) => (
                <div
                  key={menuItem._id}
                  onClick={() => toggleItemSelection(menuItem)}
                  className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md ${
                    selectedItems.includes(menuItem)
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 shadow-md transform -translate-y-0.5"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {menuItem.name}
                        </h3>
                        {menuItem.isVegetarian && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Veg
                          </span>
                        )}
                      </div>
                      {menuItem.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                          {menuItem.description}
                        </p>
                      )}
                      {menuItem.nutritionInfo && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {menuItem.nutritionInfo.calories !== undefined &&
                            menuItem.nutritionInfo.calories !== null && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md">
                                <FaFire className="mr-1 text-amber-500" />
                                {menuItem.nutritionInfo.calories} cal
                              </span>
                            )}
                          {menuItem.nutritionInfo.protein !== undefined &&
                            menuItem.nutritionInfo.protein !== null && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md">
                                <FaWeightHanging className="mr-1 text-blue-500" />
                                {menuItem.nutritionInfo.protein}g protein
                              </span>
                            )}
                          {menuItem.nutritionInfo.carbs !== undefined &&
                            menuItem.nutritionInfo.carbs !== null && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
                                <span className="mr-1 w-3 h-3 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold">
                                  C
                                </span>
                                {menuItem.nutritionInfo.carbs}g carbs
                              </span>
                            )}
                          {menuItem.nutritionInfo.fat !== undefined &&
                            menuItem.nutritionInfo.fat !== null && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
                                <span className="mr-1 w-3 h-3 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                                  F
                                </span>
                                {menuItem.nutritionInfo.fat}g fat
                              </span>
                            )}
                          {menuItem.nutritionInfo.allergens && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md">
                              <FaExclamationTriangle className="mr-1 text-yellow-500" />
                              {menuItem.nutritionInfo.allergens}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{menuItem.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

                {/* Time Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaClock className="w-5 h-5 text-blue-500" />
                    Select Pickup Time
                  </h3>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
            </div>

              {/* Right Side - Order Summary */}
              <div className="w-1/3 bg-gray-50 dark:bg-gray-700 p-8 border-l border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  {selectedItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      <span className="text-gray-900 dark:text-white">₹{item.price}</span>
                      </div>
                    ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">
                        ₹{selectedItems.reduce((sum, item) => sum + item.price, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700 dark:text-gray-300">Tax (18%)</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{(selectedItems.reduce((sum, item) => sum + item.price, 0) * 0.18).toFixed(2)}
                    </span>
                </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{(
                        selectedItems.reduce((sum, item) => sum + item.price, 0) * 1.18
                      ).toFixed(2)}
                    </span>
              </div>
                </div>

            {/* Action Buttons */}
                <div className="mt-8 space-y-4">
              <button
                onClick={handlePlaceOrderStudent}
                disabled={selectedItems.length === 0 || !time}
                    className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors ${
                  selectedItems.length === 0 || !time
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Place Order
                  </button>
                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="w-full px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
              </button>
            </div>

                {/* Security Info */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Ordering</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Your order details are encrypted and secure. We never store your payment information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center transform transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your order has been confirmed. Please pick it up at {time}.
            </p>
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium
                hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add PaymentModal component */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
};

export default AllStalls;
