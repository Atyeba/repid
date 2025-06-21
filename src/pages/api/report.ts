import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/db";
import { collection, addDoc, Timestamp } from "firebase/firestore";

async function sendMockNotificationToSAPS(data: any) {
  console.log("Mock: Sending notification to SAPS...", data);
  await new Promise((r) => setTimeout(r, 300));
}

async function sendMockNotificationToCreditBureau(data: any) {
  console.log("Mock: Sending notification to Credit Bureau...", data);
  await new Promise((r) => setTimeout(r, 300));
}



function verifyFacePlaceholder(selfieBase64: string): boolean {
  return !!selfieBase64;
}




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });


  
  try {
    const { name, surname, idNumber, reason, dateLost, selfieBase64 } = req.body;

    if (!name || !surname || !idNumber || !reason || !dateLost || !selfieBase64) {
      return res.status(400).json({ error: "Missing required fields" });
    }




    const isFaceVerified = verifyFacePlaceholder(selfieBase64);
    if (!isFaceVerified) {
      return res.status(400).json({ error: "Facial verification failed" });
    }



    const docRef = await addDoc(collection(db, "lostIDs"), {
      name,
      surname,
      idNumber,
      reason,
      dateLost,
      selfieBase64,
      createdAt: Timestamp.now(),
    });



    await Promise.all([
      sendMockNotificationToSAPS({ id: docRef.id, name, surname, idNumber, reason }),
      sendMockNotificationToCreditBureau({ id: docRef.id, name, surname, idNumber, reason }),
    ]);




    return res.status(200).json({ message: "Report submitted successfully" });
  } catch (error: any) {
    console.error("Error submitting report:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
