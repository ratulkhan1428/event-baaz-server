const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tinmm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 3001;

app.get('/', (req, res) => {
    res.send("Hello, it's working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("eventBaaz").collection("services");
  const bookingCollection = client.db("eventBaaz").collection("bookings");
  const adminCollection = client.db("eventBaaz").collection("admins");
  const testimonialCollection = client.db("eventBaaz").collection("testimonials");
  
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const service = req.body.name;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ service, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addTestimonial', (req, res) => {
        const testimonial = req.body;
        console.log(testimonial)
        testimonialCollection.insertOne(testimonial)
        .then(result => {
            res.send(result.insertedCount)
        })
    })

    app.get('/testimonials', (req, res) => {
        testimonialCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addBooking', (req, res) => {
        const booking = req.body;
        console.log(booking);
        bookingCollection.insertOne(booking)
        .then(result => {
          res.send(result.insertedCount)
        })
    })
  
    app.get('/bookings', (req, res) => {
        bookingCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })


    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        console.log('delete this', id);
        serviceCollection.findOneAndDelete({_id: id})
        .then(result => {
            res.send(!!result.value)
            console.log(result.value)
        })
    })

});



app.listen(process.env.PORT || port);