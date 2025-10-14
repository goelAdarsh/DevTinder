const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.post("/requests", userAuth, async (req, res) => {
  try {
    const { receiverId, status } = req.body;
    const senderId = req.user["_id"];

    // validation for receiverId
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        data: null,
        errors: { receiverId: "No user found with the provided receiverId" },
      });
    }

    // validation for sending request to self
    // if (receiverId === senderId) {
    //   return res.status(409).json({
    //     status: "error",
    //     message: "Invalid receiverId",
    //     data: null,
    //     errors: {
    //       receiverId: "Cannot send a connection request to yourself",
    //     },
    //   });
    // }
    // pre method in connectionRequestSchema can also be used; It acts like a Middleware and is
    // called everytime a connectionRequest is saved to the collection (just before .save() is
    // called). Inside pre, we can also perform logging and monitoring...

    // validation for status
    if (!["IGNORED", "INTERESTED"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status type",
        data: null,
        errors: { status: `Status must be either 'IGNORED' or 'INTERESTED'` },
      });
    }

    // validation for duplicate requests
    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        // check if sender has already sent a connection request to the receiver
        { senderId, receiverId },
        // OR
        // check if the receiver has already sent a connection request to the receiver
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    if (existingConnectionRequest) {
      return res.status(409).json({
        status: "error",
        message: "Connection request already exists",
        data: null,
        errors: {
          receiverId: `A connection request already exists between the users`,
        },
      });
    }

    const connectionRequest = new ConnectionRequestModel({
      senderId,
      receiverId,
      status,
    });

    console.log("Connection Request: ", connectionRequest);

    const data = await connectionRequest.save();
    let message;
    switch (status) {
      case "IGNORED":
        message = "Profile ignored successfully!";
        break;
      case "INTERESTED":
        message = "Connection request sent successfully!";
        break;
    }

    res.status(201).json({
      status: "success",
      message,
      data,
      errors: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
      data: null,
      errors: { general: error.message || "Internal Server Error" },
    });
  }
});

module.exports = router;
