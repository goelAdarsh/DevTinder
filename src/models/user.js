const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    lastName: String,
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => {
          if (!validator.isEmail(value)) {
            throw new Error("Invalid Email ID");
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          if (!validator.isStrongPassword(value)) {
            throw new Error("Password is not strong enough!");
          }
        },
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate: {
        validator: (value) => {
          if (!["male", "female", "others"].includes(value.toLowerCase())) {
            throw new Error("Invalid gender!");
          }
        },
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4MagXl-Ujf1jacWRXoGNsLM6KAJCH-9eBDg&s",
      validate: {
        validator: (value) => {
          if (!validator.isURL(value)) {
            throw new Error("Invalid URL");
          }
        },
      },
    },
    about: {
      type: String,
      default: "Hey there! I am using DevTinder.",
    },
    skills: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
