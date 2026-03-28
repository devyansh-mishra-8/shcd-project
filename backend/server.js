require("dotenv").config();

const app = require("./app");

const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
