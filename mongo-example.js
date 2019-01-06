const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://m001-student:Applesauces21@cluster0-fb7hz.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(err => {

  if (err) {
    console.error(`Failed to connect: ${uri}`);
    throw err;
  }

  console.log(`Connected to mongodb: ${uri}`);

  const collection = client.db("tweeter").collection("tweets");

  function getTweets(callback) {
    collection.find().toArray(callback);
  }

  getTweets((err, tweets) => {

    if (err) throw err;

    for (let tweet of tweets) {
      console.log(tweet);
    }

    client.close();
  });

});
