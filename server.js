const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// URL Schema
const UrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    default: shortid.generate
  },
  shortUrl: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: Date.now
  },
  clicks: {
    type: Number,
    default: 0
  }
});

const Url = mongoose.model('Url', UrlSchema);

// Routes
// Create short URL
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

  // Check if the URL is valid
  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // Check if the URL already exists in the database
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.status(200).json(url);
    } else {
      const shortCode = shortid.generate();
      const shortUrl = `${baseUrl}/${shortCode}`;

      url = new Url({
        originalUrl,
        shortCode,
        shortUrl
      });

      await url.save();
      res.status(201).json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to original URL
app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
