import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import sizeOf from "image-size";
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
const cache = {};

// Finds the max wallpaper resolution that can be used for the provided image buffer
const getResolutionsForWallpaper = async image => {
  const src = sizeOf(image);
  return cache.resolutions.filter(res => {
    if (src.width >= res.width && src.height >= res.height) {
      return true;
    }
    return false;
  });
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
  const output = crypto
    .createHash("md5")
    .update(`${base}.${timestamp}${ext}`)
    .digest("hex");
  // Return the compiled filename
  return `${output}${ext}`;
};

const processImage = async ({
  resolutions,
  image,
  filename,
  title,
  reddit_timestamp,
  reddit_username,
  reddit_thread,
}) => {
  console.log("pre-resizer");
  const images = await resizer.batch(image, filename, resolutions);
  console.log("BATCH STARTED");
  const uploads = [];
  images.forEach(({ data, output }) => uploads.push(aws.put(data, output)));
  console.log("PROMISES:", uploads);
  const data = await Promise.all(uploads);
  console.log(uploads);
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const params = {
    title,
    reddit_timestamp,
    reddit_username,
    reddit_thread,
    filename: base,
    type: ext,
    resolutions,
  };
  // console.info(params);
  return await db.addWallpaper(params);
};

const start = onComplete =>
  // Load and process the RSS feed
  rss.load(entries => {
    const queue = [];

    entries.forEach(entry => {
      if (entry.image) {
        const src = path.basename(entry.image);
        const reddit_timestamp = Math.floor(
          new Date(entry.pubDate).getTime() / 1000
        );
        const dest = getFilename(src, reddit_timestamp);

        if (downloader.alreadySaved(dest)) {
          console.log(`Already downloaded ${src}; skipping.`);
        } else {
          const data = rss.parseEntry(entry);

          if (data.isOC) {
            console.log(`Downloading ${entry.image} as ${dest}...`);
            downloader.save(entry.image, dest, (filename, image) => {
              getResolutionsForWallpaper(image)
                .then(resolutions => {
                  // console.info("RESOLUTIONS", resolutions);
                  if (resolutions.length >= minResolutions) {
                    queue.push({
                      resolutions,
                      filename,
                      image,
                      title: data.title,
                      reddit_timestamp,
                      reddit_username: entry.author,
                      reddit_thread: entry.link,
                    });
                  } else {
                    console.info(
                      `Skipping ${filename}. Source image too small.`
                    );
                  }
                })
                .catch(err => {
                  throw err;
                });
            });
          }
        }
      }
    });

    // db.start();
    batch.start(queue, processImage);
    // db.close();
  });

if (require.main === module) {
  db.getResolutions()
    .then(resolutions => {
      cache.resolutions = resolutions;
      // downloader.save(
      //   "https://i.imgur.com/0MOUaKZ.jpg",
      //   "asdf.jpg",
      //   (filename, image) => {
      //     getResolutionsForWallpaper(image).then(resolutions => {
      //       processImage({
      //         resolutions,
      //         filename,
      //         image,
      //         title: "test",
      //         reddit_timestamp: 1234,
      //         reddit_username: "asdfas",
      //         reddit_thread: "asdfasfd",
      //       });
      //     });
      //   }
      // );
      start();
    })
    .catch(err => {
      throw err;
    });
}

export default {
  start,
  db,
};
