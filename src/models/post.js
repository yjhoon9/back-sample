const mongoose = require('mongoose');

const { Schema } = mongoose;

const Post = new Schema({
  title: String,
  type: String,
  body: String,
  info: String,
  category: String,
  tags: { type: [String], default: [] }, // 문자열의 배열
  publishedDate: {
    type: Date,
    default: new Date(), // 현재 날짜를 기본값으로 지정
  },
  url: {
    type: String,
    index: true,
    sparse: true,
    unique: true,
  },
});

module.exports = mongoose.model('Post', Post);
