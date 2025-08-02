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
    type: DataTypes.ENUM("pending", "scheduled", "completed", "cancelled"),
    defaultValue: "scheduled",
    allowNull: false,
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Appointment;
