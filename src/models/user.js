const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

userSchema.methods.getJWT = async function () {
  let user = this;
  const token = await jwt.sign({ _id: user._id }, "devTinderSecretKey", {
    expiresIn: "1d",
  });
  return token;

};

userSchema.methods.validatePassword = async function (password){
  let user = this;
  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
