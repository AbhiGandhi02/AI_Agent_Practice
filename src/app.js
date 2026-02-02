const express = require("express");
const agentRoutes = require("./routes/agentRoutes");

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ADA backend running" });
});

app.use("/api", agentRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
