const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");
const issueRouter = require("./routes/issue.router");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");
const Repository = require("./models/repoModel");
const { loginRepo } = require('./controllers/loginRepo');
dotenv.config();

yargs(hideBin(process.argv))
  .command("start", "Starts a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command(
    "push <repoId>",
    "Push commits to S3 for the specified repository",
    (yargs) => {
      yargs.positional("repoId", {
        describe: "Repository ID to push commits to",
        type: "string",
      });
    },
    async (argv) => {
      try {
        await pushRepo(argv.repoId);
      } catch (error) {
        console.error("Error during push:", error.message);
      }
    }
  )
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .command(
    "login <email> <password>",
    "Log in with email and password",
    (yargs) => {
      yargs
        .positional("email", {
          describe: "Email address",
          type: "string",
        })
        .positional("password", {
          describe: "Password",
          type: "string",
        });
    },
    async (argv) => {
      try {
        await loginRepo(argv.email, argv.password);
      } catch (error) {
        console.error("Error logging in:", error.message);
      }
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;


function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;

  app.use(bodyParser.json());
  app.use(express.json());

  const mongoURI = process.env.MONGODB_URI;

  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect : ", err));

  app.use(cors({ origin: "*" }));

  app.use("/", mainRouter);
  //app.use("/", issueRouter);
// Example Express.js route
app.get('/repo/byOwner/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;
  try {
    // Fetch repository based on owner from the database
    const repository = await Repository.findOne({ owner: ownerId });
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json(repository);
  } catch (err) {
    res.status(500).json({ error: "Error fetching repository by owner ID" });
  }
});

  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("=====");
      console.log(user);
      console.log("=====");
      socket.join(userID);
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called");
    // CRUD operations
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}
