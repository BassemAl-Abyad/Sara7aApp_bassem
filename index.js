import express from "express";
import logger from "./src/Utils/logger.utils.js";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";

const app = express();
await bootstrap(app, express);

app.listen(PORT, () => {
  logger.server(PORT);
});
