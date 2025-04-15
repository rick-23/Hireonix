import { MongoClient, Db, Collection } from "mongodb";

let db: Db;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  console.log("MongoDB connected");
  return db;
};

export const getProfilesCollection = async (): Promise<Collection> => {
  const database = await connectToDatabase();
  return database.collection("Profiles");
};
