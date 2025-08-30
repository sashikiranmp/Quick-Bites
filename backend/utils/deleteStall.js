/**
 * Simple script to delete a stall by ID
 * 
 * Usage:
 * 1. Run: node deleteStall.js <stallId>
 */

const mongoose = require('mongoose');
const Stall = require('../models/Stall');
const SimpleStall = require('../models/SimpleStall');
const Student = require('../models/StudentModel');

// Get stall ID from command line argument
const stallId = process.argv[2];

if (!stallId) {
  console.error('Please provide a stall ID as an argument');
  console.error('Usage: node deleteStall.js <stallId>');
  process.exit(1);
}

// MongoDB Atlas connection string
const mongoURI = "mongodb+srv://someshrocks144:somesh2004@cluster0.eyf2h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    try {
      // Try to find and delete from SimpleStall model first
      let deletedStall = await SimpleStall.findByIdAndDelete(stallId);
      let modelType = 'SimpleStall';
      
      // If not found in SimpleStall, try Stall model
      if (!deletedStall) {
        deletedStall = await Stall.findByIdAndDelete(stallId);
        modelType = 'Stall';
      }
      
      if (deletedStall) {
        console.log(`✅ Successfully deleted stall with ID: ${stallId} (${modelType})`);
        
        // Remove this stall from all students' favorites
        const result = await Student.updateMany(
          { 'favorites.stallId': stallId },
          { $pull: { favorites: { stallId: stallId } } }
        );
        
        console.log(`✅ Removed from ${result.modifiedCount} students' favorites`);
      } else {
        console.log(`❌ Stall with ID: ${stallId} not found in either model`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 