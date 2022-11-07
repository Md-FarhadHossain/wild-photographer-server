const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors")
    require('colors')
    require('dotenv').config()
const app = express()
const PORT = process.env.PORT || 5000



app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.1ivadd4.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const dbConnect = async() => {
    try{
        await client.connect();
        console.log('database connected')
    }
    catch(error){
        console.log(error.name.bgRed, error.message.bold)
    }
}
dbConnect()
app.get('/', (req, res) => {
    res.send('Hello World!')
})

const servicesCollection = client.db('servicesDB').collection('servicesList')

// app.post('/services', async(req, res) => {
//     try {
//         const result = await servicesCollection.insertOne()
//         res.send(result)
//         console.log(result)
//     }
//     catch(error){
//         console.log(error.name.bgRed, error.message.bold)
//     }
// })
app.get('/services', async(req, res) => {
    try {
       const limit = req.headers.limit
       
        const query = {}
        const cursor = servicesCollection.find(query).limit(parseInt(limit))
        const result = await cursor.toArray()
        res.send(result)
    }
    catch(error){
        console.log(error.name.bgRed, error.message.bold)
    }
})

app.get('/services/:id', async(req, res) => {
    try {
        const id = req.params.id
        const result = await servicesCollection.findOne({ _id: ObjectId(id) })
        res.send(result)
    }
    catch(error){
        console.log(error.name.bgRed, error.message.bold)
    }
})
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

