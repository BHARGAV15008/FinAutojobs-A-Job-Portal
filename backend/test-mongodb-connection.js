import { MongoClient, ServerApiVersion } from 'mongodb';

// Test with the new cluster URL
const uri = "mongodb+srv://technogenius1500_db_user:HwBcqqPwt31XTH1g@cluster0.ydn6sam.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('📍 Cluster: cluster0.ydn6sam.mongodb.net');
    
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    console.log("✅ Connection test passed!");
    
    // Test database access
    const db = client.db("finautojobs");
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in finautojobs database`);
    
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    throw error;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("🔌 Connection closed");
  }
}

run().catch(console.dir);
