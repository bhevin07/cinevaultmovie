import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://bhevinrahul2007_db_user:Bhevin07@cluster0.oyb0o5p.mongodb.net/')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  year: Number,
  rating: String,
  poster: String,
  teaserUrl: String,
  summary: String,
  review: String
});

const Movie = mongoose.model('Movie', movieSchema, 'review');

app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log("Server running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});