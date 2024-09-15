const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function loginRepo(email, password) {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/login`, {
      email,
      password,
    });
    console.log("Logged in successfully!");
    console.log("Token:", response.data.token);
    console.log("User ID:", response.data.userId);

    // Save the token to a file
    const tokenFilePath = path.resolve(__dirname, 'auth_token.txt');
    fs.writeFileSync(tokenFilePath, response.data.token, 'utf8');
  } catch (error) {
    console.error("Login failed:", error.response ? error.response.data : error.message);
  }
}

module.exports = { loginRepo };
