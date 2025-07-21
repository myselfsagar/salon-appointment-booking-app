const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConnect");

const Appointment = sequelize.define("appointments", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointmentDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
    defaultValue: "scheduled",
    allowNull: false,
  },
});

module.exports = Appointment;
