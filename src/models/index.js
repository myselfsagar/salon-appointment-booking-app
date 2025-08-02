const User = require("./User");
const ForgotPassword = require("./ForgotPassword");
const Service = require("./Service");
const StaffProfile = require("./StaffProfile");
const Appointment = require("./Appointment");
const Review = require("./Review");

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

// Appointment associations
Appointment.belongsTo(User, { foreignKey: "customerId" });
Appointment.belongsTo(StaffProfile, { foreignKey: "staffId" });
Appointment.belongsTo(Service, { foreignKey: "serviceId" });

User.hasMany(Appointment, { foreignKey: "customerId" });
StaffProfile.hasMany(Appointment, {
  as: "staffAppointments",
  foreignKey: "staffId",
});
Service.hasMany(Appointment, { foreignKey: "serviceId" });

// Review Associations
Review.belongsTo(User, { foreignKey: "customerId" });
User.hasMany(Review, { foreignKey: "customerId" });

Review.belongsTo(Service, { foreignKey: "serviceId" });
Service.hasMany(Review, { foreignKey: "serviceId" });

Review.belongsTo(Appointment, { foreignKey: "appointmentId" });
Appointment.hasOne(Review, { foreignKey: "appointmentId" });
