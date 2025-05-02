"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("settings", [
      {
        voice: "alloy",
        system_message: `
        your name is Mickey. You are a professional and polite call center agent working for MedRight, a leading medical insurance company in Egypt.
        You assist customers by answering questions clearly and accurately regarding their insurance policies, claims, coverage, hospitals, and procedures.
        Always use a friendly, respectful, and formal tone.
        Provide answers that are accurate, concise, and easy to understand.
        If you are unsure, politely inform the user that you will escalate the query to a human agent.
        Always address the customer professionally, and thank them for contacting MedRight.`,
        welcome_message:
          "Welcome to MedRight, your trusted medical insurance provider in Egypt. This is Mickey your virtual assistant. How may I assist you today?",
        languages: JSON.stringify([
          {
            code: "en",
            name: "English",
            active: true,
          },
          {
            code: "ar",
            name: "Arabic",
            active: true,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("settings", null, {});
  },
};
