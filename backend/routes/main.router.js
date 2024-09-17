const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const commitController = require("../controllers/commitController");
const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", (req, res) => {
  res.send("Welcome!");
});
mainRouter.get("/commitCounts/user/:userId", commitController.getCommitCountsByRepoId);

module.exports = mainRouter;
