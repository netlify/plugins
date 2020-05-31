module.exports = {
  parser: 'babel-eslint',
  plugins: ['prettier'],
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'prettier'],
};
