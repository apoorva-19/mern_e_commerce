const mongoose = require("mongoose");

// crypto is for hashing passwords
const crypto = require("crypto");

// With the introduction of pkg.exports a module only exports the paths explicitly listed in pkg.exports,
// any other path can no longer be required. Hence the statement mentioned below would work in Node 12.16.3 and lower version
// but throws an error 'Package subpath './dist/v1' is not defined by "exports"' in the above version such as Node 14.15.0.
// const uuidv1 = require("uuid/dist/v1");
// Hence the following statement should be used instead.
const { v1: uuidv1 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: {
      type: String,
    },
    role: {
      //   There are going to more than one users - admin, customer
      type: Number,
      default: 0, //customer is 0 by default, admin is 1
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

//virtual field

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
