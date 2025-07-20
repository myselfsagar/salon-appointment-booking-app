const Sib = require("sib-api-v3-sdk");
const ForgotPassword = require("../models/ForgotPassword");
const ErrorHandler = require("../utils/errorHandler");

const client = Sib.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

const sendPasswordResetEmail = async (user, transaction = null) => {
  if (!user || !user.email || !user.id) {
    throw new ErrorHandler(
      "User details are required to send a password reset email.",
      400
    );
  }

  const sender = { email: "ssahu6244@gmail.com", name: "From Admin SAGAR" };
  const receivers = [{ email: user.email }];

  const resetResponse = await ForgotPassword.create(
    { userId: user.id },
    { transaction }
  );
  const { id } = resetResponse;

  const mailresponse = await tranEmailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject: "Saloon Booking App - Reset Your password",
    htmlContent: `
              <!DOCTYPE html>
                <html>
                <head>
                    <title>Password Reset</title>
                </head>
                <body>
                    <h1>Reset Your Password</h1>
                    <p>Click the button below to reset your password (Valid for 5 minute):</p><br>
                    <button><a href="${process.env.WEBSITE}/password/resetPassword/${id}">Reset Password</a></button>
                </body>
                </html>`,
  });

  return mailresponse;
};

module.exports = {
  sendPasswordResetEmail,
};
