const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (err || !data) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // if key and value are same you can omit the key
    res.json({ data });
  });
};
