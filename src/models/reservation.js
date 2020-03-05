const mongoose = require('mongoose');

const { Schema } = mongoose;

const Reservation = new Schema({
  state: { type: Number, default: 0 }, // -1: 취소 0: 대기 1: 확정
  inquiries: [String],
  symptoms: [String],
  reservationDate: Date,
  publishedDate: {
    type: Date,
    default: new Date(), // 현재 날짜를 기본값으로 지정
  },
  info: {
    name: String,
    gender: { type: String, uppercase: true }, // M: male, F: female
    visit: { type: String, uppercase: true }, // F: first vitsit, R: Revisit
    phone: String,
    questions: String,
  },
  // sms: {
  //   confirm: { type: Boolean, default: false },
  //   cancel: { type: Boolean, default: false },
  // },
});

module.exports = mongoose.model('Reservation', Reservation);
