const https = require("https");
const fs = require("fs");
const path = require("path");

const download = (url, route) => {
  const filename = path.basename(url);

  if (fs.existsSync(`${route}`)) {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(`${route}/${filename}`);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
      });
    });
  } else {
    fs.mkdir(`${route}`, (err) => {
      if (err) console.log(err);
    });
  }
  https.get(url, (res) => {
    const fileStream = fs.createWriteStream(`${route}/${filename}`);
    res.pipe(fileStream);
    fileStream.on("finish", () => {
      fileStream.close();
    });
  });
};

module.exports.download = download;
