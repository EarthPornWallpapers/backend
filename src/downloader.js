import download from "image-downloader";
import fs from "fs";
import path from "path";
import { dir } from "./config"

// Downloads the image from the url provided into the dest dir
const save = (url, dest, onComplete) => {
  download
    .image({ url, dest: path.join(dir.tmp, dest) })
    .then(({ filename, image }) => {
      onComplete(filename, image);
    })
    .catch(err => {
      console.error(err);
    });
};

// Checks whether or not a specific file has already been downloaded
const alreadySaved = filename => fs.existsSync(`${dir.tmp}/${filename}`);

export default {
  save,
  alreadySaved
};
