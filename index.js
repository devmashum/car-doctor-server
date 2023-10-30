const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqyepgg.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // collect the data from the MongoDB
        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingsCollection = client.db('carDoctor').collection('bookings')



        // jWT verification 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'none',
                })
                .send({ success: true })
        })

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                // Include only the `title` and `imdb` fields in each returned document
                projection: { title: 1, img: 1, price: 1, service_id: 1 },
            };


            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })
        // Booking Data send to MongoDB:
        app.post('/booking', async (req, res) => {
            const booking = req.body;

            const result = await bookingsCollection.insertOne(booking);
            res.send = (result);
            console.log(result);
        })

        // Data MongoDB theke load korar jonno :
        app.get('/booking', async (req, res) => {
            console.log(req.query.email);
            console.log('ttttt token', req.cookies.token)
            const result = await bookingsCollection.find().toArray();

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            res.send(result);

        })

        // delete data from client server
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        // Update the data
        app.patch('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedBooking = req.body;
            console.log(updatedBooking)
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                }
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // close na korle conection pabena 
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('doctor is running')
})
app.listen(port, () => {
    console.log(`car doctor server is running ${port}`)
})