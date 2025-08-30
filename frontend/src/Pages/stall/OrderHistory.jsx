import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClock,
  FaHistory,
  FaCalendarAlt,
  FaUser,
  FaUtensils,
  FaMoneyBillWave,
  FaCheck,
  FaHourglassHalf,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import StallHeader from "../../components/StallHeader";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stall = JSON.parse(localStorage.getItem("User"));
  const stallID = stall?.stall?._id;

  const fetchOrderHistory = async () => {
    if (!stallID) {
      console.error("Stall ID not found in user data:", stall);
      setError("Stall information not found. Please log in again.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching order history for stall:", stallID);
      const response = await axios.get(
        `http://localhost:8080/stall/orders/history/${stallID}`
      );
      console.log("Order history response:", response.data);
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch order history");
      }
    } catch (error) {
      console.error(
        "Error fetching order history:",
        error.response?.data || error
      );
      setError(
        error.response?.data?.message ||
          "Failed to fetch order history. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [stallID]);

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
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderIdMatch = order._id.toLowerCase().includes(query);
      const itemMatch = order.items.some((item) =>
        item.item.toLowerCase().includes(query)
      );

      return orderIdMatch || itemMatch;
    }

    return true;
  });

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
                  Order History
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-5 max-w-xl">
                  View all past orders, track performance, and analyze your
                  sales history.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }{" "}
                    Completed
                  </span>
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    {
                      orders.filter((order) => order.status === "pending")
                        .length
                    }{" "}
                    Pending
                  </span>
                  <span className="inline-flex items-center bg-amber-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {
                      orders.filter((order) => order.status === "cancelled")
                        .length
                    }{" "}
                    Cancelled
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-amber-100 dark:border-gray-700 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:outline-none w-full"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 dark:text-amber-400" />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-4 pr-10 py-2 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:outline-none appearance-none text-gray-700 dark:text-gray-300"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="all">All Orders</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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

          {!loading && filteredOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-md border border-amber-200 dark:border-gray-700">
              <div className="mb-6 bg-amber-100 dark:bg-amber-900/20 p-5 rounded-full">
                <FaHistory className="w-16 h-16 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4">
                No Orders Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                {searchQuery || filterStatus !== "all"
                  ? "No orders match your current search or filter criteria. Try adjusting your filters."
                  : "You don't have any past orders yet. Orders will appear here once customers start placing them."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 overflow-hidden group hover:-translate-y-1"
                >
                  <div className="border-b border-amber-50 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-gray-700 dark:to-gray-800 py-3 px-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400">
                      Order #{order._id.slice(-6)}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 bg-gradient-to-r ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaCalendarAlt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>
                          Pickup Time: {order.pickupTime || "Not specified"}
                        </span>
                      </div>
                      {order.studentId && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FaUser className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Student ID: {order.studentId}</span>
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
                        {order.items.reduce((sum, item) => sum + item.price, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
