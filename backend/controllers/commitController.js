const fs = require("fs").promises;
const path = require("path");

async function getCommitCountsByRepoId(req, res) {
  const repoId = req.params.userId;

  try {
    const repoPath = path.resolve(process.cwd(), ".GitPen", "commits");

    // Read all commit directories
    const commitDirs = await fs.readdir(repoPath);

    const commitCountsByDate = {};

    // Loop through each commit directory and read the commit.json file
    for (const commitDir of commitDirs) {
      const commitFilePath = path.join(repoPath, commitDir, "commit.json");

      // Read commit.json and extract the date
      const commitData = JSON.parse(await fs.readFile(commitFilePath, "utf-8"));
      const commitDate = commitData.date.substring(0, 10); // Extract the date part (yyyy-mm-dd)

      // Count commits per date
      if (commitCountsByDate[commitDate]) {
        commitCountsByDate[commitDate] += 1;
      } else {
        commitCountsByDate[commitDate] = 1;
      }
    }

    // Format the response to match your frontend expectations
    const result = Object.entries(commitCountsByDate).map(([date, count]) => ({
      _id: date, // Use _id to match MongoDB-like structure
      count: count,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching commit counts: ", error);
    res.status(500).json({ error: "Error fetching commit counts" });
  }
}

module.exports = { getCommitCountsByRepoId };
