import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaShoppingCart, FaBars } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const User = JSON.parse(localStorage.getItem("User"));

  const handleLogout = () => {
    localStorage.removeItem("User");
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg h-[80px]">
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo */}
        <div className="text-white text-4xl font-bold">QuickBites</div>

        {/* Navigation Links */}
        <nav className="flex space-x-8 text-xl">
          {User?.stall ? (
            // Stall Owner Navigation
            <>
              <Link
                to="/createMenu"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Create Menu
              </Link>
              <Link
                to="/checkOrders"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Check Orders
              </Link>
              <Link
                to="/stall/orderHistory"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Order History
              </Link>
            </>
          ) : (
            // Student Navigation
            <>
              <Link
                to="/allStall"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                All Stalls
              </Link>
              <Link
                to="/orderStatus"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Order Status
              </Link>
              <Link
                to="/favorites"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Favorites
              </Link>
              <Link
                to="/orderHistory"
                className="text-white hover:text-yellow-300 transition-colors duration-300"
              >
                Order Analytics
              </Link>
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {User ? (
            <>
              <Link
                to="/student/cart"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FaShoppingCart className="text-xl" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaUser className="text-xl" />
                  <span className="hidden md:inline">
                    {User.student?.name || User.stall?.name}
                  </span>
                  <FaBars className="md:hidden" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/student/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/student/allstalls"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              All Stalls
            </Link>
            <Link
              to="/student/favorites"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Favorites
            </Link>
            <Link
              to="/student/order"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              to="/student/orderhistory"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              History
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
