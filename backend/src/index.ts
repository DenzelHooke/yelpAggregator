import express, { Express, Request, Response } from "express";
import cors from "cors";
import apiV1 from "./routes/apiV1.js";
import dotenv from "dotenv"
import path, {dirname} from "path" 
import { fileURLToPath } from "url"

// Convert file:: url to proper absolute filesystem url structure 
const __filename = fileURLToPath(import.meta.url)

// Convert absolute file url to proper url. removes /index.js and just returns current working dir where file is located
const __dirname = dirname(__filename)

// Resolves path to /dir/backend/.env
const envResolvedPath = path.resolve(__dirname, '../../.env')

dotenv.config({ path: envResolvedPath})

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
