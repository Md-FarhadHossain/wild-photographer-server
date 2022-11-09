const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("colors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.1ivadd4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
    const authHeaders = req.headers.authorization
    if(!authHeaders) {
        res.status(401).send({message: 'Unauthorized access'});
    }
    const token = authHeaders.split(' ')[1]
    console.log(token)
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            res.status(401).send({message: 'Unauthorized access'});
        }
        req.decoded = decoded
        next()
    })
}

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("database connected");
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
};
dbConnect();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const servicesCollection = client.db("servicesDB").collection("servicesList");
const reviewsColleciton = client.db("servicesDB").collection("reviewList");

app.post("/add-review", async (req, res) => {
  try {
    const review = req.body;
    console.log(review);
    const result = await reviewsColleciton.insertOne(review);
    res.send(result);
    console.log(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});
app.get("/add-review",verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded
    if(decoded.email !== req.query.email){
        res.status(401).send({message: 'Unauthorized access'});
    }

    let query = {};
    if (req.query.email) {
      query = { email: req.query.email };
    }
    if (req.query.serviceId) {
      query = { serviceId: req.query.serviceId };
    }
    const cursor = reviewsColleciton.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});

// app.get('/add-review/:id', async(req, res) => {
//     try {
//         let query = {}

//         if(req.query.email){
//             query = { email: req.query.email}
//         }
//         const cursor = reviewsColleciton.find(query)
//         const result = await cursor.toArray()
//         res.send(result)
//     }
//     catch(error){
//         console.log(error.name.bgRed, error.message.bold)
//     }
// })
app.get("/services", async (req, res) => {
  try {
    const limit = req.headers.limit;
    const sort = { _id: -1 };
    const query = {};
    const cursor = servicesCollection
      .find(query)
      .limit(parseInt(limit))
      .sort(sort);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await servicesCollection.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});
app.post("/services", async (req, res) => {
  try {
    const result = await servicesCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});
app.delete("/add-review/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewsColleciton.deleteOne(query);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});
app.get("/add-review/:id", async (req, res) => {
    try {
      
    const id = req.params.id;
    const result = await reviewsColleciton.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});
app.patch("/add-review/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await reviewsColleciton.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});

app.post('/jwt', (req, res) => {
    try {
        const user = req.body
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
        res.send({token})
        // console.log(result)
    }
    catch (error) {
        console.log(error.name.bgRed, error.message.bold);
      }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
