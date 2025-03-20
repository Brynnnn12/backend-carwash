const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

exports.authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Cek apakah token ada di header Authorization atau cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // Ambil token setelah "Bearer"
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt; // Ambil token dari cookies jika ada
    }

    // Jika token tidak ada, kirim respons 401 (Unauthorized)
    if (!token) {
      return res.status(401).json({
        status: "401",
        message: "Anda belum login, silakan login terlebih dahulu",
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user berdasarkan ID yang ada di token
    // Ambil user dari database dengan role-nya
    const currentUser = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "role", attributes: ["name"] }], // Ambil nama role dari relasi
    });

    console.log("User Data:", currentUser.toJSON()); // Tambahkan log ini untuk debugging
    if (!currentUser) {
      return res.status(401).json({
        status: "401",
        message: "User tidak ditemukan",
      });
    }

    // Tambahkan user ke dalam `req.user`
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "401",
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
  }
};

exports.permissionMiddleware = (...roles) => {
  return async (req, res, next) => {
    const rolesData = await Role.findByPk(req.user.roleId);
    console.log(rolesData);
    const rolesName = rolesData.name;
    if (!roles.includes(rolesName)) {
      return next(
        res.status(403).json({
          status: "403",
          message: "Anda tidak memiliki akses",
        })
      );
    }
    // console.log(rolesName);
    next();
  };
};
