/**
 * Utility script to delete stalls from the database
 * 
 * Usage:
 * 1. Make sure your MongoDB server is running
 * 2. Run this script with Node.js: node deleteStalls.js
 * 3. Enter the stall IDs when prompted
 */

const mongoose = require('mongoose');
const Stall = require('../models/Stall');
const SimpleStall = require('../models/SimpleStall');
const Student = require('../models/StudentModel');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/food_ordering', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to delete a stall by ID
async function deleteStall(stallId) {
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
      return true;
    } else {
      console.log(`❌ Stall with ID: ${stallId} not found in either model`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting stall with ID: ${stallId}:`, error.message);
    return false;
  }
}

// Function to list all stalls
async function listAllStalls() {
  try {
    const simpleStalls = await SimpleStall.find().select('_id name email');
    const stalls = await Stall.find().select('_id name email');
    
    console.log('\n=== ALL STALLS ===');
    console.log('\nSimpleStalls:');
    simpleStalls.forEach(stall => {
      console.log(`ID: ${stall._id}, Name: ${stall.name}, Email: ${stall.email}`);
    });
    
    console.log('\nStalls:');
    stalls.forEach(stall => {
      console.log(`ID: ${stall._id}, Name: ${stall.name}, Email: ${stall.email}`);
    });
    
    console.log('\nTotal stalls:', simpleStalls.length + stalls.length);
    return true;
  } catch (error) {
    console.error('Error listing stalls:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== STALL DELETION UTILITY ===');
  
  // List all stalls first
  await listAllStalls();
  
  // Ask if user wants to delete stalls
  rl.question('\nDo you want to delete stalls? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      rl.close();
      mongoose.connection.close();
      return;
    }
    
    // Ask for stall IDs
    rl.question('Enter stall IDs to delete (comma-separated): ', async (input) => {
      const stallIds = input.split(',').map(id => id.trim());
      
      if (stallIds.length === 0 || (stallIds.length === 1 && stallIds[0] === '')) {
        console.log('No stall IDs provided');
        rl.close();
        mongoose.connection.close();
        return;
      }
      
      console.log(`\nAttempting to delete ${stallIds.length} stalls...`);
      
      let successCount = 0;
      for (const stallId of stallIds) {
        const success = await deleteStall(stallId);
        if (success) successCount++;
      }
      
      console.log(`\nDeletion complete. Successfully deleted ${successCount} out of ${stallIds.length} stalls.`);
      
      // List remaining stalls
      await listAllStalls();
      
      rl.close();
      mongoose.connection.close();
    });
  });
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  rl.close();
  mongoose.connection.close();
}); 