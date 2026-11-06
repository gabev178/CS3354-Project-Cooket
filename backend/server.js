import express from "express";
import webscrapeRouter from "./routes/webscrape.js";

const app = express();
app.get("/health", (req, res) => {
  res.send("<h1>Healthy! :)</h1>");
});
app.use("/api/webscrape", webscrapeRouter);
const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
