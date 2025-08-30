import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUtensils,
  FaChartBar,
  FaHistory,
  FaRupeeSign,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteStall: { name: "No orders yet", count: 0 },
    favoriteItems: [],
    averageRating: 0,
    monthlySpending: {},
    orderFrequency: { weekday: {}, time: {} },
    averageOrderValue: 0,
    recentTrends: {
      spending: 0,
      frequency: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const User = JSON.parse(localStorage.getItem("User"));
      const studentId = User?.student?._id;

      if (!studentId) {
        setError("Please log in to view your analytics.");
        setOrders([]);
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/student/order/${studentId}`
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data || [];
        setOrders(orderData);
        const analyticsData = calculateAnalytics(orderData);
        setAnalytics(analyticsData);
      } else {
        setOrders([]);
        setError("No order data found.");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError("Failed to fetch order data. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (orderData) => {
    if (!orderData || orderData.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        favoriteStall: { name: "No orders yet", count: 0 },
        favoriteItems: [],
        averageRating: 0,
        monthlySpending: {},
        orderFrequency: { weekday: {}, time: {} },
        averageOrderValue: 0,
        recentTrends: { spending: 0, frequency: 0 },
      };
    }

    // Basic calculations
    const totalOrders = orderData.length;
    const totalSpent = orderData.reduce(
      (sum, order) =>
        sum + order.items.reduce((orderSum, item) => orderSum + item.price, 0),
      0
    );

    // Stall analysis
    const stallCount = {};
    orderData.forEach((order) => {
      stallCount[order.name] = (stallCount[order.name] || 0) + 1;
    });
    const favoriteStall = Object.entries(stallCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))[0];

    // Item analysis
    const itemCount = {};
    orderData.forEach((order) => {
      order.items.forEach((item) => {
        itemCount[item.item] = (itemCount[item.item] || 0) + 1;
      });
    });
    const favoriteItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Monthly spending analysis
    const monthlySpending = {};
    orderData.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      const amount = order.items.reduce((sum, item) => sum + item.price, 0);
      monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + amount;
    });

    // Order frequency analysis
    const orderFrequency = {
      weekday: {},
      time: {},
    };
    orderData.forEach((order) => {
      const date = new Date(order.createdAt);
      const weekday = date.toLocaleString("default", { weekday: "long" });
      const hour = date.getHours();
      const timeSlot =
        hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

      orderFrequency.weekday[weekday] =
        (orderFrequency.weekday[weekday] || 0) + 1;
      orderFrequency.time[timeSlot] = (orderFrequency.time[timeSlot] || 0) + 1;
    });

    // Calculate average order value
    const averageOrderValue = totalSpent / totalOrders;

    // Calculate recent trends (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentOrders = orderData.filter(
      (order) => new Date(order.createdAt) >= thirtyDaysAgo
    );
    const previousOrders = orderData.filter(
      (order) =>
        new Date(order.createdAt) >= sixtyDaysAgo &&
        new Date(order.createdAt) < thirtyDaysAgo
    );

    const recentTrends = {
      spending: recentOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((orderSum, item) => orderSum + item.price, 0),
        0
      ),
      frequency: recentOrders.length,
    };

    return {
      totalOrders,
      totalSpent,
      favoriteStall,
      favoriteItems,
      averageRating: calculateAverageRating(orderData),
      monthlySpending,
      orderFrequency,
      averageOrderValue,
      recentTrends,
    };
  };

  const calculateAverageRating = (orderData) => {
    const ratedOrders = orderData.filter((order) => order.rating);
    return ratedOrders.length > 0
      ? (
          ratedOrders.reduce((sum, order) => sum + order.rating, 0) /
          ratedOrders.length
        ).toFixed(1)
      : 0;
  };

  const prepareChartData = (orderData) => {
    // Prepare data for Time of Day distribution
    const timeData = Object.entries(analytics.orderFrequency.time).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // Prepare data for Weekly distribution
    const weeklyData = Object.entries(analytics.orderFrequency.weekday)
      .map(([day, count]) => ({
        day,
        orders: count,
      }))
      .sort((a, b) => b.orders - a.orders);

    // Prepare monthly spending data
    const monthlyData = Object.entries(analytics.monthlySpending)
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6); // Show last 6 months

    return {
      timeData,
      weeklyData,
      monthlyData,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Order Analytics
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalOrders}
              </p>
            </div>
            <FaHistory className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{analytics.totalSpent}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg. ₹{analytics.averageOrderValue.toFixed(0)} per order
              </p>
            </div>
            <FaRupeeSign className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Top Stall
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.favoriteStall.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {analytics.favoriteStall.count} orders
              </p>
            </div>
            <FaUtensils className="text-yellow-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Last 30 Days
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{analytics.recentTrends.spending}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {analytics.recentTrends.frequency} orders
              </p>
            </div>
            <FaCalendarAlt className="text-purple-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Order Time Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareChartData(orders).timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareChartData(orders).timeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Orders by Day of Week
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData(orders).weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Spending Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Monthly Spending Trends
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData(orders).monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Top Ordered Items
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.favoriteItems}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
