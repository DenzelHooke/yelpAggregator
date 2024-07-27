import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import { getRandomArbitrary, sleep } from "../helpers.js";
import { HttpsProxyAgent } from "https-proxy-agent";

const reMatch = /\(*\d\d\d\)*(-| )+\d\d\d*(-| )\d\d\d\d/g;

interface scrapedElement {
  company: string | undefined;
  href: string | undefined;
  phone: string | undefined;
}

interface ScrapeInit {
  location: string;
  description: string;
  isProxy: boolean
}


class ProxyManager {
  private proxies: string[]

  constructor() {
    this.proxies = []
  }

  async fetchProxies(isProxy: boolean) {

    if(!isProxy) {
      return []
    }

    const proxyRes: {
      data: string
    } = await axios.get("https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=protocolipport&format=text")
    
    this.proxies = proxyRes.data.split('\r').toString().split('\n').toString().split(',').filter(string => string.length > 0 && string.includes('http'))

    return this.proxies   
  }
}


class HttpManager {
  private url: string;
  private userAgents: string[]
  
  constructor(url: string) {
    this.url = url
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
      "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
      "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
      "Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
      "Mozilla/5.0 (PlayStation 4 3.11) AppleWebKit/537.73 (KHTML, like Gecko)",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36 Edge/20.02",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; XBOX_ONE_ED) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
      "Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1",
    ];
  }
  
  async fetchUrl(proxies: string[]): Promise<AxiosResponse> {

    return await axios.get(this.url, {
      headers: {
        "User-Agent":
          this.userAgents[getRandomArbitrary(0, this.userAgents.length - 1)],
      },
      // Determines whether proxy status is enabled or not
      httpsAgent: proxies.length == 0 ? false : new HttpsProxyAgent(proxies[getRandomArbitrary(0, proxies.length)])}) 
  }
}

export default class Scrape {
  description: string;
  location: string;
  isProxy: boolean
  scrapedData: scrapedElement[];

  constructor({ location, description, isProxy }: ScrapeInit) {
    this.description = description;
    this.location = location;
    console.log(isProxy)
    this.isProxy = !isProxy || isProxy === undefined ? false : isProxy
    console.log(this.isProxy)
    this.scrapedData = [];
  }
  
  async getPage(url: string, slow: boolean): Promise<cheerio.Root | false> {
    try {
      console.log("Getting page: ", url);

      const retryLimit = 9999
      let retries = 0
      let res;

      while (retries <= retryLimit) {

        if (slow) {
          await sleep(getRandomArbitrary(1500, 3000));
        } else {
          await sleep(getRandomArbitrary(500, 800));
        }

        try {
          console.log("Getting url")
          
          // This.isProxy is a state that determines whether or not proxies should be used/collected
          const proxies = await new ProxyManager().fetchProxies(this.isProxy)
          res = await new HttpManager(url).fetchUrl(proxies)

          break 

        } catch (error) {
          console.log("Request failed. Retrying")
          retries += 1 
          console.log(error)
        }
      }  

      if(retries === retryLimit) {
        return false
      }
      

      if(!res) {
        return false
      }

      // Return cheerio object that's ready to scrape
      return cheerio.load(res.data);
    } catch (error) {
      console.log("Error while getting page");
      throw error;
    }
  }

  async scrapePage(
    pageCount: number
  ): Promise<Array<scrapedElement> | undefined | false> {
    // Build string with custom parameters
    const yelpParamString = `https://www.yelp.com/search?find_desc=${
      this.description
    }&find_loc=${this.location}&start=${pageCount.toString()}`;

    // Make request to website

    const cheerio = await this.getPage(yelpParamString, false)


    if(!cheerio) {
      return false
    }
    
    const $: cheerio.Root = cheerio;

    const main = $('main[id="main-content"]');

    const ul = main.find("ul");

    const listItems = ul
      .find("li")
      .find('div[class^="businessName"]')
      .find("a");

    // const slicedLiItems = $(listItems.toArray().slice(12, -1));

    for (let i = 0; i < listItems.length; i++) {
      const dataObject: scrapedElement = {
        company: "",
        href: "",
        phone: "",
      };

      const element = listItems[i];

      dataObject.company = $(element).text();
      dataObject.href = $(element).attr("href");

      console.log(listItems.text());
      // Scrape inner page for phone
      // Returns cheerio object based off href link that's readily available to scrape

      if (!dataObject.href) {
        console.log("No HREF, passing!");
        return;
      }

      try {
        const $inner = await this.getPage(
          "https://www.yelp.com" + dataObject.href,
          true
        );

        if(!$inner) {
          console.log("Not inner data. Returning false")
          return false
        }

        const sidebarContent = $inner("div[data-testid='sidebar-content']");

        console.log(sidebarContent);
        if (sidebarContent.length) {
          console.log("Found sidebar content");
          const cookBookIsland = sidebarContent.find(
            "div[data-testid='cookbook-island']"
          );

          if (cookBookIsland) {
            console.log("Found cookbook island");

            const pElements = cookBookIsland.find("p");

            for (let i = 0; i < pElements.length; i++) {
              const foundMatch = reMatch.exec($inner(pElements[i]).text());

              if (foundMatch?.length) {
                console.log("Found phone match!");
                dataObject.phone = foundMatch[0];
              }
            }
          }
        }

        this.scrapedData.push(dataObject);
      } catch (error) {
        this.scrapedData.push(dataObject);
        console.log("FOR LOOP ERROR: ", error);
      }
    }

    return this.scrapedData;
  }
}
