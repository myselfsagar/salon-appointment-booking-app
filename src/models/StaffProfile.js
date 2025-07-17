// src/models/StaffProfile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConnect");

const StaffProfile = sequelize.define("staff_profiles", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "e.g., { monday: ['09:00-17:00'], tuesday: ['09:00-12:00'] }",
  },
  // bio: { type: DataTypes.TEXT },
  // hourlyRate: { type: DataTypes.FLOAT },
});

module.exports = StaffProfile;
