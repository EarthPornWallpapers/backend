"use strict";
module.exports = (sequelize, DataTypes) => {
  var wallpapers = sequelize.define(
    "wallpapers",
    {
      title: DataTypes.STRING,
      author: DataTypes.STRING,
      reddit_timestamp: DataTypes.INTEGER,
      reddit_username: DataTypes.STRING,
      reddit_thread: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
    },
    {}
  );
  wallpapers.associate = function(models) {
    wallpapers.belongsToMany(models.resolutions, {
      through: "wallpaper_resolutions",
    });
  };
  return wallpapers;
};
