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

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags:
 *       - Services
 *     summary: Create new service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post("/", authMiddleware, permissionMiddleware("admin"), create);

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   description:
 *                     type: string
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     tags:
 *       - Services
 *     summary: Update service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Service not found
 */
router.put("/:id", authMiddleware, permissionMiddleware("admin"), update);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Service not found
 */
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  deleteService
);

module.exports = router;
