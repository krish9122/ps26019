import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]); // Use Google and Cloudflare DNS servers for reliable resolution
const port = process.env.PORT || 5000;

// Connect to MongoDB before accepting incoming HTTP requests
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
