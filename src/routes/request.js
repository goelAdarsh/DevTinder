const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
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
    const existingConnectionRequest = await ConnectionRequest.findOne({
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

    const connectionRequest = new ConnectionRequest({
      senderId,
      receiverId,
      status,
    });

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

router.patch("/requests/:requestId", userAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.requestId;

    // validation for status
    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status type",
        data: null,
        errors: { status: `Status must be either 'ACCEPTED' or 'REJECTED'` },
      });
    }

    const connectionRequest = await ConnectionRequest.findById(requestId);
    // validation to check if connectionRequest exists
    if (!connectionRequest) {
      return res.status(404).json({
        status: "error",
        message: "Connection request not found",
        data: null,
        errors: {
          requestId: "No connection request found with the provided requestId",
        },
      });
    }

    // validation to check if the logged in user is the receiver of the connection request
    const loggedInUserId = req.user["_id"];
    if (!connectionRequest.receiverId.equals(loggedInUserId)) {
      return res.status(403).json({
        status: "error",
        message:
          "Unauthorized access: You can only modify your own connection requests",
        data: null,
        errors: {
          authorization: "You do not have permission to modify this request",
        },
      });
    }

    // validation to check if the connection request was already IGNORED
    if (connectionRequest.status === "IGNORED") {
      return res.status(409).json({
        status: "error",
        message: "Profile already ignored",
        data: null,
        errors: {
          status:
            "The connection request has already been ignored and cannot be processed again.",
        },
      });
    }

    // validation to check if the connection request was already ACCEPTED or REJECTED
    if (["ACCEPTED", "REJECTED"].includes(connectionRequest.status)) {
      return res.status(409).json({
        status: "error",
        message: `Connection request already ${connectionRequest.status.toLowerCase()}`,
        data: null,
        errors: {
          status: `The connection request has already been ${connectionRequest.status.toLowerCase()} and cannot be processed again.`,
        },
      });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.status(200).json({
      status: "success",
      message: `Connection request is ${status.toLowerCase()}`,
      data,
      errors: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      data: null,
      errors: {
        general: error.message || "Internal server error",
      },
    });
  }
});

module.exports = router;
