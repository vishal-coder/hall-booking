import express from "express";
import { MongoClient, MongoServerError } from "mongodb";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("default request made");
  const client = createConnection();
  console.log("request made");
});

app.listen(3001, () => {
  console.log("Listening to requests at port 3001");
});

const MONGO_URL = "mongodb+srv://<>:<>@cluster0.wirzb.mongodb.net";
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Connected to DB");
  return client;
}

const client = await createConnection();

app.post("/createroom", express.json(), async function (req, res) {
  const data = req.body;
  console.log("creating room-", data);

  let insertResult;

  try {
    data.booking_status = "available";
    insertResult = await client.db("hall").collection("rooms").insertOne(data);
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      console.error("# Duplicate Data Found:\n", err);
      insertResult = {
        insertedId: null,
        message: "duplicate key error : please Enter new room id.",
      };
    } else {
      throw new Error(err);
    }
  }
  res.send(insertResult);
});

app.put("/bookroom/", async function (req, res) {
  const data = req.body;
  const { room_id } = data;
  var myquery = { _id: room_id };
  var newvalues = {
    $push: { booking_Details: data },
    $set: { booking_status: "booked" },
  };
  let result;
  try {
    result = await client
      .db("hall")
      .collection("rooms")
      .updateOne(myquery, newvalues);
    console.log("room booked successfully", result);
  } catch (error) {
    if (err instanceof MongoServerError && err.code === 11000) {
      console.error(
        "# E11000 duplicate key error collection*************:\n",
        err
      );
      result = {
        insertedId: null,
        message: "Message expalining the situation.",
      };
    } else {
      throw new Error(err);
    }
  }
  res.send(result);
});

app.get("/listrooms", async function (req, res) {
  console.log("listrooms request made");
  const roomlist = await client
    .db("hall")
    .collection("rooms")
    .find({})
    .toArray();
  res.send(roomlist);
});

app.get("/listcustomers", async function (req, res) {
  console.log("list customer request made");
  let query = [
    { $match: { booking_Details: { $exists: true, $ne: [] } } },
    { $unwind: "$booking_Details" },
    {
      $project: {
        _id: 0,
        "room number": "$_id",
        "room name": "$room_name",
        "customer name": "$booking_Details.customer_name",
        "booking date": "$booking_Details.booking_date",
        "start date": "$booking_Details.start_date",
        "end date": "$booking_Details.end_date",
      },
    },
  ];
  const customerList = await client
    .db("hall")
    .collection("rooms")
    .aggregate(query)
    .toArray();
  res.send(customerList);
});
