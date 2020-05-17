const express = require("express");
const router = express.Router();
const path = require("path");
const Brand = require("../models/brand");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("image");

router.post("/upload", (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.file;
  // console.log();
  // return;
  file.mv(path.join(__dirname, "../", "uploads", file.name), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

router.post("/add", (req, res) => {
  Brand.create({ name: req.body.name, image: req.body.image })
    .then((brand) => {
      res.json({ success: true, brand });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, err });
    });
});

router.get("/allBrands", (req, res) => {
  Brand.find({})
    .then((brands) => {
      res.json({ success: true, brands });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, err });
    });
});

router.post("/edit/brandimage", (req, res) => {
  return;
});

router.post("/delete", (req, res) => {
  Brand.findByIdAndDelete(req.body.brandID)
    .then((brands) => {
      res.json({ success: true, brands });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

module.exports = router;
