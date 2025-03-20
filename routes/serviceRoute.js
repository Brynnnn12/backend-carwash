const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  update,
  deleteService,
} = require("../controllers/serviceController");
const {
  authMiddleware,
  permissionMiddleware,
} = require("../middlewares/authHandler");

router.post("/", authMiddleware, permissionMiddleware("admin"), create);
router.get("/", authMiddleware, permissionMiddleware("admin"), getAll);
router.put("/:id", authMiddleware, permissionMiddleware("admin"), update);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  deleteService
);

module.exports = router;
