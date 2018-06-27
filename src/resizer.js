import path from "path";
import sharp from "sharp";
import { resolutions, dir } from "./config";

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

const resize = (image, size, output) =>
  sharp(image)
    .resize(size.width, size.height)
    .toFile(output);

const batch = (image, filename, maxRes) => {
  resolutions.slice(0, maxRes + 1).forEach(res => {
    console.info(`RESIZING ${filename} to ${res.width}x${res.height}`);
    const output = path.join(dir.out, getFilenameForSize(filename, res));
    resize(image, res, output)
      .then(data => {
        console.info(`RESIZED -> ${output}`);
      })
      .catch(err => {
        throw err;
      });
  });
};

export default {
  resize,
  batch
}
