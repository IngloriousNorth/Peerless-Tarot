const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const tripcode = require('tripcode');
const { check, validationResult } = require('express-validator');
const he = require('he');

// Upstash Redis setup (Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel settings)
const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

const EXPIRATION_SECONDS = 466; // ~7.7 minutes (466200ms)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to update/reset TTL
async function setReader(trips, data) {
  await redis.set(`reader:${trips}`, JSON.stringify(data), { ex: EXPIRATION_SECONDS });
}

async function getReader(trips) {
  const data = await redis.get(`reader:${trips}`);
  return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

app.post("/pong", async (req, res) => {
  const { trips } = req.body;
  if (trips) {
    const reader = await getReader(trips);
    if (reader) await setReader(trips, reader); // Resets TTL
  }
  res.end();
});

app.post("/initiate", [
  check("trips").not().isEmpty().trim().escape(),
  check("sequence").not().isEmpty().custom(value => {
    try { JSON.parse(value); } catch (e) { return false; }
    return true;
  }).trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const trips = tripcode(he.decode(req.body.trips));

  const readerData = {
    sequence: JSON.parse(he.decode(req.body.sequence)),
    tripcode: trips,
    hail: null
  };

  await setReader(trips, readerData);
  res.json({ tripcode: trips });
});

app.get("/sequence/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tc = he.decode(req.params.tripcode);
  const reader = await getReader(tc);

  if (!reader) return res.status(404).json({ error: "Session expired or not found" });

  res.json({
    sequence: JSON.stringify(reader.sequence)
  });
});

app.post("/magick", [
  check("tripcode").not().isEmpty().trim().escape(),
  check("sequence").not().isEmpty().custom(value => {
    try { JSON.parse(value); } catch (e) { return false; }
    return true;
  }).trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tc = decodeURIComponent(decodeURIComponent(req.body.tripcode));
  const reader = await getReader(tc) || {};

  reader.tripcode = tc;
  reader.hail = JSON.parse(he.decode(req.body.sequence));

  await setReader(tc, reader);
  res.end();
});

app.get("/hail/:tripcode", [
  check("tripcode").not().isEmpty().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const trips = tripcode(he.decode(req.params.tripcode));
  const reader = await getReader(trips);

  if (reader && reader.hail) {
    res.json({
      sequence: JSON.stringify(reader.hail)
    });
  } else {
    res.end();
  }
});

app.post("/established/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const trips = tripcode(he.decode(req.params.tripcode));
  const reader = await getReader(trips);

  if (reader) {
    await redis.del(`reader:${trips}`);
  }

  res.json({
    sum: reader ? reader.sum : 0,
    wallet_address: reader ? reader.wallet_address : ""
  });
});

app.post("/delete_oracle/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], async (req, res) => {
  const trips = tripcode(he.decode(req.params.tripcode));
  await redis.del(`reader:${trips}`);
  res.end();
});

app.get("/readers", async (req, res) => {
  const keys = await redis.keys('reader:*');
  const tripcodes = [], wallet_addresses = [], sums = [], trading = [];

  for (const key of keys) {
    const reader = await getReader(key.replace('reader:', ''));
    if (reader) {
      wallet_addresses.push(reader.wallet_address);
      sums.push(reader.sum);
      tripcodes.push(reader.tripcode);
      trading.push(reader.trading);
    }
  }

  res.json({ tripcodes, trading, sums, wallet_addresses });
});

app.get("/web3/:tripcode", check("tripcode").not().isEmpty().trim().escape(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tc = he.decode(req.params.tripcode);
  const reader = await getReader(tc);

  if (!reader) return res.status(404).json({ error: "Not found" });

  return res.json({ sum: reader.sum, wallet_address: reader.wallet_address });
});

app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thought.html'));
});

// Export app for Vercel Serverless Function engine

module.exports = app;

