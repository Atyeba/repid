

import { NextApiRequest, NextApiResponse } from 'next';


const validIds = [
  '8001015009087', 
  '7504230124086', 
  '9206150827081', 
  '6709123451083', 
  '8002246789085', 
  '9201012345087', 
  '7307069871084', 
  '8512153456080', 
  '9003280125089', 
  '7705041234082', 
];


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { idNumber } = req.body;

    if (!idNumber) {
      return res.status(400).json({ error: 'ID number is required' });
    }

    const exists = validIds.includes(idNumber);
    return res.status(200).json({ exists });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
