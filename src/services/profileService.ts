import crypto from "crypto";
import { getProfilesCollection } from "../db/mongoClient";

import { extractIdentifiers } from "../utils/extractIdentifiers";

interface ResumeUploadInput {
  fileName: string;
  fileContent: string; // Assume this is plain text from the resume
}

export const storeProfile = async (input: ResumeUploadInput) => {
  const { fileName, fileContent } = input;

  const identifiers = extractIdentifiers(fileContent);
  const { name, email } = identifiers;

  if (!email || !name) {
    throw new Error("Missing required identifiers from resume");
  }

  const combinedKey = `${name.toLowerCase().trim()}_${email
    .toLowerCase()
    .trim()}`;
  const uniqueId = crypto
    .createHash("sha256")
    .update(combinedKey)
    .digest("hex");

  const doc = {
    resume_file_name: fileName,
    upload_date: new Date(),
    raw_text: fileContent,
    metadata: {
      name,
      email,
    },
  };

  const collection = await getProfilesCollection();

  try {
    await collection.insertOne(doc);
    return { status: "success", id: uniqueId };
  } catch (err: any) {
    if (err.code === 11000) {
      return { status: "exists", id: uniqueId };
    }
    throw err;
  }
};
