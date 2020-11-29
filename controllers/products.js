const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const Products = require("../models/products");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  Products.findById(id)
    .populate("category")
    .exec((err, product) => {
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

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
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

/*
  top selling and newest arrivals
  Query parameters from the front-end client
  selling = /products?sortBy=sold&orderBy=desc&limit=5
  arrivals = /products?sortBy=createdAt&orderBy=desc&limit=5
  if no params are sent then all products are returned
*/

exports.list = (req, res) => {
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let orderBy = req.query.orderBy ? req.query.orderBy : "asc";
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  console.log(req.query.orderBy, sortBy, limit);

  Products.find()
    .select("-photo")
    .populate("Category")
    .sort([[sortBy, orderBy]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          message: "Products not found",
        });
      }
      res.json(products);
    });
};

/*

It will find the prodcuts based on the requested product's category.
And will return all those products.
 */
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  Products.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          message: "Products not found",
        });
      }
      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  Products.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Products.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
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
