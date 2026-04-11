const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dijrjv2cc",
  api_key: "459455568212611",
  api_secret: "Nq_J6CcvAPIDc7R_3NbId7PF7KM",
});

async function getImages() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
    });

    result.resources.forEach((img) => {
      console.log(img.secure_url);
    });
  } catch (error) {
    console.error(error);
  }
}

getImages();