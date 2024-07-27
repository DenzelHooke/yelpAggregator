import { Request, Response } from "express";
import { Client } from "@notionhq/client"

async function addToDatabaseTEST(databaseId: string, username: string, name: string, status: boolean, date: any) {
  const notion_api_key = process.env.NOTION_API_KEY
  const notion = new Client({auth: notion_api_key})


  if(!notion || !databaseId) {
    throw new Error("Must include notion class and database ID")
  }
  

  try {
      const response = await notion.pages.create({
        parent: {
            database_id: databaseId
        },
        properties: {
          'ID': {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: username
                }
              }
            ]
          },
          'Name': {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: name
                }
              }
            ]
          },
          // 'Status': {
          //   type: 'status',
          //   status: {
          //     id: status ? "tc%3Ei": "NOt ",
          //     description: "Test description"
          //   }
          // },
          'Date': { // Date is formatted as YYYY-MM-DD or null
            type: 'date',
            date: date
          }
        }
        })

      console.log(response);
  } catch (error) {
      console.error(error);
  }
}





export function testEndpoint(req: Request, res: Response) {
  res.send("Hello, TEST request received successfully!");
}


export async function notionGetTest(req: Request, res: Response) {
  const databaseId = process.env.NOTION_DATABASE_ID
  

  if(!databaseId) {
    throw new Error("MUST HAVE VALID DATABASE ID!")
  }

  // await addToDatabase(databaseId, "John Doe", "Denzel Hooke", true, null)

  return res  
}

