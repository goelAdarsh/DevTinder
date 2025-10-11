const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send("Error fetching feeds: " + error.message);
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Error fetching user: " + error.message);
  }
});

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send("User added successfully!");
  } catch (error) {
    res.status(400).send("Error adding user: " + error.message);
  }
});

app.patch("/user/:userId", async (req, res) => {
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "skills", "gender", "age"];
    const isUpdateAllowed = Object.keys(req.body).every(key => ALLOWED_UPDATES.includes(key));
    if(!isUpdateAllowed){
      throw new Error("Update not allowed!")
    }
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.status(200).send("User updated successfully!");
  } catch (error) {
    res.status(400).send("Error updating user: " + error.message);
  }
});

app.delete("/user", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.body.userId);
    console.log(user);

    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully!");
    }
  } catch (error) {
    res.status(400).send("Error deleting user: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully!");
    app.listen(3000, () => {
      console.log("Server listening on PORT 3000...");
    });
  })
  .catch((err) => console.log("Failed to connect to the database!"));
