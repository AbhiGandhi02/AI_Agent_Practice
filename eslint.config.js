module.exports = {
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
    },
    rules: {
        // Errors
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "no-undef": "error",

        // Warnings
        "no-console": "off",
        "prefer-const": "warn",

        // Style (optional)
        "semi": ["warn", "always"],
        "quotes": ["warn", "double", { allowTemplateLiterals: true }]
    }
};
