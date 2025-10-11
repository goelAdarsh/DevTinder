const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  },
  password: {
    type: String,
    required: true,
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
  },
  about: {
    type: String,
    default: "Hey there! I am using DevTinder.",
  },
  skills: [String],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
