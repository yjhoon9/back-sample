const Post = require('models/post');
const Joi = require('joi');
const logger = require('logger');

/*
  POST /api/posts
  { title, body, type, info, tags, category, url }
*/
exports.write = async (req, res, next) => {
  // 객체가 지닌 값들을 검증합니다.
  const schema = Joi.object().keys({
    title: Joi.string().required(), // 뒤에 required를 붙여주면 필수 항목이라는 의미
    body: Joi.string().required(),
    type: Joi.string().required(),
    info: Joi.string(),
    tags: Joi.array().items(Joi.string()), // 문자열 배열
    category: Joi.string(),
    url: Joi.string()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    return res.status(400).json({
      message: 'schema validation fail'
    });
  }

  const { title, body, type, info, tags, category, url } = req.body;

  // 새 Post 인스턴스를 생성합니다.
  const post = new Post({
    title,
    body,
    type,
    info,
    tags,
    category,
    url
  });

  try {
    await post.save(); // 데이터베이스에 등록합니다.
    return res.send(post);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/posts
*/
exports.list = async (req, res, next) => {
  // page가 주어지지 않았다면 1로 간주
  // query는 문자열 형태로 받아 오므로 숫자로 변환
  const page = parseInt(req.query.page || 1, 10);
  const perPage = parseInt(req.query.per_page || 10, 10);
  const { type, tag, search } = req.query;

  const query = tag
    ? {
        type,
        title: RegExp(search),
        tags: { $in: tag.split(',') }
      }
    : {
        type,
        title: RegExp(search)
      };

  // 잘못된 페이지가 주어졌다면 에러
  if (page < 1) {
    return res.status(400).json({
      message: 'invalid page'
    });
  }

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean()
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    const limitBodyLength = post => ({
      ...post,
      body: post.body.length < 350 ? post.body : `${post.body.slice(0, 350)}...`
    });
    res.set('Last-Page', Math.ceil(postCount / (perPage || postCount)));
    return res.send(posts.map(limitBodyLength));
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  GET /api/posts/url
*/
exports.readByUrl = async (req, res, next) => {
  const { url } = req.query;
  try {
    const post = await Post.findOne({ url }).exec();
    // 포스트가 존재하지 않음
    if (!post) {
      return res.status(404).json({
        message: 'post not found'
      });
    }
    return res.send(post);
  } catch (err) {
    logger.error(err.message);
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
  try {
    const post = await Post.findById(id).exec();
    // 포스트가 존재하지 않음
    if (!post) {
      return res.status(404).json({
        message: 'post not found'
      });
    }
    return res.send(post);
  } catch (err) {
    logger.error(err.message);
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
    await Post.findByIdAndRemove(id).exec();
    return res.status(204).end();
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  PATCH /api/posts/:id
  { title, body, tags }
*/
exports.update = async (req, res, next) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(id, req.body, {
      new: true
      // 이 값을 설정해 주어야 업데이트된 객체를 반환합니다.
      // 설정하지 않으면 업데이트되기 전의 객체를 반환합니다.
    }).exec();
    // 포스트가 존재하지 않을 시
    if (!post) {
      return res.status(404).json({
        message: 'post not found'
      });
    }
    return res.send(post);
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      message: 'db error'
    });
  }
};
