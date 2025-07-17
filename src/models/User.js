const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConnect");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: true },
  role: {
    type: DataTypes.ENUM("customer", "staff", "admin"),
    defaultValue: "customer",
    allowNull: false,
  },
});

module.exports = User;
