import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const User = JSON.parse(localStorage.getItem("User"));
      const studentId = User?.student?._id;

      if (!studentId) {
        setError("Please log in to view your orders.");
        setOrders([]);
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/student/order/${studentId}`
      );

      // Check if response.data exists and has the expected structure
      if (response.data && response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setOrders([]);
        setError("No orders found.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        My Orders
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FaClock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            No orders yet
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Place an order to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order ID: {order._id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === "completed" ? (
                    <FaCheckCircle className="text-green-500 text-xl" />
                  ) : (
                    <FaTimesCircle className="text-red-500 text-xl" />
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaClock />
                  <span>Ordered on: {formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaClock />
                  <span>Pickup Time: {order.pickupTime}</span>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Items:
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-gray-700 dark:text-gray-300"
                    >
                      <span>{item.item}</span>
                      <span className="font-semibold">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="border-t dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-gray-900 dark:text-white">
                      <span>Total:</span>
                      <span>
                        ₹
                        {order.items.reduce((sum, item) => sum + item.price, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
