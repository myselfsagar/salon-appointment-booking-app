const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data,
  });
};

const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errorDetails = {}
) => {
  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    error: errorDetails,
  });
};

module.exports = { sendSuccess, sendError };
