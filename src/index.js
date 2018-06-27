import path from "path";
import dotenv from "dotenv";
import sizeOf from "image-size";
import { resolutions } from "./config";
import db from "./db";
import rss from "./rss";
import aws from "./aws";
import downloader from "./downloader";
import resizer from "./resizer";
import batch from "./batch";

dotenv.config();
// This defines how many different resolutions an image needs to support
// in order to get uploaded.
const minResolutions = 5;

// Finds the max wallpaper resolution that can be used for the provided image buffer
const maxWallpaperSize = image => {
  const src = sizeOf(image);
  let maxRes = null;
  resolutions.map((res, index) => {
    if (src.width >= res.width && src.height >= res.height) {
      maxRes = index;
    }
  });
  return maxRes;
};

// Returns a comma separated list of resolutions
// that are smaller than the source image.
const getSizeList = index =>
  resolutions
    .slice(0, index + 1)
    .map(res => `${res.width}x${res.height}`)
    .join(",");

const getFilename = (filename, timestamp) => {
  // Get the file extension
  const ext = path.extname(filename);
  // Get the base filename without extension
  const base = path.basename(filename, ext);
  // Return the compiled filename
  return `${base}.${timestamp}${ext}`;
};

const processImage = ({ image, filename, maxRes, timestamp, title }) => {
  resizer.batch(image, filename, maxRes, images => {
    const uploads = [];
    images.forEach(({ data, output }) => uploads.push(aws.put(data, output)));
    Promise.all(uploads)
      .then(data => {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        console.info({
          timestamp,
          title,
          filename: base,
          type: ext,
          sizes: getSizeList(maxRes)
        });
        db.insertImage({
          timestamp,
          title,
          filename: base,
          type: ext,
          sizes: getSizeList(maxRes)
        });
      })
      .catch(err => {
        throw err;
      });
  });
};

// Load and process the RSS feed
rss.load(entries => {
  const queue = [];

  entries.forEach(entry => {
    if (entry.image) {
      const src = path.basename(entry.image);
      const timestamp = new Date(entry.pubDate).getTime();
      const dest = getFilename(src, timestamp);

      if (downloader.alreadySaved(dest)) {
        console.log(`Already downloaded ${src}; skipping.`);
      } else {
        console.log(`Downloading ${src} as ${dest}...`);

        const data = rss.parseEntry(entry);

        if (data.isOC) {
          downloader.save(entry.image, dest, (filename, image) => {
            const maxRes = maxWallpaperSize(image);
            if (maxRes >= minResolutions - 1) {
              queue.push({
                filename,
                image,
                maxRes,
                timestamp,
                title: data.title
              });
            } else {
              console.info(`Skipping ${filename}. Source image too small.`);
            }
          });
        }
      }
    }
  });

  db.start(() => {
    batch.start(queue, processImage);
  });
  // db.close();
});
