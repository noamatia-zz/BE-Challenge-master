const fs = require("fs");
const express = require("express");
const app = express();
const port = +process.argv[2] || 3000;

const client = require("redis").createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

client.on("ready", () => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Example app listening at http://0.0.0.0:${port}`);
  });
});

const cardsData = fs.readFileSync("./cards.json");
const cards = JSON.parse(cardsData);
const cardsLength = cards.length;

async function getMissingCard(key) {
  const index = (await client.incrBy(key, 1)) - 1;
  if (cardsLength <= index) return -1;
  return cards[index];
}

app.get("/card_add", async (req, res) => {
  const missingCard = await getMissingCard(req.query.id);
  if (missingCard === -1) {
    res.send({ id: "ALL CARDS" });
    return;
  }
  res.send(missingCard);
});

app.get("/ready", async (req, res) => {
  res.send({ ready: true });
});

client.connect();
