const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("../config/cloudinary");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function getImages() {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "universities",
    max_results: 500,
  });

  result.resources.forEach((img) => {
    console.log(img.secure_url);
  });
}

getImages().catch((error) => {
  console.error("Failed to fetch Cloudinary images:", error.message);
  process.exitCode = 1;
});