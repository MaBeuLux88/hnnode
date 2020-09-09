const stream = require("stream");
const ndjson = require("ndjson");
const through2 = require("through2");
const request = require("request");
const filter = require("through2-filter");
const sentiment = require("sentiment");
const util = require("util");
const pipeline = util.promisify(stream.pipeline);
const { MongoClient } = require("mongodb");

const HN_API = "https://api.hnstream.com/comments/stream/";

(async () => {
    const client = new MongoClient(process.env["ATLAS_URI"]);
    const textRank = new sentiment();
    try {
        await client.connect();
        const collection = client.db(process.env["DATABASE_NAME"]).collection(process.env["DATABASE_COLLECTION"]);
        await pipeline(
            // Request a response from the API
            request(HN_API),
            // Parse the JSON objects that come back and drop the malformed
            ndjson.parse({ strict: false }),
            // Filter any JSON objects that don't match the search criteria
            filter({ objectMode: true }, chunk => {
                return chunk["body"].toLowerCase().includes("mongodb") || chunk["article-title"].toLowerCase().includes("mongodb");
            }),
            // Create a sentiment analysis and add it to the original JSON object
            through2.obj((row, enc, next) => {
                let result = textRank.analyze(row.body);
                row.score = result.score;
                next(null, row);
            }),
            // Add the JSON object with sentiment analysis to MongoDB
            through2.obj((row, enc, next) => {
                console.log(row);
                collection.insertOne({
                    ...row,
                    "user-url": `https://news.ycombinator.com/user?id=${row["author"]}`,
                    "item-url": `https://news.ycombinator.com/item?id=${row["article-id"]}`
                });
                next();
            })
        );
        // This should never be reached
        console.log("FINISHED");
    } catch {
        console.log(error);
    }
})();