const { body } = require("express-validator");

exports.registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please include a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["farmer", "buyer", "supplier"])
    .withMessage("Invalid role"),
  body("roles")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Choose at least one valid role"),
  body("roles.*")
    .optional()
    .isIn(["farmer", "buyer", "supplier"])
    .withMessage("Invalid role"),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Please include a valid email"),
  body("password").exists().withMessage("Password is required"),
];
