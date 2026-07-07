import fs from "fs";
import path from "path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { env } from "./config/env";
import { corsMiddleware } from "./middleware/cors";
import { requestLogger } from "./middleware/requestLogger";
import { requireDocsAuth } from "./middleware/docsAuth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

const openapiDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, "..", "docs", "openapi.yaml"), "utf8"),
);
app.use(
  "/api/docs",
  requireDocsAuth,
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument),
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
