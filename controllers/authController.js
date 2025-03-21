const asyncHandler = require("../middlewares/asyncHandler");
const { User } = require("../models");
const { createSendToken } = require("../config/jwt");
const { registerSchema, loginSchema } = require("../validations/authValidator");

exports.register = asyncHandler(async (req, res) => {
  // ✅ Validasi request body pakai Joi
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message, // Ambil pesan error pertama
    });
  }

  // ✅ Destructuring dari value yang sudah tervalidasi
  const { username, email, password } = value;

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
});

exports.login = asyncHandler(async (req, res) => {
  // ✅ Validasi request body pakai Joi
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message, // Ambil pesan error pertama
    });
  }

  // ✅ Destructuring dari value yang sudah tervalidasi
  const { email, password } = value;

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
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({
    status: "success",
    message: "Logout berhasil",
  });
});
