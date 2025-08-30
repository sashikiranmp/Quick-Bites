import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart, FaTrash, FaStar } from "react-icons/fa";
import cafe from "../../assets/cafe.png";

const Favorites = () => {
  const [favoriteStalls, setFavoriteStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedStallMenu, setSelectedStallMenu] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [time, setTime] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const User = JSON.parse(localStorage.getItem("User"));
  const studentId = User?.student?._id;

  useEffect(() => {
    const fetchFavoriteStalls = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:8080/preferences/${studentId}/favorites`
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          // Get unique stall IDs from favorites, filtering out any null or undefined values
          const stallIds = [
            ...new Set(
              response.data.data
                .filter((fav) => fav && fav.stallId && fav.stallId._id) // Ensure stallId exists and has _id
                .map((fav) => fav.stallId._id)
            ),
          ];

          if (stallIds.length === 0) {
            setFavoriteStalls([]);
            setLoading(false);
            return;
          }

          // Fetch stall details for each favorite stall
          const stallDetails = await Promise.all(
            stallIds.map(async (stallId) => {
              try {
                const stallResponse = await axios.get(
                  `http://localhost:8080/stall/${stallId}`
                );
                return stallResponse.data;
              } catch (err) {
                console.error(`Error fetching stall ${stallId}:`, err);
                return null; // Return null for failed requests
              }
            })
          );

          // Filter out any null values from the stallDetails array
          setFavoriteStalls(stallDetails.filter((stall) => stall !== null));
        } else {
          setFavoriteStalls([]);
        }
      } catch (error) {
        console.error("Error fetching favorite stalls:", error);
        setError("Failed to fetch favorites. Please try again later.");
        setFavoriteStalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteStalls();
  }, [studentId]);

  const handleStallClick = async (stall) => {
    setSelectedStall(stall);
    setSelectedStallMenu(stall.menu || []);
    setIsMenuModalOpen(true);
  };

  const toggleItemSelection = (menuItem) => {
    setSelectedItems((prev) =>
      prev.includes(menuItem)
        ? prev.filter((item) => item !== menuItem)
        : [...prev, menuItem]
    );
  };

  const handleOrder = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    if (!time) {
      alert("Please select a pickup time");
      return;
    }

    try {
      const orderItems = selectedItems.map((item) => ({
        item: item.name,
        price: item.price,
      }));

      // Place order for student
      await axios.post("http://localhost:8080/student/order", {
        studentID: studentId,
        name: selectedStall.name,
        items: orderItems,
        time: time,
      });

      // Place stall order
      await axios.post("http://localhost:8080/stall/order", {
        stallID: selectedStall._id,
        name: User.student.name,
        items: orderItems,
        studentID: studentId,
        time: time,
      });

      setIsMenuModalOpen(false);
      setIsOrderModalOpen(true);
      setSelectedItems([]);
      setTime("");
      setTimeout(() => setIsOrderModalOpen(false), 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const removeFromFavorites = async (stallId, event) => {
    event.stopPropagation(); // Prevent stall click when clicking favorite button
    if (!studentId) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/preferences/${studentId}/favorites`,
        { data: { stallId, menuItemId: "all" } }
      );

      if (response.data.success) {
        // Remove the stall from the favorites list
        setFavoriteStalls((prev) =>
          prev.filter((stall) => stall._id !== stallId)
        );
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      alert("Failed to remove from favorites. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please log in to view your favorites.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          My Favorite Stalls
        </h1>
        {favoriteStalls.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No favorites yet
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Add your favorite food stalls to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteStalls.map((stall) => (
              <div
                key={stall._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
              >
                <button
                  onClick={(e) => removeFromFavorites(stall._id, e)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-300 z-10"
                >
                  <FaHeart className="w-6 h-6 text-red-500" />
                </button>
                <div onClick={() => handleStallClick(stall)}>
                  <img
                    src={cafe}
                    alt={stall.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{stall.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {stall.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Modal */}
        {isMenuModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
              <h2 className="text-2xl font-bold mb-4 text-center">
                {selectedStall.name}
              </h2>
              <div className="space-y-4">
                {selectedStallMenu.map((menuItem) => (
                  <div
                    key={menuItem._id}
                    className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                      selectedItems.includes(menuItem)
                        ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                        : "bg-white dark:bg-gray-700"
                    }`}
                    onClick={() => toggleItemSelection(menuItem)}
                  >
                    <span className="text-lg font-medium">{menuItem.name}</span>
                    <span className="text-green-600 font-semibold">
                      ₹{menuItem.price}
                    </span>
                    <span className="text-slate-600 font-semibold">
                      {menuItem.info}
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Input */}
              <div className="mt-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Select Pickup Time:
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrder}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Confirmation Modal */}
        {isOrderModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3 text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Your order has been placed!
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Thank you for your order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
