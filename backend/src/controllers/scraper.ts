import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Scrape from "../classes/scraperClasses.js";
// import { addToDatabase } from "../classes/notion.js";
import { sleep } from "../helpers.js";
import { addToDatabase } from "../classes/notion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface scrapedElement {
  company: string | undefined;
  href: string | undefined;
  phone: string | undefined;
}

interface scrapeRequestBody {
  location: string;
  description: string;
  isProxy: boolean;
}

// https://www.yelp.com/search?find_desc=landscaping+services&find_loc=surrey

export async function scrapePage(req: Request, res: Response) {
  if (!req.body) {
    res.status(400).send("ERROR: MUST INCLUDE REQUEST BODY");
  }

  const bodyData: scrapeRequestBody = req.body;

  const scraper = new Scrape(bodyData);

  const companyNames: Array<scrapedElement> = [];
  const scrapeLimit = 10;

  let i = 0;
  while (i <= scrapeLimit) {
    console.log(
      "Scraping set " + i.toString() + `/${scrapeLimit} results, please wait...`
    );
    const names = await scraper.scrapePage(i);

    if (!names) {
      res.status(400).send("Scraper faced an error in scraping page process");
      return false;
    }
    // Iterate over array of scrapedElen
    companyNames.push(...names);

    i += 10;
  }

  console.log(`Found ${companyNames.length} results`);

  const jsonNames = JSON.stringify(companyNames);

  fs.writeFile("companyNames.json", jsonNames, (err) => {
    try {
      console.log("File created successfully!");

      // Read newly created file
      fs.readFile(
        path.resolve(__dirname, "../../../companyNames.json"),
        "utf-8",
        async (err, data) => {
          if (err) {
            throw err;
          }

          console.log("Adding to notion db");

          // Parse file into usable json object
          const jsonObject = JSON.parse(data);

          // Loop over each item in json object
          // jsonObject.forEach(async (item: any) => {
          //   // await sleep(500)
          //   // Creates a row with json item
          //   const notionRes = await addToDatabase(
          //     process.env.NOTION_DATABASE_ID as string,
          //     item.company as string,
          //     "",
          //     item.phone as string,
          //     item.href as string
          //   );
          // });
        }
      );
    } catch (error) {
      // throw err;
    }
  });

  res.send("Please check server console for output location!");
}
