const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios");
const crypto = require("crypto");

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const accessKey = process.env.ACCESS_KEY;

const randomImageName = (bytes) => crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

app.get("/", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.post("/upload", (req, res) => {
  const binaryDataArray = req.body.binaryDataArray;

  if (req.body.password !== "1LOVEorangeBALL$")
    return res.status(400).json({ error: `Incorrect password!` });

  // Store the generated file IDs
  const fileIds = [];

  // Process each string binary data in the array
  binaryDataArray.forEach(async (stringBinaryData) => {
    try {
      const binaryData = Buffer.from(stringBinaryData, "base64");
      // Generate a unique file ID

      const imageName = randomImageName(10);

      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: binaryData,
        ContentType: "image/png",
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      // Save the file ID for reference
      fileIds.push(imageName);

      // Check if all files have been processed
      if (fileIds.length === binaryDataArray.length) {
        return res.json({ fileIds });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("File upload failed");
    }
  });
});

app.get("/image/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const params = {
      Bucket: bucketName,
      Key: fileId,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    // Fetch the image data from the URL
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Set the appropriate Content-Type header for the image
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Send the image data as the response
    res.send(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to retrieve the image");
  }
});

app.listen(process.env.PORT || 80, () => {
  console.log("CDN Server Started");
});

console.log(__dirname);

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
