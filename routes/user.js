const express = require("express");
const router = express.Router();

const { userById } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.get("/secret/:userId", requireSignin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

// Whenever there is a call to userId, the following middleware will be used
router.param("userId", userById);

module.exports = router;
