import { Client } from "@notionhq/client"




export default class NotionClient {
  constructor() {}
}


export async function addToDatabase(databaseId: string, company:string, location:string, phone:string, href:string) {

const notion_api_key = process.env.NOTION_API_KEY
const notion = new Client({auth: notion_api_key})

  try {
    const notionRes = notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        'Company': {
          type: "title",
          title: [
            {
              type: 'text',
              text: {
                content: company ? company : ""
              }
            }
          ]
        },
        'Phone': {  
          type: "phone_number",
          phone_number: phone ? phone : null
        },
        'URL': {
          type: 'url',
          url: href ? href : ""
        },
        'Status': {
        "select": {
          name: "NOT CALLED",
          color: "red"
        }
        }
      }
    })

    return notionRes
    
  } catch (error) {
    console.log(error)
  }
 
  
  
}