/**
 * Simple script to delete a stall by ID using a local MongoDB instance
 * 
 * Usage:
 * 1. Make sure MongoDB is installed and running locally
 * 2. Run: node deleteStallLocal.js <stallId>
 */

const mongoose = require('mongoose');
const Stall = require('../models/Stall');
const SimpleStall = require('../models/SimpleStall');
const Student = require('../models/StudentModel');

// Get stall ID from command line argument
const stallId = process.argv[2];

if (!stallId) {
  console.error('Please provide a stall ID as an argument');
  console.error('Usage: node deleteStallLocal.js <stallId>');
  process.exit(1);
}

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/food_ordering', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to local MongoDB');
    
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
    console.error('Make sure MongoDB is installed and running locally');
    process.exit(1);
  }); 