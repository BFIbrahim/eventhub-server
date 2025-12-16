const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://mdibrahim36194_db_user:XSGmqvzubfyvFygQ@cluster0.livuvkt.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect()

        const database = client.db('database')
        const userCollections = database.collection('users')
        const registeredeventCollections = database.collection('registeredEvents')
        const eventsCollection = database.collection('events')

        app.get('/users', async (req, res) => {
            try {
                const users = await userCollections.find({}).toArray();
                res.send(users);
            } catch (error) {
                res.status(500).send({ message: "Failed to get users", error: error.message });
            }
        });
        app.post('/users', async (req, res) => {
            try {
                const user = req.body

                const existUser = await userCollections.findOne({ email: user.email })

                if (existUser) {
                    return res.send({ message: 'User Already exist' })
                }

                const result = await userCollections.insertOne(user)
                res.send(result)

            } catch (error) {
                res.status(500).send({ error: error.message });
            }

        })

        app.post('/registeredEvents', async (req, res) => {
            try {
                const registration = req.body

                const exist = await registeredeventCollections.findOne({
                    userEmail: registration.userEmail,
                    eventId: registration.eventId
                })

                if (exist) {
                    return res.send({ message: 'User already exists' })
                }

                const result = await registeredeventCollections.insertOne(registration)
                res.send(result)
            } catch (error) {
                res.send({ error: error.message })
            }
        })

        app.post('/events', async (req, res) => {
            try {
                const event = req.body

                event.createdAt = new Date()

                const result = await eventsCollection.insertOne(event)
                res.send(result)
            } catch (error) {
                res.send({ error: error.message })
            }

        })

        app.get('/events', async(req, res) => {
            try {
                const events = await eventsCollection.find({}).toArray()
                res.send(events)
            } catch (error) {
                console.log({error: error.message})
            }
        })

        await client.db('admin').command({ ping: 1 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
