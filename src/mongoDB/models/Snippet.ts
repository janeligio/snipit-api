import { Schema, model } from 'mongoose';

const SnippetSchema = new Schema({
  date: { type: Date, default: Date.now()},
  author: String,
  title: String,
  description: String,
  code: String,
  tags: [String],
  likes: Number
});

const Snippet = model('Snippet', SnippetSchema);

export default Snippet;