const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      // reference to the users collection
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["IGNORED", "INTERESTED", "ACCEPTED", "REJECTED"],
        message: ` {VALUE} is not a valid status`,
      },
      required: true,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ senderId: 1, receiverId: 1 });

connectionRequestSchema.pre("save", function (next) {
  // connectionRequest is an object created using ConnectionRequest
  let connectionRequest = this;

  if (connectionRequest.senderId.equals(connectionRequest.receiverId)) {
    return next(new Error("Cannot send a connection request to yourself"));
  }
  next();
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = { ConnectionRequest };
