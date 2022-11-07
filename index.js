const jwt = require("jsonwebtoken")
// random bytes
// require('crypto').randomBytes(64).toString('hex')
const express = require("express");
const cors = require("cors")
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000

require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('genius car running is a express')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uadalh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // collection 
        // genius car database name
        // service DB name 
        const serviceCollection = client.db('geniusCar').collection('services')
        const orderCollection = client.db('geniusCar').collection('orders')

        app.get('/services', async (req, res) => {
            // query
            const query = {}
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            console.log(page, size)
            // find data form your collection
            const cursor = serviceCollection.find(query)
            // convert to Array onek gula data find korar somoi array te convert korte hobe
            const services = await cursor.skip(page*size).limit(size).toArray()
            const count = await serviceCollection.estimatedDocumentCount()
            // request send 
            res.send({services, count})

        })

        // create user token
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn : '23hr'})
            res.send({token})
            console.log(user)
            
        })

        // get single collection
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        // delete api
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const order = await orderCollection.deleteOne(query)
            res.send(order)
        })

        // order api
        // get all collection
        app.get('/orders', async (req, res) => {
            // find out email 
            let query = {}
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
                const cursor = orderCollection.find(query)
                const order = await cursor.toArray()
                res.send(order)
            })

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id
            const status = req.body.status
            console.log(id, status)
            const query = {_id : ObjectId(id)} 
            const updated = {$set : {status}}
            const result = await orderCollection.updateOne(query, updated)
            res.send(result) 
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
    }
    finally { }
}

run()


app.listen(port, () => {
    console.log('server is ', port)
})

