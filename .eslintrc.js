module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
    },
    extends: 'standard',
    plugins: [
        'html'
    ],
    rules: {
        'arrow-parens': 0,
        'generator-star-spacing': 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'space-before-function-paren': 0,
        'object-property-newline': 0,
        'new-cap': 0,
        'no-eval': 0,
        'semi': 0,
        'indent': [0, 4],
        'no-return-assign': 0,
        'no-new': 0,
        'curly': 0,
        'no-return-await': 0,
        'promise/param-names': 0
    },
    globals: { }
};
