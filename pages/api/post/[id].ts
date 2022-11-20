import type { NextApiRequest, NextApiResponse } from "next";
import { Posts } from "../../../components/Posts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const id = req.query.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid request" });
      }
      const post = await Posts.getPost(id);
      return res.status(200).json(post);
    default:
      return res.status(400).json({ error: "Invalid request" });
  }
}
