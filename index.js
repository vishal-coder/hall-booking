import express from "express";
import { MongoClient, MongoServerError, ObjectId } from "mongodb";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log("Listening to requests....", process.env.PORT);
});

async function createConnection() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  console.log("Connected to DB");
  return client;
}

const client = await createConnection();

app.get("/", (req, res) => {
  res.send("default request made");
  console.log("request made");
});

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

app.post("/bookroom/", async function (req, res) {
  const data = req.body;
  const { id, booking_date, start_time, end_time } = data;
  data.booking_date = new Date(booking_date);
  data.start_time = new Date(booking_date + "T" + start_time + ":00.000Z");
  data.end_time = new Date(booking_date + "T" + end_time + ":00.000Z");
  data.booking_status = "booked";

  let isbookedresult;

  isbookedresult = await client
    .db("hall")
    .collection("booked_rooms")
    .find({
      $and: [
        {
          $or: [
            {
              $and: [
                { start_time: { $lte: new Date(data.start_time) } },
                { end_time: { $gte: new Date(data.start_time) } },
              ],
            },
            {
              $and: [
                { start_time: { $lte: new Date(data.end_time) } },
                { end_time: { $gte: new Date(data.end_time) } },
              ],
            },
          ],
        },
        { id: id },
      ],
    })
    .toArray();

  if (isbookedresult.length == 0) {
    let result = await client
      .db("hall")
      .collection("booked_rooms")
      .insertOne(data);

    let updateresult = await client
      .db("hall")
      .collection("rooms")
      .updateOne({ _id: ObjectId(id) }, { $set: { booking_status: "Booked" } });

    res.send(result);
  } else {
    res.send("Room is already booked for particular time");
  }
});

app.get("/listcustomers", async function (req, res) {
  console.log("list customer request made");
  let query = [
    { $addFields: { article_id: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "booked_rooms",
        localField: "article_id",
        foreignField: "id",
        as: "booking_Details",
      },
    },
    { $unwind: "$booking_Details" },
    {
      $project: {
        _id: 0,
        "customer name": "$booking_Details.customer_name",
        "room name": "$room_name",
        "booking date": "$booking_Details.booking_date",
        "start time": "$booking_Details.start_time",
        "end time": "$booking_Details.end_time",
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

app.get("/listrooms", async function (req, res) {
  let query = [
    { $addFields: { room_id: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "booked_rooms",
        localField: "room_id",
        foreignField: "id",
        as: "booking_Details",
      },
    },
    { $unwind: "$booking_Details" },
    {
      $project: {
        _id: 0,
        "room number": "$_id",
        "room name": "$room_name",
        "Booking Status": "$booking_status",
        "customer name": "$booking_Details.customer_name",
        "booking time": "$booking_Details.booking_date",
        "start time": "$booking_Details.start_time",
        "end date": "$booking_Details.end_time",
      },
    },
  ];

  const listrooms = await client
    .db("hall")
    .collection("rooms")
    .aggregate(query)
    .toArray();

  res.send(listrooms);
});
