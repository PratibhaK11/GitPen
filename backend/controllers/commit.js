const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".GitPen");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    // Generate a new unique commit ID
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);

    // Create the directory for the new commit
    await fs.mkdir(commitDir, { recursive: true });

    // Get the list of files staged for commit
    const files = await fs.readdir(stagedPath);

    // Copy each staged file to the new commit directory
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    // Generate the current time in IST using moment-timezone
    const formattedDate = moment().tz("Asia/Kolkata").format(); // ISO 8601 format with IST

    // Write the commit metadata (message and date) to commit.json
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({
        message,
        date: formattedDate, // Timestamp of the commit in IST
      }, null, 2) // Pretty print JSON
    );

    // Clear the staging area after committing the files
    for (const file of files) {
      await fs.unlink(path.join(stagedPath, file));
    }

    // Log success message with the new commit ID
    console.log(`Commit ${commitID} created with message: "${message}"`);
  } catch (err) {
    console.error("Error committing files:", err);
  }
}

module.exports = { commitRepo };
