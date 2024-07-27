import express, { Request, Response } from "express";
import { testEndpoint, notionGetTest } from "../controllers/test.js";
import { scrapePage } from "../controllers/scraper.js";
const router = express.Router();

router.get("/test", testEndpoint);
router.get("/", (req: Request, res: Response) => {
  res.send("ApiV1 index!");
});

router.post("/scrape", scrapePage);

router.get("/notionTestGet", notionGetTest )

export default router;
