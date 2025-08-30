import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaUtensils,
  FaUserClock,
  FaUser,
  FaClipboardList,
  FaBell,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";
import StallHeader from "../../components/StallHeader";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const CheckOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [newOrderData, setNewOrderData] = useState(null);

  const stall = JSON.parse(localStorage.getItem("User"));
  const stallID = stall?.stall?._id;
  const stallName = stall?.stall?.name;

  const fetchOrders = async () => {
    if (!stallID) {
      console.error("Stall ID not found in user data:", stall);
      setError("Stall information not found. Please log in again.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders for stall:", stallID);
      const response = await axios.get(
        `http://localhost:8080/stall/${stallID}/orders`
      );
      console.log("Orders response:", response.data);
      if (response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch orders. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [stallID]);

  // Socket.IO setup for real-time order updates
  useEffect(() => {
    // Listen for new orders
    socket.on("newOrder", (data) => {
      console.log("Socket event received in CheckOrders:", data);
      console.log("Current stall name:", stallName);
      console.log("Event stall name:", data.stallName);
      console.log("Stall ID comparison:", data.stallID, stallID);

      // Check if the order is for this stall - use stallID for more reliable matching
      if (data.stallID === stallID || data.stallName === stallName) {
        console.log("New order received for this stall:", data);

        // Store the new order data for displaying in notification
        setNewOrderData(data.order);

        // Show notification
        setNewOrderNotification(true);

        // Add the new order to our local state immediately
        // This ensures it appears in the list even without calling fetchOrders
        setOrders((prevOrders) => {
          // Check if the order already exists in our array to prevent duplicates
          if (
            data.order &&
            !prevOrders.some((order) => order._id === data.order._id)
          ) {
            // Add the new order at the beginning of the array to show it first
            return [
              {
                ...data.order,
                status: data.order.status || "pending", // Ensure every order has a status
              },
              ...prevOrders,
            ];
          }
          return prevOrders;
        });

        // Automatically clear notification after 10 seconds
        // But the order remains in the orders list
        setTimeout(() => {
          setNewOrderNotification(false);
        }, 10000);
      } else {
        console.log("Order not for this stall. Ignoring.");
      }
    });

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off("newOrder");
    };
  }, [stallName, stallID]);

  const handleOrderCompletion = async (orderId) => {
    try {
      // Updated the endpoint from /removeOrder to /deleteOrder to match the backend route
      const response = await axios.post(
        `http://localhost:8080/stall/deleteOrder`,
        { stallId: stallID, orderId: orderId }
      );

      if (response.status === 200) {
        // Remove the order from local state to instantly reflect the change
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
        console.log("Order successfully removed");
      } else {
        setError("Failed to remove order. Please try again.");
      }
    } catch (error) {
      console.error("Error removing order:", error);
      setError("Failed to remove order. Please try again.");
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/stall/${stallID}/orders/${orderId}`,
        { status: newStatus }
      );

      // Update the local state immediately to reflect the status change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Only remove completed or cancelled orders if needed
      // For now, we'll keep all orders visible with their updated status
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    }
  };

  const handleSendStatus = () => {
    if (!status) {
      alert("Please select a status before sending.");
      return;
    }

    // Prepare data to send
    const orderDetails = {
      stallName: stall?.stall?.name, // Stall name
      items: selectedOrder.items.map((item) => ({
        name: item.item,
        price: item.price,
      })), // Items in the order
      status, // Selected status
    };

    // Emit order status update
    socket.emit("updateStatus", {
      orderId: selectedOrder._id,
      studentID: selectedOrder.studentID, // Ensure studentID exists in order data
      details: orderDetails, // Include stall name, items, and status
    });

    handleCloseModal();
    alert(`Status "${status}" sent with order details.`);
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setStatus("");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheck className="w-4 h-4" />;
      case "pending":
        return <FaHourglassHalf className="w-4 h-4" />;
      case "cancelled":
        return <FaTimesCircle className="w-4 h-4" />;
      default:
        return <FaHourglassHalf className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "from-green-500 to-emerald-600";
      case "pending":
        return "from-amber-500 to-orange-600";
      case "cancelled":
        return "from-red-500 to-rose-600";
      default:
        return "from-amber-500 to-orange-600";
    }
  };

  if (loading) {
    return (
      <>
        <StallHeader />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </>
    );
  }

  // Sort orders to show pending orders first, then completed, then cancelled
  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, cancelled: 2 };
    const statusA = a.status || "pending";
    const statusB = b.status || "pending";

    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <>
      <StallHeader />
      <div className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero section */}
          <div className="mb-12 bg-gradient-to-r from-amber-100 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-lg border border-amber-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-xl"></div>
            <div className="absolute right-20 top-8 w-24 h-24 bg-orange-200/30 dark:bg-orange-700/10 rounded-full blur-xl"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-3">
                  Current Orders
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-5 max-w-xl">
                  Manage all incoming orders, update status, and process
                  customer requests in real-time.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    {
                      orders.filter(
                        (order) => order.status === "pending" || !order.status
                      ).length
                    }{" "}
                    Pending
                  </span>
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }{" "}
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-xl mb-8 shadow-md border border-red-200 dark:border-red-800/40 flex items-center gap-3">
              <FaTimesCircle className="w-6 h-6 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* New Order Notification - Only shows temporarily */}
          {newOrderNotification && newOrderData && (
            <div className="fixed top-24 right-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl z-50 max-w-md w-full border-l-4 border-green-500 animate-slideIn">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full shadow-lg shadow-green-500/20">
                  <FaBell className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
                      New Order Received!
                    </h3>
                    <button
                      onClick={() => setNewOrderNotification(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 p-4 rounded-xl mb-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p className="flex items-center gap-2">
                        <FaUser className="text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Customer:</span>{" "}
                        {newOrderData.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaUserClock className="text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Pickup Time:</span>{" "}
                        {newOrderData.time || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2 mb-3">
                      <FaClipboardList className="text-green-600 dark:text-green-400" />
                      <span>Order Items:</span>
                    </h4>
                    <ul className="space-y-2">
                      {newOrderData.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between text-sm p-2 border-b border-green-100 dark:border-green-900/20 last:border-0"
                        >
                          <span className="text-gray-800 dark:text-gray-300">
                            {item.item}
                          </span>
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            ₹{item.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800/40">
                      <div className="flex justify-between font-bold text-green-800 dark:text-green-400">
                        <span>Total:</span>
                        <span>
                          ₹
                          {newOrderData.items.reduce(
                            (sum, item) => sum + item.price,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setNewOrderNotification(false)}
                    className="w-full mt-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                  >
                    Acknowledge Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Management Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-md border border-amber-200 dark:border-gray-700">
                <div className="mb-6 bg-amber-100 dark:bg-amber-900/20 p-5 rounded-full">
                  <FaUtensils className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  Orders will appear here when customers place them. Check back
                  soon or refresh the page.
                </p>
              </div>
            ) : (
              sortedOrders.map((order) => (
                <div
                  key={order._id || `temp-${Date.now()}-${Math.random()}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 overflow-hidden group hover:-translate-y-1"
                >
                  <div className="border-b border-amber-50 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-gray-700 dark:to-gray-800 py-3 px-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400">
                      Order #
                      {order._id ? order._id.toString().slice(-6) : "New"}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 bg-gradient-to-r ${getStatusColor(
                        order.status || "pending"
                      )}`}
                    >
                      {getStatusIcon(order.status || "pending")}
                      <span className="capitalize">
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaUser className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>
                          Customer:{" "}
                          <span className="font-medium">{order.name}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>
                          Pickup Time:{" "}
                          <span className="font-medium">
                            {order.time || "Not specified"}
                          </span>
                        </span>
                      </div>
                      {order.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FaClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>
                            Ordered at:{" "}
                            <span className="font-medium">
                              {formatDate(order.createdAt)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl mb-5">
                      <div className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3 font-semibold flex items-center gap-2">
                        <FaUtensils className="w-3 h-3" />
                        <span>Order Items</span>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-gray-700 dark:text-gray-300 pb-2 border-b border-amber-100/50 dark:border-gray-700/50 last:border-b-0 last:pb-0"
                          >
                            <span className="font-medium">{item.item}</span>
                            <span className="font-semibold text-amber-700 dark:text-amber-400">
                              ₹{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 p-4 rounded-xl flex justify-between items-center">
                      <span className="font-semibold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                        <FaMoneyBillWave className="w-4 h-4" />
                        <span>Total Amount</span>
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        ₹
                        {order.items.reduce(
                          (sum, item) => sum + (item.price || 0),
                          0
                        )}
                      </span>
                    </div>

                    {/* Show action buttons only for pending orders */}
                    {(!order.status || order.status === "pending") && (
                      <div className="mt-6 flex items-center justify-center">
                        <button
                          onClick={() => handleOrderCompletion(order._id)}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                        >
                          <FaCheck className="w-4 h-4" />
                          <span>Mark as Completed</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-amber-200 dark:border-gray-700 animate-scaleIn">
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  Update Order Status
                </h2>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Select Status to Send to Customer
                  </label>
                  <select
                    className="w-full p-3 border border-amber-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 bg-amber-50 dark:bg-gray-700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Your order has been Accepted">
                      Your order has been Accepted
                    </option>
                    <option value="Your order is being prepared">
                      Your order is being prepared
                    </option>
                    <option value="Your order is ready for pickup">
                      Your order is ready for pickup
                    </option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                    onClick={handleSendStatus}
                  >
                    Send Status to Customer
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

export default CheckOrders;
