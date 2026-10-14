
const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const auth = require("../../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, social authentication, and profile access
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid registration data
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in to AgriNova
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/social:
 *   post:
 *     summary: Authenticate using a social account
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Social authentication successful
 *       400:
 *         description: Invalid social authentication data
 */
router.post("/social", authController.socialAuth);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/me", auth, authController.getMe);

module.exports = router;
