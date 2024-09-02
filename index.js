import express from "express";
import path from "path";
import getPort from "get-port";
import bodyParser from "body-parser";
import cors from "cors";
import fileURLToPath from "url";

import mainRouter from "./routes/main.js";

(async () => {
  const app = express();
  const port = await getPort({ port: 3000 });
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);

  // To parse data send from clientside
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  app.use("/", mainRouter);

  app.use("/js", express.static(path.join(__dirname, "./js")));
  app.use("/ifc", express.static(path.join(__dirname, "./ifc")));
  app.use("/data", express.static(path.join(__dirname, "./data")));
  app.use("/components", express.static(path.join(__dirname, "./components")));

  app.listen(port, async () => {
    console.log(`Server connected to ${port}`);
  });
})();
