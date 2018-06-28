import express from "express";
import bodyParser from "body-parser";
import app from "./src";

const api = express();
api.use(bodyParser.json());
let isUpdating = false;

api.get("/", (req, res) => {
  if (isUpdating) {
    res.send("I'm currently updating the wallpaper list, check back shortly.");
  }
  res.send("Starting to update...");

  isUpdating = true;
  app.start(() => (isUpdating = false));
});

api.post("/resolutions", (req, res, next) => {
  app.db.getResolutions(req.body).then(resolutions => {
    res.send(resolutions);
  });
});

api.post("/wallpapers", (req, res, next) => {
  // if (resolutions) {
  //   app.db.models.ResolutionModel.getWallpapers(resolutions);
  // }
  app.db.getWallpapers(req.body).then(wallpaper => {
    res.send(wallpaper);
  });
});

api.listen(3000, () => console.log("Example app listening on port 3000!"));
