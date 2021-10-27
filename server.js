// import
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// initialize
const app = express();

// port
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// root get api
app.get("/", (req, res) => {
  res.send("your server is running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dv4ff.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("coding_club_institute");
    const courses_collection = database.collection("courses");
    const cart_collection = database.collection("cart");

    // // user add api
    // app.post("/courses/add", async (req, res) => {
    //   const user = req.body;
    //   const result = await courses_collection.insertOne(user);
    //   console.log(`A document was inserted with the _id: ${result.insertedId}`);
    //   res.json("user added");
    // });

    // courses: get api
    app.get("/courses", async (req, res) => {
      const query = req.query;
      const cursor = courses_collection.find({});
      const count = await cursor.count();

      const page = req.query.page;
      const size = parseInt(req.query.size);

      let courses;
      if (page) {
        courses = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        courses = await cursor.toArray();
      }

      res.send({ count, courses });
    });

    // cart get api
    app.get("/cart/:email", async (req, res) => {
      let courses;
      if (req.params.email) {
        const cursor = cart_collection.find({ email: req.params.email });
        courses = await cursor.toArray();
      } else {
        courses = [];
      }
      res.json(courses);
    });
    // add to cart post api
    app.put("/addtocart", async (req, res) => {
      const {
        img,
        title,
        desc,
        price,
        provider,
        rating,
        ratingCount,
        sellerThumb,
        email,
      } = req.body;
      const course = {
        img,
        title,
        desc,
        price,
        provider,
        rating,
        ratingCount,
        sellerThumb,
        email,
      };
      course.selected = true;
      const result = await cart_collection.insertOne(course);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });
    // remove delete api
    app.delete("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cart_collection.deleteOne(query);
      res.json(result);
    });

    // delete all after purchasing api
    app.delete("/purchase", async (req, res) => {
      const query = { selected: true };
      const result = await cart_collection.deleteMany(query);
      res.json(result);
    });
    // single user get api
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courses_collection.findOne(query);
      res.send(course);
    });

    // // update user put api
    // app.put("/update/:id", async (req, res) => {
    //   const { name, age } = req.body;
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const options = { upsert: true };

    //   const updateUser = {
    //     $set: {
    //       name,
    //       age,
    //     },
    //   };

    //   const result = await courses_collection.updateOne(query, updateUser);
    //   res.json(result);
    // });
  } finally {
  }
}

run().catch((err) => {
  console.log(err);
});

app.listen(port, () => console.log("server is running on port", port));
