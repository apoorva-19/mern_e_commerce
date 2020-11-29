const express = require("express");
const router = express.Router();

const { userById, read, update } = require("../controllers/user");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/secret/:userId", requireSignin, isAuth, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get(
  "/secret_admin/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  (req, res) => {
    res.json({
      user: req.profile,
    });
  }
);

router.get("/user/:userId", requireSignin, isAuth, read);

router.put("/user/update/:userId", requireSignin, isAuth, update);
// Whenever there is a call to userId, the following middleware will be used
router.param("userId", userById);

module.exports = router;
