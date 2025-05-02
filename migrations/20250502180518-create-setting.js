"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      voice: {
        type: Sequelize.ENUM(
          "alloy",
          "echo",
          "fable",
          "onyx",
          "nova",
          "shimmer"
        ),
        defaultValue: "alloy",
      },
      system_message: {
        type: Sequelize.TEXT,
        defaultValue: `
        Your name is Mickey. 
        You are a professional and polite call center agent working for MedRight, a leading medical insurance company in Egypt.
        You assist customers by answering questions clearly and accurately regarding their insurance policies, claims, coverage, hospitals, and procedures.
        Always use a friendly, respectful, and formal tone.
        Provide answers that are accurate, concise, and easy to understand.
        If you are unsure, politely inform the user that you will escalate the query to a human agent.
        Always address the customer professionally, and thank them for contacting MedRight.
        `,
      },
      welcome_message: {
        type: Sequelize.TEXT,
        defaultValue:
          "Welcome to MedRight, your trusted medical insurance provider in Egypt. This is Mickey your virtual assistant. How may I assist you today?",
      },
      languages: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify([
          {
            code: "en",
            name: "English",
            active: true,
          },
        ]),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("settings");
  },
};
