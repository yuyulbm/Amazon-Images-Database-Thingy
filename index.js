const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.post("/upload", (req, res) => {
  const binaryDataArray = req.body.binaryDataArray;

  if (req.body.password !== "1LOVEorangeBALL$")
    return res.status(400).json({ error: `Incorrect password!` });

  // Store the generated file IDs
  const fileIds = [];

  // Process each string binary data in the array
  binaryDataArray.forEach((stringBinaryData) => {
    const binaryData = Buffer.from(stringBinaryData, "base64");

    // Generate a unique file ID
    const fileId = generateUniqueFileId();

    // Create the /images directory if it doesn't exist
    const directory = "./images";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    // Upload the binary data to the /images folder with the unique file ID
    const filePath = `${directory}/${fileId}.jpg`;
    fs.writeFile(filePath, binaryData, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("File upload failed");
      }

      // Save the file ID for reference
      fileIds.push(fileId);

      // Check if all files have been processed
      if (fileIds.length === binaryDataArray.length) {
        res.json({ fileIds });
      }
    });
  });
});

app.get("/image/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const filePath = `./images/${fileId}.jpg`;

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Read the file and send it in the response
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(data);
  });
});

app.listen(process.env.PORT || 80, () => {
  console.log("CDN Server Started");
});

console.log(__dirname);

function generateUniqueFileId() {
  let fileId;
  let isUnique = false;

  // Keep generating a new file ID until a unique one is found
  while (!isUnique) {
    // Generate a 10-digit random number
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    fileId = randomNumber.toString();

    // Check if a file with the same ID already exists
    const filePath = `/images/${fileId}.jpg`;
    if (!fs.existsSync(filePath)) {
      // File ID is unique
      isUnique = true;
    }
  }

  return fileId;
}

process.on("unhandledRejection", (reason, p) => {
  console.log(" [antiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [antiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});