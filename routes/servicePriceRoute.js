const express = require("express");
const router = express.Router();
const {
  createServicePrice,
  getAllServicePrices,
  getServicePriceById,
  updateServicePrice,
  deleteServicePrice,
} = require("../controllers/servicePriceController");
const {
  authMiddleware,
  permissionMiddleware,
} = require("../middlewares/authHandler");

/**
 * @swagger
 * /api/service-prices:
 *   post:
 *     tags:
 *       - Service Prices
 *     summary: Membuat harga layanan baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - car_type
 *               - price
 *             properties:
 *               serviceId:
 *                 type: integer
 *               car_type:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service price created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("admin"),
  createServicePrice
);

/**
 * @swagger
 * /api/service-prices:
 *   get:
 *     tags:
 *       - Service Prices
 *     summary: Get all service prices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of service prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   serviceId:
 *                     type: integer
 *                   car_type:
 *                     type: string
 *                   price:
 *                     type: number
 */
router.get("/", authMiddleware, getAllServicePrices);

/**
 * @swagger
 * /api/service-prices/{id}:
 *   get:
 *     tags:
 *       - Service Prices
 *     summary: Get service price by ID
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
 *         description: Service price details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Service price not found
 */
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  getServicePriceById
);

/**
 * @swagger
 * /api/service-prices/{id}:
 *   put:
 *     tags:
 *       - Service Prices
 *     summary: Update service price
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
 *               serviceId:
 *                 type: integer
 *               car_type:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service price updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Service price not found
 */
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  updateServicePrice
);

/**
 * @swagger
 * /api/service-prices/{id}:
 *   delete:
 *     tags:
 *       - Service Prices
 *     summary: Delete service price
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
 *         description: Service price deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Service price not found
 */
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  deleteServicePrice
);

module.exports = router;
