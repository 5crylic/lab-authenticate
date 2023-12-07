const controller = {};
const User = require("../models").User;

controller.showIndex = (req, res) => {
  res.render("index");
};

controller.showProfile = (req, res) => {
  res.render("my-profile");
};

controller.showLogin = (req, res) => {
  res.render("auth-login", { layout: "auth" });
};

controller.showRegister = (req, res) => {
  res.render("auth-register", { layout: "auth" });
};

controller.register = async (req, res) => {
  let { username, password, firstName, lastName, terms } = req.body;
  if (terms) {
    try {
      await User.create({ username, password, firstName, lastName });
      return res.render("auth-login", {
        layout: "auth",
        message: "You can now login usung yout registration!",
      });
    } catch (error) {
      console.error(error);
      return res.render("auth-register", {
        layout: "auth",
        message: "Can not register new accout",
      });
    }
  }
};

controller.login = async (req, res) => {
  let { username, password, rememberMe } = req.body;
  let user = await User.findOne({
    attributes: [
      "id",
      "username",
      "imagePath",
      "firstName",
      "lastName",
      "isAdmin",
    ],
    where: { username, password },
  });
  if (user) {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : "/";
    req.session.user = user;
    if (rememberMe) {
      res.cookie("username", username, {
        maxAge: 60 * 60 * 1000,
        httpOnly: false,
        signed: true,
      });
      res.cookie("password", password, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        signed: true,
      });
    }
    return res.redirect(reqUrl);
  }

  return res.render("auth-login", {
    layout: "auth",
    message: "Invalid usernam or password!",
  });
};

controller.logout = (req, res, next) => {
  req.session.destroy(function (error) {
    if (error) return next(error);
    res.redirect("/login");
  });
};

controller.isLoggedIn = async (req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }
  res.redirect(`/login?reqUrl=${req.originalUrl}`);
};

module.exports = controller;
