const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

const USER_SELECT_FIELDS = [
  "firstName",
  "lastName",
  "age",
  "about",
  "photoUrl",
  "skills",
];

router.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user["_id"];

    // fetch all INTERESTED(pending) connectionRequests received by the loggedIn User
    const data = await ConnectionRequestModel.find({
      receiverId: loggedInUserId,
      status: "INTERESTED",
    }).populate("senderId", USER_SELECT_FIELDS);
    // .populate("senderId") sends the complete user document of the senderId which leaks PII
    // like email, hashedPassword, etc. A case of OVERFETCHING.

    if (!data.length) {
      return res.status(200).json({
        status: "success",
        message: "No pending connection requests",
        data: [],
        errors: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Pending connection requests fetched successfully",
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

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user["_id"];

    let data = await ConnectionRequestModel.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      status: "ACCEPTED",
    }).populate({
      path: ["senderId", "receiverId"],
      select: USER_SELECT_FIELDS,
    });

    if (!data.length) {
      return res.status(200).json({
        status: "success",
        message: "No connections found",
        data: [],
        errors: null,
      });
    }

    data = data.map((connection) => {
      if (connection.senderId["_id"].equals(loggedInUserId)) {
        return connection.receiverId;
        // receiverId contains the entire user document of the receiver (but only selected
        // fields)
      } else {
        return connection.senderId;
      }
    });

    res.status(200).json({
      status: "success",
      message: "Connections fetched successfully",
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

router.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user["_id"];

    // fetch all connection requests (irrespective of status)
    const processedConnectionRequests = await ConnectionRequestModel.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).select(["senderId", "receiverId"]);

    // hideUsersList contains
    // 1. ids of all the users who has interacted with the loggedInUser
    // 2. id of the loggedInUser
    const hideUsersList = new Set();
    processedConnectionRequests
      ? processedConnectionRequests.forEach((connectionRequest) => {
          hideUsersList.add(connectionRequest.receiverId.toString());
          hideUsersList.add(connectionRequest.senderId.toString());
        })
      : hideUsersList.add(loggedInUserId.toString());

    const data = await User.find({
      _id: { $nin: [...hideUsersList] },
    }).select(USER_SELECT_FIELDS);

    if (!data.length) {
      return res.status(200).json({
        status: "success",
        message: "No other profiles found",
        data: [],
        errors: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "User feed fetched successfully",
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
