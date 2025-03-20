const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

exports.authMiddleware = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  token = req.cookies.jwt;

  if (!token) {
    return next(
      res.status(401).json({
        status: "401",
        message: "Anda belum login, silahkan login terlebih dahulu",
      })
    );
  }

  let decoded;
  try {
    decoded = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      res.status(401).json({
        status: "401",
        message: "Token tidak valid",
      })
    );
  }
  // console.log(decoded);

  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      res.status(401).json({
        status: "401",
        message: "User tidak ditemukan",
      })
    );
  }
  // console.log("nama user", currentUser.name);

  req.user = currentUser;
  next();
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
