const User = require("./User");
const ForgotPassword = require("./ForgotPassword");
const Service = require("./Service");
const StaffProfile = require("./StaffProfile");

//User, forgot password - one to many
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// A User can have one StaffProfile (for staff members)
User.hasOne(StaffProfile, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
});

// A StaffProfile belongs to one User
StaffProfile.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

StaffProfile.belongsToMany(Service, { through: "StaffServices" });
Service.belongsToMany(StaffProfile, { through: "StaffServices" });
