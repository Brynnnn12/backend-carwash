const { User, Profile } = require("../models");
const { createSendToken } = require("../config/jwt");
const { registerSchema, loginSchema } = require("../validators/authValidator");

exports.register = async (req, res) => {
  try {
    // ✅ Validasi request body pakai Joi
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message, // Ambil pesan error pertama
      });
    }

    const { username, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email sudah terdaftar" });
    }

    // Buat user baru
    const newUser = await User.create({ username, email, password });

    return createSendToken(newUser, 201, res);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // ✅ Validasi request body pakai Joi
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message, // Ambil pesan error pertama
      });
    }

    const { email, password } = req.body;

    // Cek apakah user ada
    const userLogin = await User.findOne({ where: { email } });

    if (
      !userLogin ||
      !(await userLogin.CorrectPassword(password, userLogin.password))
    ) {
      return res
        .status(401)
        .json({ status: "fail", message: "Email atau password salah" });
    }

    return createSendToken(userLogin, 200, res);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({
    status: "success",
    message: "Logout berhasil",
  });
};
