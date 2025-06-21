import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  
  if (req.method !== "POST") {
 
 
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idNumber, reason } = req.body;

  





  console.log(`Notify SAPS and Credit Bureaus about lost ID: ${idNumber}, Reason: ${reason}`);

  
  
  await new Promise((r) => setTimeout(r, 1000));

 
 
  return res.status(200).json({ message: "Notifications sent (mock)" });
}


