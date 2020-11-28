const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const Products = require("../models/products");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  Products.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }
    req.product = product;
    next();
  });
};

exports.read = (req, res) => {
  // We are not sending the photo here to make the output faster. The photo shall be queried seperately
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    //check for all fields
    const { name, description, price, category, quantity, shipping } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    let product = new Products(fields);

    // 1kb = 1000
    // 1mb = 1000000

    // files.photo depends on the way you send it from the front-end
    if (files.photo.size > 1000000) {
      return res.status(400).json({
        error: "Image should be less than 1 MB in size",
      });
    }
    product.photo.data = fs.readFileSync(files.photo.path);
    product.photo.contentType = files.photo.type;

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    //check for all fields
    const { name, description, price, category, quantity, shipping } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    let product = req.product;
    // extend method in lodash to update the item
    product = _.extend(product, fields);

    // 1kb = 1000
    // 1mb = 1000000

    // files.photo depends on the way you send it from the front-end
    if (files.photo.size > 1000000) {
      return res.status(400).json({
        error: "Image should be less than 1 MB in size",
      });
    }
    product.photo.data = fs.readFileSync(files.photo.path);
    product.photo.contentType = files.photo.type;

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Product deleted successfully",
    });
  });
};
