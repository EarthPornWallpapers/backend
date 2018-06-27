import express from "express";
import agent from "./src";

const app = express();
let isUpdating = false;

app.get("/", (req, res) => {
  if (isUpdating) {
    res.send("I'm currently updating the wallpaper list, check back shortly.");
  }
  res.send("Starting to update...");

  isUpdating = true;
  agent.start(() => isUpdating = false);
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
