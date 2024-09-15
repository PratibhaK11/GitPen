const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const { s3, S3_BUCKET } = require("../config/aws-config");
const { ListObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const streamToString = require("../utils/streamToString");

// Get the S3 prefix from environment variables
const S3_PREFIX = process.env.S3_PREFIX || '';

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created!",
      id: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation: ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  try {
    const repositories = await Repository.find({ owner: userID });

    if (!repositories || repositories.length === 0) {
      return res.status(404).json({ error: "User Repositories not found!" });
    }
    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories: ", err.message);
    res.status(500).send("Server error");
  }
}
const Commit = require("../models/commitModel");

async function getCommitCounts(req, res) {
  try {
    const repoId = req.params.repoId;
    const commitCounts = await Commit.aggregate([
      { $match: { repo: repoId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }  // Sort by date
    ]);
    
    res.json(commitCounts);
  } catch (error) {
    console.error("Error fetching commit counts: ", error);
    res.status(500).send("Server error!");
  }
}



 async function updateRepositoryById (req, res) {
  const repoId = req.params.id;
  const { name, description } = req.body;

  try {
    // Find the repository by ID and update it
    const updatedRepo = await Repository.findByIdAndUpdate(
      repoId,
      { name, description },
      { new: true } // Return the updated document
    );

    if (!updatedRepo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    res.json(updatedRepo);
  } catch (error) {
    console.error('Error updating repository:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility: ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchFilesFromS3(req, res) {
  const { id } = req.params; // Use the repository ID from the request params
  const prefix = `${id}/commits/`; // Construct the prefix using the repository ID

  try {
    // Create a command to list objects with the specified prefix
    const command = new ListObjectsCommand({
      Bucket: S3_BUCKET, // The S3 bucket name
      Prefix: prefix, // The prefix based on repository ID
    });

    // Send the command to S3 to fetch the files
    const data = await s3.send(command);
    console.log("S3 ListObjectsCommand data:", JSON.stringify(data, null, 2));

    // If no files found, return an empty response
    if (!data.Contents || data.Contents.length === 0) {
      console.log("No files found for the repository.");
      return res.json({ files: [], folderStructure: [] });
    }

    // Map the fetched files to include their name, path, and signed URL for access
    const files = await Promise.all(
      data.Contents.map(async (file) => {
        console.log("Processing file:", file.Key);
        // Check if the file is not a directory
        if (!file.Key.endsWith('/')) {
          try {
            const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: file.Key }));
            console.log("Generated URL for file:", file.Key, url);
            return {
              name: file.Key.split('/').pop(), // Extract the file name from the full path
              path: file.Key, // The full path in the bucket
              url // Generate a signed URL for the file
            };
          } catch (urlError) {
            console.error("Error generating signed URL for file:", file.Key, urlError);
            return null;
          }
        }
        return null;
      })
    );

    // Filter out any null values (directories) from the files array
    const filteredFiles = files.filter(file => file !== null);
    console.log("Filtered files:", JSON.stringify(filteredFiles, null, 2));

    // Generate folder structure (optional)
    const folderStructure = getFolderStructure(data.Contents); // Adjust this function if needed
    console.log("Folder structure:", JSON.stringify(folderStructure, null, 2));

    // Send the files and folder structure as the response
    res.json({ files: filteredFiles, folderStructure });
  } catch (err) {
    console.error("Error fetching files from S3: ", err);
    res.status(500).send("Server error");
  }
}

function getFolderStructure(contents) {
  // Create a set to store unique folder paths
  const folders = new Set();

  // Iterate through the S3 objects
  contents.forEach(item => {
    const parts = item.Key.split('/');
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');
        folders.add(folderPath);
      }
    }
  });

  // Convert set to array
  const folderArray = Array.from(folders).map(path => ({
    name: path.split('/').pop(),
    path
  }));

  return folderArray;
}



async function fetchCommits(req, res) {
  const { id } = req.params;

  try {
    const commits = await getCommits(id);
    console.log("Fetched commits data:", commits);
    res.json(Array.isArray(commits) ? commits : []); // Ensure it's an array
  } catch (err) {
    console.error("Error fetching commits: ", err);
    res.status(500).send("Server error while fetching commits");
  }
}

async function getCommits(repoId) {
  // Use the correct prefix format without 's3://'
  const commitPrefix = `${repoId}/commits/`;
  console.log("Commit Prefix:", commitPrefix); // Debugging line to verify the prefix

  const command = new ListObjectsCommand({
    Bucket: S3_BUCKET,
    Prefix: commitPrefix,
  });

  try {
    const data = await s3.send(command);
    console.log("S3 ListObjectsCommand data for commits:", data);

    if (!data.Contents || data.Contents.length === 0) {
      console.log("No commits found for prefix:", commitPrefix);
      return [];
    }

    const commits = await Promise.all(data.Contents.map(async (file) => {
      if (file.Key.endsWith('.json')) {
        console.log("Fetching commit file:", file.Key);
        const getObjectParams = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: file.Key,
        });

        const fileData = await s3.send(getObjectParams);
        const commitContent = await streamToString(fileData.Body);
        console.log("Fetched commit file data:", commitContent);

        try {
          return JSON.parse(commitContent);
        } catch (parseError) {
          console.error("Error parsing commit file data:", parseError);
          return null;
        }
      } else {
        console.log("Skipping non-JSON file:", file.Key);
        return null;
      }
    }));

    // Filter out any null values resulting from skipped or erroneous files
    return commits.filter(commit => commit !== null);
  } catch (err) {
    console.error("Error fetching commits from S3:", err);
    throw new Error("Unable to fetch commits");
  }
}






module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  fetchFilesFromS3,
  fetchCommits,
  getCommitCounts
};
