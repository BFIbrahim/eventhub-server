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
        const reviewCollection = database.collection('reviews')

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
                const registration = req.body;

                if (!registration.userEmail || !registration.eventId) {
                    return res.status(400).send({ message: 'Email and Event ID are required' });
                }

                const exist = await registeredeventCollections.findOne({
                    userEmail: registration.userEmail,
                    eventId: registration.eventId
                });

                if (exist) {
                    return res.status(400).send({ message: 'User already registered for this event' });
                }

                const result = await registeredeventCollections.insertOne(registration);
                res.send(result);

            } catch (error) {
                console.error(error);
                res.status(500).send({ error: error.message });
            }
        });


        app.get('/registeredEvents', async (req, res) => {
            try {
                const email = req.query.email
                if (!email) {
                    return res.send({ message: "Email is required" });
                }

                const result = await registeredeventCollections.find({ userEmail: email }).toArray()
                res.send(result)

            } catch (error) {
                console.log({ error: error, message })
            }
        })

        app.delete('/registeredEvents/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await registeredeventCollections.deleteOne({
                    _id: new ObjectId(id)
                });

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Booking not found" });
                }

                res.send({ message: "Booking cancelled successfully" });
            } catch (error) {
                console.error("Delete Error:", error);
                res.status(500).send({ error: error.message });
            }
        });



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

        app.get('/events', async (req, res) => {
            try {
                const events = await eventsCollection.find({}).toArray()
                res.send(events)
            } catch (error) {
                console.log({ error: error.message })
            }
        })

        app.post('/reviews', async (req, res) => {
            try {
                const review = req.body;

                const {
                    bookingId,
                    eventId,
                    userEmail,
                    userName,
                    rating,
                    comment
                } = review;

                if (!bookingId || !eventId || !userEmail || !rating || !comment) {
                    return res.status(400).send({
                        message: "All required fields must be provided"
                    });
                }

                const existingReview = await reviewCollection.findOne({
                    bookingId: bookingId
                });

                if (existingReview) {
                    return res.status(409).send({
                        message: "Review already submitted for this booking"
                    });
                }

                const reviewData = {
                    bookingId,
                    eventId,
                    userEmail,
                    userName,
                    rating,
                    comment,
                    createdAt: new Date()
                };

                const result = await reviewCollection.insertOne(reviewData);

                res.send({
                    success: true,
                    message: "Review submitted successfully",
                    insertedId: result.insertedId
                });

            } catch (error) {
                console.error("Review Error:", error.message);
                res.status(500).send({
                    success: false,
                    message: "Failed to submit review",
                    error: error.message
                });
            }
        });

        app.get('/reviews', async (req, res) => {
            try {
                const reviews = await reviewCollection
                    .find({})
                    .sort({ createdAt: -1 })
                    .limit(9)
                    .toArray();

                res.send(reviews);
            } catch (error) {
                console.error("Get Reviews Error:", error.message);
                res.status(500).send({
                    message: "Failed to load reviews",
                    error: error.message
                });
            }
        });



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
