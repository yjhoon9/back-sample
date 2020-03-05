const OnlineCounselling = require('models/online_counselling');
const Joi = require('joi');
const logger = require('logger');

/*
  POST /api/online-counsellings
  { title, content, writer, password }
*/
exports.write = async (req, res, next) => {
  // 객체가 지닌 값들을 검증합니다.
  const schema = Joi.object().keys({
    title: Joi.string().required(), // 뒤에 required를 붙여주면 필수 항목이라는 의미
    content: Joi.string().required(),
    writer: Joi.string().required(),
    password: Joi.string().required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    res.status(400).json({
      code: 400,
      message: 'schema validation fail'
    });
  }

  const { title, content, writer, password } = req.body;

  // 새 Post 인스턴스를 생성합니다.
  const onlineCounselling = new OnlineCounselling({
    title,
    content,
    writer,
    password
  });

  try {
    await onlineCounselling.save(); // 데이터베이스에 등록합니다.
    return res.send(onlineCounselling);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  POST /api/online-counsellings/:id/commnets
  { content }
*/
exports.writeComment = async (req, res, next) => {
  const { id } = req.params;
  // 객체가 지닌 값들을 검증합니다.
  const schema = Joi.object().keys({
    writer: Joi.string().required(),
    content: Joi.string().required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    return res.status(400).json({
      message: 'schema validation fail'
    });
  }

  const { writer, content } = req.body;

  try {
    const onlineCounselling = await OnlineCounselling.findById(id).exec();
    await onlineCounselling.comments.push({ writer, content });
    await onlineCounselling.save(); // 데이터베이스에 등록합니다.
    return res.send(onlineCounselling);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/online-counsellings
*/
exports.list = async (req, res, next) => {
  // page가 주어지지 않았다면 1로 간주
  // query는 문자열 형태로 받아 오므로 숫자로 변환
  const page = parseInt(req.query.page || 1, 10);
  const perPage = parseInt(req.query.per_page || 10, 10);
  const { search } = req.query;

  const query = {
    $or: [{ title: RegExp(search) }, { writer: RegExp(search) }]
  };

  // 잘못된 페이지가 주어졌다면 에러
  if (page < 1) {
    return res.status(400).json({
      message: 'invalid page'
    });
  }

  try {
    const onlineCounsellings = await OnlineCounselling.find(query)
      .sort({ _id: -1 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean()
      .exec();
    const count = await OnlineCounselling.countDocuments(query).exec();
    const limitBodyLength = onlineCounselling => ({
      ...onlineCounselling,
      body:
        onlineCounselling.content.length < 100
          ? onlineCounselling.content
          : `${onlineCounselling.content.slice(0, 100)}...`
    });
    // res.set은 response header를 설정해줍니다.
    res.set('Last-Page', Math.ceil(count / (perPage || count)));
    return res.send(onlineCounsellings.map(limitBodyLength));
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/posts/:id
*/
exports.read = async (req, res, next) => {
  const { id } = req.params;
  const { password = null } = req.query;

  try {
    const onlineCounselling = await OnlineCounselling.findById(id).exec();
    // 포스트가 존재하지 않음
    if (!onlineCounselling) {
      return res.status(404).json({
        message: 'post not found'
      });
    }

    const validateResult = await onlineCounselling.validatePassword(password);
    if (!validateResult) {
      return res.status(400).json({
        message: 'incorrect password'
      });
    } else {
      return res.send(onlineCounselling);
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  DELETE /api/posts/:id
*/
exports.remove = async (req, res, next) => {
  const { id } = req.params;
  try {
    await OnlineCounselling.findByIdAndRemove(id).exec();
    return res.status(204).end();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  PATCH /api/posts/:id
*/
exports.update = async (req, res, next) => {
  const { id } = req.params;
  try {
    const onlineCounselling = await OnlineCounselling.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true
        // 이 값을 설정해 주어야 업데이트된 객체를 반환합니다.
        // 설정하지 않으면 업데이트되기 전의 객체를 반환합니다.
      }
    ).exec();
    // 포스트가 존재하지 않을 시
    if (!onlineCounselling) {
      return res.status(404).json({
        message: 'post not found'
      });
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};
