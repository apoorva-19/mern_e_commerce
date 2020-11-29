const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const {
  productById,
  create,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
} = require("../controllers/products");
const { userById } = require("../controllers/user");

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

router.get("/products", list);

router.get("/products/related/:productId", listRelated);

router.post("/products/categories", listCategories);

router.post("/products/by/search", listBySearch);

router.get("/products/photo/:productId", photo);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
