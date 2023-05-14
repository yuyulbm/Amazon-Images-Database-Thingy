const express = require('express');

const multer = require('multer');

const path = require('path');

const app = express();

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'images/'); // Set the destination folder to "images/"

  },

  filename: function (req, file, cb) {

    // Generate a unique filename for the uploaded image (e.g., using the 10-character ID)

    const uniqueFilename = generateUniqueFilename(file.originalname);

    cb(null, uniqueFilename);

  }

});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {

  res.send('Image uploaded successfully!');

});

app.listen(3000, () => {

  console.log('CDN server is listening on port 3000');

});

const express = require('express');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const app = express();

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'images/'); // Set the destination folder to "images/"

  },

  filename: function (req, file, cb) {

    const uniqueFilename = generateUniqueFilename(file.originalname, 10);

    cb(null, uniqueFilename);

  }

});

const upload = multer({ storage: storage });

function generateUniqueFilename(originalname, length) {

  const fileExtension = path.extname(originalname);

  let uniqueName;

  let isTaken = true;

  // Loop until a unique ID is generated

  while (isTaken) {

    uniqueName = generateRandomNumber(length) + fileExtension;

    isTaken = isFilenameTaken(uniqueName);

  }

  return uniqueName;

}

function generateRandomNumber(length) {

  const min = Math.pow(10, length - 1);

  const max = Math.pow(10, length) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;

}

function isFilenameTaken(filename) {

  const imagesDir = path.join(__dirname, 'images');

  const files = fs.readdirSync(imagesDir);

  return files.includes(filename);

}

app.post('/upload', upload.single('image'), (req, res) => {

  res.send('Image uploaded successfully!');

});

app.listen(3000, () => {

  console.log('CDN server is listening on port 3000');

});
