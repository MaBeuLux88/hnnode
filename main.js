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
        const collection = client.db("hacker-news").collection("mentions");
        await pipeline(
            request(HN_API),
            ndjson.parse({ strict: false }),
            filter({ objectMode: true }, chunk => {
                return chunk["body"].toLowerCase().includes("mongodb") || chunk["article-title"].toLowerCase().includes("mongodb");
            }),
            through2.obj((row, enc, next) => {
                let result = textRank.analyze(row.body);
                row.score = result.score;
                next(null, row);
            }),
            through2.obj((row, enc, next) => {
                collection.insertOne({
                    ...row,
                    "user-url": `https://news.ycombinator.com/user?id=${row["author"]}`,
                    "item-url": `https://news.ycombinator.com/item?id=${row["article-id"]}`
                });
                next();
            })
        );
        console.log("FINISHED");
    } catch {
        console.log(error);
    }
})();