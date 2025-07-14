const signupController = async (req, res) => {
  try {
    res.send("Signup controller");
  } catch (error) {
    console.log(error);
  }
};

const loginController = async (req, res) => {
  try {
    res.send("Login controller");
  } catch (error) {
    console.log(error);
  }
};

const logoutController = async (req, res) => {
  try {
    res.send("Logout controller");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signupController,
  loginController,
  logoutController,
};
