import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const Favorites = ({
  studentId,
  stallId,
  menuItemId,
  isFavorite: initialIsFavorite,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        // Use the correct syntax for DELETE requests with a body
        const response = await axios.delete(
          `http://localhost:8080/preferences/${studentId}/favorites`,
          { data: { stallId, menuItemId } }
        );

        if (response.data.success) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites using POST
        const response = await axios.post(
          `http://localhost:8080/preferences/${studentId}/favorites`,
          { stallId, menuItemId }
        );

        if (response.data.success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-colors duration-300 ${
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-500"
      }`}
    >
      {isFavorite ? (
        <FaHeart className="w-6 h-6" />
      ) : (
        <FaRegHeart className="w-6 h-6" />
      )}
    </button>
  );
};

const FavoritesList = ({ studentId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/preferences/${studentId}/favorites`
        );
        if (response.data.success) {
          setFavorites(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Your Favorites
      </h3>
      {favorites.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={`${favorite.stallId._id}-${favorite.menuItemId}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {favorite.stallId.name}
                </h4>
                <Favorites
                  studentId={studentId}
                  stallId={favorite.stallId._id}
                  menuItemId={favorite.menuItemId}
                  isFavorite={true}
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {favorite.menuItemId === "all"
                  ? "Entire Stall"
                  : `Menu Item: ${favorite.menuItemId}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { Favorites, FavoritesList };
