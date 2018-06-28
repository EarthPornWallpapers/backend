import Sequelize from "sequelize";
import sequelize from "./connection";

// MODELS
const ResolutionModel = sequelize.define("resolutions", {
  width: Sequelize.INTEGER,
  height: Sequelize.INTEGER,
});

const WallpaperModel = sequelize.define("wallpapers", {
  title: { type: Sequelize.STRING, allowNull: false },
  author: Sequelize.STRING,
  reddit_timestamp: { type: Sequelize.INTEGER, allowNull: false },
  reddit_username: { type: Sequelize.STRING, allowNull: false },
  reddit_thread: { type: Sequelize.STRING, allowNull: false },
  filename: { type: Sequelize.STRING, allowNull: false, unique: true },
  type: { type: Sequelize.STRING, allowNull: false },
});

ResolutionModel.belongsToMany(WallpaperModel, {
  through: "wallpaper_resolutions",
});
WallpaperModel.belongsToMany(ResolutionModel, {
  through: "wallpaper_resolutions",
});

export default {
  ResolutionModel,
  WallpaperModel,
};
