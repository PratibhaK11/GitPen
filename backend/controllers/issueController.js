const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
  const { title, description, repoId } = req.body;

  try {
    if (!title || !description || !repoId) {
      return res.status(400).json({ error: "Title, description, and repository ID are required!" });
    }

    // Create and save the new issue
    const newIssue = new Issue({
      title,
      description,
      repository: repoId
    });

    const savedIssue = await newIssue.save();

    // Update the repository to include the new issue
    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.issues.push(savedIssue._id);
    await repository.save();

    res.status(201).json({
      message: "Issue created successfully!",
      issue: savedIssue
    });
  } catch (err) {
    console.error("Error creating issue: ", err.message);
    res.status(500).send("Server error");
  }
}



async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;

  console.log(`Updating issue with ID: ${id}`);  // Log the issue ID
  console.log(`New data: ${JSON.stringify({ title, description, status })}`);  // Log the new data

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      console.error("Issue not found!");  // Log issue not found
      return res.status(404).json({ error: "Issue not found!" });
    }

    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();

    res.json({ message: "Issue updated", issue });
  } catch (err) {
    console.error("Error updating issue: ", err.message);  // Log error
    res.status(500).send("Server error");
  }
}
async function deleteIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion : ", err.message);
    res.status(500).send("Server error");
  }
}



async function getAllIssues(req, res) {
  const repoId = req.params.repoId;

  console.log(`Fetching issues for repository ID: ${repoId}`);  // Log the repoId

  if (!repoId) {
    console.error("Repository ID is missing in the request parameters.");
    return res.status(400).json({ error: "Repository ID is required!" });
  }

  try {
    // Convert repoId to ObjectId correctly
    const mongooseId = new mongoose.Types.ObjectId(repoId);
    console.log(`Converted repoId to ObjectId: ${mongooseId}`);  // Log conversion

    const issues = await Issue.find({ repository: mongooseId });

    if (!issues || issues.length === 0) {
      console.log(`No issues found for repository ID: ${repoId}`);  // Log no issues
      return res.status(404).json({ error: "No issues found for this repository!" });
    }

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching: ", err.message);  // Log error
    res.status(500).send("Server error");
  }
}






async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
