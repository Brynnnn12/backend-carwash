'use strict';

const{v4} = require ("uuid")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Profiles', [
      {
        id: v4(),
        name: 'Bryan Doe',
        address: 'Jl. Raya No.10',
        avatar: 'https://example.com/avatar1.jpg',
        phoneNumber: '081234567890',
        userId: '86c2eaf9-e6fc-4892-a98c-a4fcbac08896', // Gunakan ID yang diminta
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Profiles', {
      userId: '86c2eaf9-e6fc-4892-a98c-a4fcbac08896'
    }, {});
  }
};
