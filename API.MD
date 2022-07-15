# API Documentation

### following documents gives information about all API request and response with sample data and methods used

1.  <mark>Create Room </mark>

    1. `POST` - https://hall-booking-heroku-guvi.herokuapp.com/createroom
    2. sample request
       ```
       {
       "seat_couont":50, //Number
       "amenities":["projector"," FreeParking","CCTV Security","Free food"], //Array of String
       "room_name":"Executive", //String
       "price_per_hour" : 3000 // Number
       }
       ```
    3. Sample Response
       ```
           {
           "acknowledged": true,
           "insertedId": "62d16c0e8a992f3d142c34eb"
           }
       ```
       insertedId - is considered as room id which is required in booking room

2.  <mark>Book Room </mark>

    1. `POST` - https://hall-booking-heroku-guvi.herokuapp.com/bookroom
    2. Sample request

       ```
           {
               "customer_name":"John", // String
               "booking_date" : "2022-07-15",// YYYY-MM-DD in string
               "start_time":"12:00", // 24HR format in string
               "end_time":"13:00", // 24HR format in string
               "id":"62d16c0e8a992f3d142c34eb" // string format id generated while creating room
           }
       ```

       3.Sample response

       1. If room booked successfully

       ```
          {
              "acknowledged": true,
              "insertedId": "62d16dba8a992f3d142c34ee"
          }
       ```

       1. If time slot is already booked by other customer

       ```
           Room is already booked for particular time
       ```

3.  <mark>List All Room </mark>

    1. `GET` - https://hall-booking-heroku-guvi.herokuapp.com/listrooms
    1. No request body/parameters
    1. Sample Response

    ```

    [{
        "room number": "62d012857a98aef07bc5eeba",
        "room name": "Deluxe",
        "Booking Status": "booked",
        "customer name": "John",
        "booking date": "2022-07-14T00:00:00.000Z",
        "start date": "2022-07-14T14:00:00.000Z",
        "end date": "2022-07-14T16:00:00.000Z"
    },
    {
        "room number": "62d012857a98aef07bc5eeba",
        "room name": "Deluxe",
        "Booking Status": "booked",
        "customer name": "John",
        "booking date": "2022-07-15T00:00:00.000Z",
        "start date": "2022-07-15T13:00:00.000Z",
        "end date": "2022-07-15T17:00:00.000Z"
    }]
    ```

4.  <mark>List All Customers </mark>
    1. `GET` - https://hall-booking-heroku-guvi.herokuapp.com/listcustomers
    2. No request body/parameters
    3. Sample response
    ```
        [{
            'customer name': 'John',
            'room name': 'Executive',
            'booking date': 2022-07-15T00:00:00.000Z,
            'start time': 2022-07-15T12:00:00.000Z,
            'end time': 2022-07-15T13:00:00.000Z
        },
        {
            'customer name': 'John',
            'room name': 'Executive',
            'booking date': 2022-07-15T00:00:00.000Z,
            'start time': 2022-07-15T14:00:00.000Z,
            'end time': 2022-07-15T18:00:00.000Z
        }]
    ```
