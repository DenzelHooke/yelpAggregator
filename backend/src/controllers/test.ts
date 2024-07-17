import { Request, Response } from "express";

export function testEndpoint(req: Request, res: Response) {
  res.send("Hello, TEST request received successfully!");
}
