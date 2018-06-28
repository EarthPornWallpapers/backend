'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('resolutions', [
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1024,
        height: 768
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1280,
        height: 720
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1280,
        height: 800
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1280,
        height: 1024
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1366,
        height: 768
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1440,
        height: 900
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1536,
        height: 864
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1600,
        height: 900
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1680,
        height: 1050
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1920,
        height: 1080
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 1920,
        height: 1200
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 2560,
        height: 1440
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 3440,
        height: 1440
      },
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 3840,
        height: 2160
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('resolutions', null, {});
  }
};
