// // DISABLED: This component has been commented out to prevent conflicts with the new chatbot
// /*
// import React from "react";
// import {
//   FaRobot,
//   FaUser,
//   FaPaperPlane,
//   FaInfoCircle,
//   FaTimes,
// } from "react-icons/fa";

// const ChatInterface = ({
//   messages = [],
//   input = "",
//   setInput,
//   handleSend,
//   loading = false,
//   handleOptionClick,
//   error = null,
// }) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
//           {/* Chat Header */}
//           <div className="bg-blue-500 dark:bg-blue-600 p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <FaRobot className="text-2xl text-white" />
//               <h1 className="text-xl font-bold text-white">
//                 Food Ordering Assistant
//               </h1>
//             </div>
//           </div>

//           {/* Chat Window */}
//           <div className="h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700">
//             {messages.map((msg, index) => {
//               // Provide default sender if missing
//               const sender = msg?.sender || "bot";
//               return (
//                 <div
//                   key={index}
//                   className={`mb-4 ${
//                     sender === "bot" ? "text-left" : "text-right"
//                   }`}
//                 >
//                   <div
//                     className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${
//                       sender === "bot"
//                         ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-md"
//                         : "bg-blue-500 text-white shadow-md"
//                     }`}
//                   >
//                     <div className="flex items-start gap-2">
//                       {sender === "bot" ? (
//                         <FaRobot className="text-blue-500 dark:text-blue-400 mt-1" />
//                       ) : (
//                         <FaUser className="text-white mt-1" />
//                       )}
//                       <div className="flex-1">
//                         <p className="whitespace-pre-line">{msg?.text || ""}</p>
//                         {/* Options */}
//                         {msg?.options && (
//                           <div className="mt-3 flex flex-wrap gap-2">
//                             {msg.options.map((option, optIndex) => (
//                               <button
//                                 key={optIndex}
//                                 onClick={() => handleOptionClick(option)}
//                                 className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors shadow-sm"
//                               >
//                                 {option}
//                               </button>
//                             ))}
//                           </div>
//                         )}
//                         {/* Menu Items */}
//                         {msg?.menu && (
//                           <div className="mt-3 space-y-2">
//                             {msg.menu.map((item, itemIndex) => (
//                               <div
//                                 key={itemIndex}
//                                 className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
//                               >
//                                 <h4 className="font-semibold text-gray-800 dark:text-gray-100">
//                                   {item?.name || ""}
//                                 </h4>
//                                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                                   ₹{item?.price || 0}
//                                 </p>
//                                 {item?.description && (
//                                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                                     {item.description}
//                                   </p>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                         {/* Stalls */}
//                         {msg?.stalls && (
//                           <div className="mt-3 space-y-2">
//                             {msg.stalls.map((stall, stallIndex) => (
//                               <div
//                                 key={stallIndex}
//                                 className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
//                               >
//                                 <h4 className="font-semibold text-gray-800 dark:text-gray-100">
//                                   {stall?.name || ""}
//                                 </h4>
//                                 {stall?.cuisine && (
//                                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                                     {stall.cuisine}
//                                   </p>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {/* Loading indicator */}
//             {loading && (
//               <div className="flex justify-center items-center py-4">
//                 <div className="animate-pulse flex space-x-2">
//                   <div className="rounded-full bg-blue-400 h-2 w-2"></div>
//                   <div className="rounded-full bg-blue-400 h-2 w-2"></div>
//                   <div className="rounded-full bg-blue-400 h-2 w-2"></div>
//                 </div>
//               </div>
//             )}

//             {/* Error message */}
//             {error && (
//               <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
//                 <div className="flex items-start">
//                   <FaInfoCircle className="text-red-500 mr-2 mt-0.5" />
//                   <div>
//                     <p className="text-red-800 dark:text-red-200 font-medium">
//                       Error connecting to assistant
//                     </p>
//                     <p className="text-red-700 dark:text-red-300 text-sm">
//                       {error}
//                     </p>
//                   </div>
//                   <button
//                     className="ml-auto text-red-700 dark:text-red-300"
//                     onClick={() => setError(null)}
//                   >
//                     <FaTimes />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Chat Input */}
//           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex items-center">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter") handleSend();
//                 }}
//                 placeholder="Type your message here..."
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg dark:bg-gray-700 dark:text-white outline-none"
//               />
//               <button
//                 onClick={handleSend}
//                 disabled={loading}
//                 className={`bg-blue-500 text-white p-3 rounded-r-lg ${
//                   loading
//                     ? "opacity-50 cursor-not-allowed"
//                     : "hover:bg-blue-600"
//                 }`}
//               >
//                 <FaPaperPlane />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;
// */

// // Export a dummy component to avoid breaking imports
// const ChatInterface = () => null;
// export default ChatInterface;
