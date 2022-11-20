import type { NextApiRequest, NextApiResponse } from "next";
import { Posts } from "../../../components/Posts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const ids = await Posts.getAllPostIds();
      const posts = await Promise.all(ids.map((id) => Posts.getPost(id)));
      return res.status(200).json(posts);
    default:
      return res.status(400).json({ error: "Invalid request" });
  }
}
