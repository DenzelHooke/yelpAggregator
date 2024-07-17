import { Request, Response } from "express";
import fs from "fs";
import Scrape from "../classes/scraperClasses.js";

interface scrapedElement {
  company: string | undefined;
  href: string | undefined;
  phone: string | undefined;
}

interface scrapeRequestBody {
  location: string;
  description: string;
}

// https://www.yelp.com/search?find_desc=landscaping+services&find_loc=surrey

export async function scrapePage(req: Request, res: Response) {
  //! THROW ERR IF NO BODY DATA OR SITE]
  const bodyData: scrapeRequestBody = req.body;
  const scraper = new Scrape(bodyData);

  const companyNames: Array<scrapedElement> = [];
  const scrapeLimit = 100;

  let i = 0;
  while (i <= scrapeLimit) {
    console.log(
      "Scraping set " + i.toString() + `/${scrapeLimit} results, please wait...`
    );
    const names = await scraper.scrapePage(i);

    if (names) {
      // Iterate over array of scrapedElen
      companyNames.push(...names);
    }

    i += 10;
  }

  console.log(`Found ${companyNames.length} results`);
  const jsonNames = JSON.stringify(companyNames);

  fs.writeFile("companyNames.json", jsonNames, (err) => {
    try {
      console.log("File created successfully!");
    } catch (error) {
      throw err;
    }
  });

  res.send("Please check server console for output location!");
}
