const mongoose = require("mongoose");

const connectDB = async () => {
  // connects to the cluster
  //   await mongoose.connect(
  //     "mongodb+srv://adarshgoel:WsRbiOwCUl0mZTwV@namastenode.qdzi2tw.mongodb.net/"
  //   );

  //   connects to the collection(devTinder) in the cluster
  await mongoose.connect(
    "mongodb+srv://adarshgoel:WsRbiOwCUl0mZTwV@namastenode.qdzi2tw.mongodb.net/devTinder"
  );
};

module.exports = { connectDB };
