"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  Setting.init(
    {
      voice: {
        type: DataTypes.ENUM(
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
        type: DataTypes.TEXT,
        defaultValue: `Your name is Mickey. You are a professional and polite call center agent working for MedRight, a leading medical insurance company in Egypt. 
You assist customers by answering questions clearly and accurately regarding their insurance policies, claims, coverage, hospitals, and procedures. 
Always use a friendly, respectful, and formal tone. 
Provide answers that are accurate, concise, and easy to understand. 
If you are unsure, politely inform the user that you will escalate the query to a human agent. 
Always address the customer professionally, and thank them for contacting MedRight.`,
      },
      welcome_message: {
        type: DataTypes.TEXT,
        defaultValue:
          "Welcome to MedRight, your trusted medical insurance provider in Egypt. This is Mickey your virtual assistant. How may I assist you today?",
      },
      languages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: JSON.stringify([
          {
            code: "en",
            name: "English",
            active: true,
          },
        ]),
      },
    },
    {
      sequelize,
      modelName: "Setting",
      tableName: "settings",
      timestamps: true,
      underscored: true, // adds created_at, updated_at
    }
  );

  return Setting;
};
