import app from "./app";
import dotenv from "dotenv";
import { bootstrapWatchers } from "./services/bootstrapWatchers";
dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bootstrapWatchers();
});