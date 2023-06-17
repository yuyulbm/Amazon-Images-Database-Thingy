const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const fileId = generateUniqueFileId();
    const extension = file.originalname.split(".").pop();
    cb(null, fileId + "." + extension);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increase the file size limit to 50MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG files are allowed."));
    }
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.post("/upload", upload.array("binaryDataArray"), (req, res) => {
  const binaryDataArray = req.body.binaryDataArray;

  if (req.body.password !== "1LOVEorangeBALL$") {
    return res.status(400).json({ error: "Incorrect password!" });
  }

  const fileIds = [];

  binaryDataArray.forEach((stringBinaryData) => {
    const binaryData = Buffer.from(stringBinaryData, "base64");

    const fileId = generateUniqueFileId();

    const directory = "./images";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    const filePath = `${directory}/${fileId}.${req.files[0].originalname.split(".").pop()}`;
    fs.writeFile(filePath, binaryData, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("File upload failed");
      }

      fileIds.push(fileId);

      if (fileIds.length === binaryDataArray.length) {
        res.json({ fileIds });
      }
    });
  });
});

app.get("/image/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const filePath = `./images/${fileId}.${req.files[0].originalname.split(".").pop()}`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }

    const fileExtension = req.files[0].originalname.split(".").pop();
    const contentType = getContentType(fileExtension);
    res.setHeader("Content-Type", contentType);
    res.send(data);
  });
});

function getContentType(fileExtension) {
  switch (fileExtension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

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