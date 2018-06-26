import fs from "fs";
import path from "path";
import sharp from "sharp";
import Parser from "rss-parser";
import sizeOf from "image-size";
import download from "image-downloader";
import { resolutions } from "./config";
import db from "./db";

// Initialize the RSS parser object
const parser = new Parser();

// Destination for downloading raw images
const tmpDir = "./tmp";

// Destination for resized wallpapers
const outDir = "./wallpapers";

const idOffset = 1000;

// This defines how many different resolutions an image needs to support
// in order to get uploaded.
const minResolutions = 5;

// Extracts the image URL from the feed entry's content string
const getImageURL = content => {
  const re = /https:\/\/[A-Za-z0-9.-\/]*.(jpg|jpeg|png)/gm;
  const matches = content.match(re);
  if (!matches) return false;
  return matches[matches.length - 1];
};

// Downloads the image from the url provided into the dest dir
const saveImage = (url, dest, onComplete) => {
  download
    .image({ url, dest: path.join(tmpDir, dest) })
    .then(({ filename, image }) => {
      onComplete(filename, image);
    })
    .catch(err => {
      console.error(err);
    });
};

// Checks whether or not a specific file has already been downloaded
const alreadyDownloaded = filename => fs.existsSync(`${tmpDir}/${filename}`);

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

const startQueue = (queue, handler, freq = 2500) =>
  setInterval(() => nextQueue(queue, handler), freq);

const nextQueue = (queue, handler) => {
  if (queue.length == 0) return false;
  const img = queue.shift();
  handler(img);
};

// Returns a comma separated list of resolutions
// that are smaller than the source image.
const getSizeList = index =>
  resolutions
    .slice(0, index + 1)
    .map(res => `${res.width}x${res.height}`)
    .join(",");

const resize = (image, size, output) =>
  sharp(image)
    .resize(size.width, size.height)
    .toFile(output);

const getFilename = (filename, timestamp) => {
  // Get the file extension
  const ext = path.extname(filename);
  // Get the base filename without extension
  const base = path.basename(filename, ext);
  // Return the compiled filename
  return `${base}.${timestamp}${ext}`;
};

const getFilenameForSize = (filename, size) => {
  // Get the file extension
  const ext = path.extname(filename);
  // Get the base filename without extension
  const base = path.basename(filename, ext);
  // Get the size postfix (i.e. 1920x1080)
  const postfix = `${size.width}x${size.height}`;
  // Return the compiled filename
  return `${base}.${postfix}${ext}`;
};

const batchResize = (image, filename, maxRes) => {
  resolutions.slice(0, maxRes + 1).forEach(res => {
    console.info(`RESIZING ${filename} to ${res.width}x${res.height}`);
    const output = path.join(outDir, getFilenameForSize(filename, res));
    resize(image, res, output)
      .then(data => {
        console.info(`RESIZED -> ${output}`);
      })
      .catch(err => {
        throw err;
      });
  });
};

const processImage = ({ image, filename, maxRes, timestamp, title }) => {
  batchResize(image, filename, maxRes);
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
};

const parsePost = post => {
  const isOC = post.title.match(/(\(|\[)([oO][cC])(\)|\])/) !== null;
  const url = getImageURL(post.content);

  // Remove both the [OC] and size tag [1920x1200]
  const title = post.title
    .replace(/(\(|\[)([oO][cC])(\)|\])/, "")
    .replace(/(\(|\[)([0-9pPxX]*( |)[xX×]( |)[0-9pPxX]*)(\)|\])/, "")
    .trim();

  return { isOC, url, title };
};

(async () => {
  let feed = await parser.parseURL("https://www.reddit.com/r/EarthPorn/.rss");
  const queue = [];

  feed.items.forEach(item => {
    const imgUrl = getImageURL(item.content);
    if (imgUrl) {
      const src = path.basename(imgUrl);
      const timestamp = new Date(item.pubDate).getTime();
      const dest = getFilename(src, timestamp);

      if (alreadyDownloaded(dest)) {
        console.log(`Already downloaded ${src}; skipping.`);
      } else {
        console.log(`Downloading ${src} as ${dest}...`);

        const data = parsePost(item);

        if (data.isOC) {
          saveImage(imgUrl, dest, (filename, image) => {
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
    startQueue(queue, processImage);
  });
  // db.close();
})();
