// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.info("Revalidating", req.query);
  try {
    await res.revalidate("/posts");
    res.status(200).json({ message: "OK" });
  } catch (err) {
    console.warn("Failed to revalidate", err);
    return res.status(500).json({ message: "Error" });
  }
}
