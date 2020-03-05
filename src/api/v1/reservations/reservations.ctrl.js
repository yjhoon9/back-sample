const Reservation = require('models/reservation');
const Joi = require('joi');
const logger = require('logger');

/*
  POST /api/reservations
  { inquiries, symptoms, reservationDate, info }
*/
exports.write = async (req, res, next) => {
  // 객체가 지닌 값들을 검증합니다.
  const schema = Joi.object().keys({
    inquiries: Joi.array().items(Joi.string()), // 문자열 배열
    symptoms: Joi.array().items(Joi.string()), // 문자열 배열
    reservationDate: Joi.date(),
    info: Joi.object()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    res.status(400).json({
      message: 'schema validation fail'
    });
  }

  const { inquiries, symptoms, reservationDate, info } = req.body;

  // 새 Post 인스턴스를 생성합니다.
  const reservation = new Reservation({
    inquiries,
    symptoms,
    reservationDate,
    info
  });

  try {
    await reservation.save(); // 데이터베이스에 등록합니다.
    return res.send(reservation);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/reservations
*/
exports.list = async (req, res, next) => {
  // page가 주어지지 않았다면 1로 간주
  // query는 문자열 형태로 받아 오므로 숫자로 변환
  const page = parseInt(req.query.page || 1, 10);
  const perPage = parseInt(req.query.per_page || 10, 10);
  const { search } = req.query;

  const query = {
    $or: [{ 'info.name': RegExp(search) }, { 'info.phone': RegExp(search) }]
  };

  // 잘못된 페이지가 주어졌다면 에러
  if (page < 1) {
    return res.status(400).json({
      message: 'invalid page'
    });
  }

  try {
    const reservations = await Reservation.find(query)
      .sort({ _id: -1 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean()
      .exec();
    const reservationCount = await Reservation.countDocuments(query).exec();
    // 마지막 페이지 알려 주기
    req.set(
      'Last-Page',
      Math.ceil(reservationCount / (perPage || reservationCount))
    );
    return res.send(reservation);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/reservations/:id
*/
exports.read = async (req, res, next) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id).exec();
    // 포스트가 존재하지 않음
    if (!reservation) {
      return res.statu(404).json({
        message: 'post not found'
      });
    }
    return res.send(reservation);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  DELETE /api/reservations/:id
*/
exports.remove = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Reservation.findByIdAndRemove(id).exec();
    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  PATCH /api/reservations/:id
*/
exports.update = async (req, res, next) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndUpdate(id, req.body, {
      new: true
      // 이 값을 설정해 주어야 업데이트된 객체를 반환합니다.
      // 설정하지 않으면 업데이트되기 전의 객체를 반환합니다.
    }).exec();
    // 포스트가 존재하지 않을 시
    if (!reservation) {
      return res.status(404).json({
        message: 'post not found'
      });
    }
    return res.send(reservation);
  } catch (err) {
    return res.status(500).json({
      message: 'db error'
    });
  }
};
