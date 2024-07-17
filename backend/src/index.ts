import express, { Express, Request, Response } from "express";
import cors from "cors";
import apiV1 from "./routes/apiV1.js";
require("dotenv").config({ path: "../../.env" });

const port = 8000;
const orgins = ["localhost:3000"];
const app: Express = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200);
  res.send("Hello, connection received!");
});

app.use("/apiV1", apiV1);

const server = app.listen(port, "", () => {
  console.log("Running on port ", port);
});
