
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Album, Song, Lyrics } = require('./models');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fossils-music')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/albums', async (req, res) => {
  const albums = await Album.find();
  res.json(albums);
});

app.get('/api/albums/:id/songs', async (req, res) => {
  const songs = await Song.find({ albumId: req.params.id });
  res.json(songs);
});

app.get('/api/songs/:id', async (req, res) => {
  const song = await Song.findById(req.params.id);
  res.json(song);
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const albums = await Album.find({ albumName: new RegExp(q, 'i') });
  const songs = await Song.find({ songName: new RegExp(q, 'i') });
  res.json({ albums, songs });
});

app.get('/api/lyrics/:songId', async (req, res) => {
  const lyrics = await Lyrics.findOne({ songId: req.params.songId });
  res.json(lyrics);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
