const express = require("express");
const repoController = require("../controllers/repoController");
const multer = require('multer'); // Import multer for file uploads
const upload = multer(); // Create multer instance with default settings

const repoRouter = express.Router();

// Existing routes
repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
repoRouter.get("/commitCounts/:repoId", repoController.getCommitCounts);
repoRouter.get("/repo/files/:id", repoController.fetchFilesFromS3);
repoRouter.get("/repo/commits/:id", repoController.fetchCommits);


module.exports = repoRouter;
