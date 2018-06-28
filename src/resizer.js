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

const resize = (image, size) => sharp(image).resize(size.width, size.height);

const batch = async (image, filename, resolutions, onComplete) => {
  const images = [];
  // resolutions.forEach(res => {
  for (let i = 0; i < resolutions.length; i++) {
    const res = resolutions[i];
    console.info(`RESIZING ${filename} to ${res.width}x${res.height}`);
    const output = path.join(dir.out, getFilenameForSize(filename, res));
    await resize(image, { width: res.width, height: res.height })
      .toBuffer(output)
      .then(data => {
        console.info(`resized ${output}`);
        images.push({ data, output });
        // Check if that was the last file to resize
        if (images.length === resolutions.length) {
          console.info("finished resizing");
          // Add the original image to the return array
          // This is so  we can have an archived version of the
          // original image in the `src/` path.
          images.push({
            data: image,
            output: path.join(dir.src, path.basename(filename)),
            resolution: res,
          });
          // Return the resized image buffers to the callback
        }
      })
      .catch(err => {
        throw err;
      });
  }
  return images;
};

export default {
  resize,
  batch,
};
