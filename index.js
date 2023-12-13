const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const resDB = "Restaurent";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhtgohj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    // Define your collections
    const userCollection = client.db(resDB).collection("user");
    const menuCollection = client.db(resDB).collection("menu");
    const reviewsCollection = client.db(resDB).collection("reviews");
    const cartCollection = client.db(resDB).collection("cart");

// user releted
    app.get('/user', async (req, res)=>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.post('/user', async (req, res)=>{
      const user = req.body;
      const query = { email: user.email}
      const exitUser = await userCollection.findOne(query);
      if(exitUser){
        return res.send({message: 'user already exits', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.patch('/user/admin/:id', async (req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    app.delete('/user/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })
// cart releted
    app.get('/cart', async (req, res)=>{
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);

    })
    app.post('/cart', async (req, res)=>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })
    app.delete('/cart/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Start the server
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });

    // Define your routes or other logic using the collections
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    // ... add more routes or logic as needed

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Connect to MongoDB when the server starts
connectMongoDB();
