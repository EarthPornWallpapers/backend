"use strict";
module.exports = (sequelize, DataTypes) => {
  var resolutions = sequelize.define(
    "resolutions",
    {
      width: DataTypes.INTEGER,
      height: DataTypes.INTEGER
    },
    {}
  );
  resolutions.associate = function(models) {
    resolutions.belongsToMany(models.wallpapers, {
      through: "wallpaper_resolutions"
    });
  };
  return resolutions;
};
