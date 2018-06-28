import dotenv from "dotenv";
import models from "./models";
import sequelize from "./connection";

// If we're on dev, import our .env file
if (process.env.NODE_ENVIRONMENT !== "production") {
  dotenv.config();
}

const parseURL = databaseURL => {
  let URLObj = url.parse(databaseURL);
  let [username, password] = URLObj.auth.split(":");
  return {
    username,
    password,
    host: URLObj.hostname,
    port: URLObj.port,
    database: URLObj.path.split("/")[1],
    dialect: "postgres",
  };
};

const close = () => sequelize.close();

const getResolutions = () => models.ResolutionModel.findAll();

const getWallpapers = async ({
  limit = 12,
  offset,
  query: { resolutions, ...query } = {},
} = {}) => {
  return await models.WallpaperModel.findAll({
    limit,
    offset,
    where: query,
    include: [
      {
        model: models.ResolutionModel,
        where: resolutions,
      },
    ],
  });
};

const addWallpaper = async (
  {
    title,
    author,
    reddit_timestamp,
    reddit_username,
    reddit_thread,
    filename,
    type,
    resolutions,
  },
  onComplete
) => {
  const wallpaper = await models.WallpaperModel.create({
    title,
    author,
    reddit_timestamp,
    reddit_username,
    reddit_thread,
    filename,
    type,
  }).catch(err => {
    throw err;
  });
  await wallpaper.setResolutions(resolutions);
  return wallpaper;
};

export default {
  models,
  sequelize,
  getResolutions,
  getWallpapers,
  addWallpaper,
  close,
};
