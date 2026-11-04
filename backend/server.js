const express = require("express");
const app = express();
app.get("/health", (req, res) => {
  res.send("<h1>Healthy! :)</h1>");
});
const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
