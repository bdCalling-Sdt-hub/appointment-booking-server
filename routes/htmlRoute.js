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


router.get("/html-instruction-guide", async (req, res) => {
    try {
      res.header("Content-Type", "text/html");
      res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instruction Page</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
              background-color: #f9f9f9;
              color: #333;
          }
          header {
              background: #4CAF50;
              color: white;
              padding: 10px 0;
              text-align: center;
          }
          section {
              margin: 20px 0;
          }
          h1, h2 {
              color: #4CAF50;
          }
          ol {
              padding-left: 20px;
          }
          li {
              margin-bottom: 10px;
          }
          .step-image {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
              border: 1px solid #ddd;
          }
          footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9em;
              color: #777;
          }
      </style>
  </head>
  <body>
      <header>
          <h1>Instruction Guide</h1>
      </header>
  
      <section style="margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center;">
          <h2>Step-by-Step Instructions</h2>
          <ol style="list-style-position: inside; padding: 0;">
              <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 1.2rem;">
                  1. After logging in, first route to the Profile screen.
                  <img src="https://i.ibb.co.com/C5zmHhV/4.png" height="500" width="400" alt="Troubleshooting" class="step-image">
              </li>
              <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 1.2rem;">
                  2. Tap on Settings.
                  <img src="https://i.ibb.co.com/MnN9TWg/1.png" height="500" width="400" alt="Settings Screen" class="step-image">
              </li>
              <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 1.2rem;">
                  3. Then tap on Delete.
                  <img src="https://i.ibb.co.com/tLHmN7n/3.png" height="500" width="400" alt="Delete Option" class="step-image">
              </li>
              <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 1.2rem;">
                  4. A pop-up will appear; provide your password in the password field.
                  <img src="https://i.ibb.co.com/vkZ9nGz/6.png" alt="Password Input" height="500" width="400" class="step-image">
              </li>
              <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 1.2rem;">
                  5. Press the Delete button.
                  <img src="https://i.ibb.co.com/k1P4shw/5.png" height="500" width="400" alt="Confirm Delete" class="step-image">
              </li>
          </ol>
      </section>
  
      <footer>
          <p>&copy; 2025 Medroof UC And Spa. All rights reserved.</p>
      </footer>
  </body>
  </html>`);
    } catch (error) {
      console.error("Error generating instruction page:", error);
      res
        .status(500)
        .json({ message: "Internal server error", statusCode: 500 });
    }
  });
  

module.exports = router;
