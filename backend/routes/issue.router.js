const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

// Ensure create route is above any route that uses :id
issueRouter.post("/issue/create", issueController.createIssue);  // This should come first

issueRouter.put("/issue/update/:id", issueController.updateIssueById);  // Use :id for updating a specific issue
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);  // Use :id for deleting a specific issue
issueRouter.get("/issue/all/:repoId", issueController.getAllIssues);  // Fetch all issues by repository ID
issueRouter.get("/issue/:id", issueController.getIssueById);  // Fetch a specific issue by its ID

module.exports = issueRouter;
