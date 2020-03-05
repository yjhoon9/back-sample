const path = require('path');

module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/resolver': {
      node: { paths: [path.resolve('./src')] }
    }
  },
  rules: {
    'no-unused-vars': 1,
    'commma-dangle': 0,
    'eol-last': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 1
  }
};
