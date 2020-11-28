const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { create, read, remove, update } = require("../controllers/products");
const { userById } = require("../controllers/user");
const { productById } = require("../controllers/products");

router.get("/products/:productId", read);
router.post("/products/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete(
  "/products/remove/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);

router.put(
  "/products/update/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
