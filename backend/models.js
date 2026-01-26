
const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
  albumName: { type: String, required: true },
  releaseYear: String,
  albumImage: String,
  description: String
});

const SongSchema = new mongoose.Schema({
  songName: { type: String, required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  audioUrl: String,
  duration: String,
  artist: { type: String, default: 'Rupam Islam & Fossils' }
});

const LyricsSchema = new mongoose.Schema({
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', unique: true },
  bengaliLyrics: [{
    time: Number,
    text: String
  }]
});

module.exports = {
  Album: mongoose.model('Album', AlbumSchema),
  Song: mongoose.model('Song', SongSchema),
  Lyrics: mongoose.model('Lyrics', LyricsSchema)
};
