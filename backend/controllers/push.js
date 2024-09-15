const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo(repoId) {
  const tokenFilePath = path.resolve(__dirname, '../controllers/auth_token.txt'); // Adjust path as needed
  
  try {
    // Check if authentication token exists
    await fs.access(tokenFilePath); // Check if the file exists
    
    // Optionally read the token and validate if needed
    const token = await fs.readFile(tokenFilePath, 'utf8');
    
    if (!token) {
      throw new Error("User not authenticated. Please log in first.");
    }

    // Proceed with pushing to S3
    const repoPath = path.resolve(process.cwd(), ".GitPen");
    const commitsPath = path.join(repoPath, "commits");

    const commitDirs = await fs.readdir(commitsPath);
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `${repoId}/commits/${commitDir}/${file}`, // Include repoId in the key
          Body: fileContent,
        };
        
        const command = new PutObjectCommand(params);
        await s3.send(command);
      }
    }

    console.log(`All commits pushed to S3 for repository ID ${repoId}.`);
  } catch (err) {
    console.error("Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };
