const mongoose = require("mongoose");

// Remote DB URI
const MONGO_URI = "mongodb://ocrobet:rbsolutions1122@ac-v00lw4i-shard-00-00.soheiru.mongodb.net:27017,ac-v00lw4i-shard-00-01.soheiru.mongodb.net:27017,ac-v00lw4i-shard-00-02.soheiru.mongodb.net:27017/?replicaSet=atlas-nehuuv-shard-0&ssl=true&authSource=admin"; 

const questionSchema = new mongoose.Schema({
  title: String,
  contract_question_id: Number,
  status: String
});

const Question = mongoose.model("Question", questionSchema);

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Deleting ALL questions to sync with fresh Localhost deployment...");
    const result = await Question.deleteMany({});
    console.log(`Deleted ${result.deletedCount} questions.`);

    console.log("✅ Database cleared. Ready for new questions.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
