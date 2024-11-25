const express = require("express");
const privacyPolicyModel = require("../models/privacyPolicy.model");
const router = express.Router();

router.get("/html-privacy-policy", async (req, res) => {
  try {
    const privacyPolicy = await privacyPolicyModel.findOne({});
    console.log("aiman", privacyPolicy);
    res.header("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 30px auto;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1{
            color: #444;
        }
        footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${"Privacy Policy"}</h1>
        ${privacyPolicy?.content}
    </div>
</body>
</html>`);
  } catch (error) {
    res
      .status(500)
      .json(Response({ message: "Internal server error", statusCode: 500 }));
  }
});

module.exports = router;
