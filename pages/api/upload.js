import { v2 as cloudinary } from "cloudinary";

import multiparty from "multiparty";

export default async function handler(req, res) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
  });

  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  let ImageUrls = [];
  const Images = files.file;
  for (const image of Images) {
    const fileNameExtention = image.originalFilename.split(".");
    const fileName = fileNameExtention[0];

    const newFilename = fileName + "-" + Date.now();
    await cloudinary.uploader.upload(
      image.path,
      { public_id: newFilename },
      function (error, result) {
        ImageUrls.push({ name: result.public_id, link: result.url });
      }
    );
  }

  return res.status(200).json({ images: ImageUrls });
}

//prevents the parsing of files to json
export const config = { api: { bodyParser: false } };
