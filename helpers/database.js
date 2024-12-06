const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose')
const uri = "mongodb+srv://nodejsmax:cr7eselmejorjugador@cluster0.njj8za8.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0";

let db;

async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    if(!db) {
      db = await mongoose.connect(uri, {serverApi: {version: '1', strict: true, deprecationErrors: true}, dbName: 'shop', minPoolSize: 1, maxPoolSize: 10});
    }
    return db;
  } catch(error) {
    console.log(error);
    
  }
}


module.exports = connectDB;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
//   minPoolSize: 1,
//   maxPoolSize: 10,
//   maxConnecting: 10,
//   maxIdleTimeMS: 30000
// });

// let db;

// const connectDB = async () => {
//   if (!db) {
//     try {
//       await client.connect();
//       db = client.db('shop');
//       console.log('Connected to MongoDB');
//     } catch (error) {
//       console.error('Failed to connect to MongoDB', error);
//       throw error;
//     }
//   }
//   return db;
// };


// module.exports = connectDB;

