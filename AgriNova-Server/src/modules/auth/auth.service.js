const jwt = require("jsonwebtoken");
const User = require("../../database/models/User");
const { getFirebaseAuth } = require("../../config/firebaseAdmin");

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Helper to format user response with both role and roles
const formatUserResponse = (user, token) => {
  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : [user.role || "farmer"];

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || roles[0],
      roles: roles,
      phone: user.phone || "",
      address: user.address || "",
      profileImage: user.profileImage || ""
    }
  };
};

exports.register = async (userData) => {
  const { name, email, password, role, phone, roles } = userData;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const allowedRegistrationRoles = new Set(["farmer", "buyer", "supplier"]);
  const requestedRoles = Array.isArray(roles) ? roles : [role || "farmer"];
  const userRoles = [...new Set(requestedRoles)];

  if (
    !normalizedEmail ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    throw httpError("Name, valid email, and a password of at least 6 characters are required", 400);
  }
  if (
    userRoles.length === 0 ||
    userRoles.some((requestedRole) => !allowedRegistrationRoles.has(requestedRole)) ||
    (role && !allowedRegistrationRoles.has(role))
  ) {
    throw httpError("Registration role is invalid", 400);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw httpError("User already exists", 409);
  }

  const primaryRole = role && userRoles.includes(role) ? role : userRoles[0];

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: primaryRole,
    roles: userRoles,
    phone,
  });

  const token = generateToken(user._id);

  return formatUserResponse(user, token);
};

exports.login = async (email, password) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw httpError("Invalid credentials", 401);
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw httpError("Invalid credentials", 401);
  }

  const token = generateToken(user._id);

  return formatUserResponse(user, token);
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw httpError("User not found", 404);
  }
  const token = generateToken(user._id);
  return formatUserResponse(user, token);
};

exports.socialAuth = async ({ idToken, roles }) => {
  if (typeof idToken !== "string" || !idToken) {
    throw httpError("A Firebase ID token is required", 400);
  }

  let identity;
  try {
    identity = await getFirebaseAuth().verifyIdToken(idToken, true);
  } catch (error) {
    if (error.statusCode === 503) throw error;
    throw httpError("Invalid or expired social authentication token", 401);
  }

  const firebaseUid = identity.uid;
  const email = identity.email?.trim().toLowerCase();
  if (!firebaseUid || !email) {
    throw httpError("The social account must provide a verified email address", 401);
  }

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    // Only a verified Firebase email may link a provider login to an existing
    // password account. An unverified email must never claim another account.
    if (identity.email_verified !== true) {
      throw httpError("Verify your email with the identity provider before signing in", 401);
    }
    user = await User.findOne({ email });
  }

  if (!user) {
    const allowedRegistrationRoles = new Set(["farmer", "buyer", "supplier"]);
    const accountRoles = Array.isArray(roles) && roles.length > 0 ? [...new Set(roles)] : ["farmer"];
    if (accountRoles.some((role) => !allowedRegistrationRoles.has(role))) {
      throw httpError("Registration role is invalid", 400);
    }

    const bcrypt = require("bcryptjs");
    user = await User.create({
      name: identity.name || email.split("@")[0],
      email,
      role: accountRoles[0],
      roles: accountRoles,
      phone: "",
      profileImage: identity.picture || "",
      firebaseUid,
      password: await bcrypt.hash(`${require("node:crypto").randomUUID()}Aa1!`, 10),
    });
  } else {
    if (!user.firebaseUid) user.firebaseUid = firebaseUid;
    if (identity.picture && !user.profileImage) user.profileImage = identity.picture;
    await user.save();
  }

  const token = generateToken(user._id);
  return formatUserResponse(user, token);
};
