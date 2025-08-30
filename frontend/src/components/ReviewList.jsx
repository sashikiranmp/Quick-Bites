import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const ReviewList = ({ stallId, menuItemId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const url = menuItemId
          ? `http://localhost:8080/reviews/stall/${stallId}/menu-item/${menuItemId}`
          : `http://localhost:8080/reviews/stall/${stallId}`;

        const response = await axios.get(url);
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [stallId, menuItemId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Reviews
      </h3>
      {reviews.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {review.studentId.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`${
                      index < review.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {review.review}
            </p>
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
