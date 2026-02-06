const mongoose = require("mongoose");
require("dotenv").config({path: "../../frontend/.env"}); // Try to load env but might fail due to path

// Hardcode mongo URI if needed, or assume default localhost
const MONGO_URI =
  "mongodb://ocrobet:rbsolutions1122@ac-v00lw4i-shard-00-00.soheiru.mongodb.net:27017,ac-v00lw4i-shard-00-01.soheiru.mongodb.net:27017,ac-v00lw4i-shard-00-02.soheiru.mongodb.net:27017/?replicaSet=atlas-nehuuv-shard-0&ssl=true&authSource=admin";

const questionSchema = new mongoose.Schema({
  title: String,
  contract_question_id: Number,
  status: String,
});

const Question = mongoose.model("Question", questionSchema);

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const questions = await Question.find({});
    console.log(`Found ${questions.length} questions:`);

    questions.forEach((q) => {
      console.log(
        `- ID: ${q._id}, ContractID: ${q.contract_question_id}, Title: "${q.title}", Status: ${q.status}`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
