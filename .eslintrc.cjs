// This is the base eslint config for all hx projects. PLEASE DO NOT ALTER THIS WITHOUT TALKING TO FRONTEND TEAM"
// ESLint's files allow comments so don't worry about any linter errors you are getting here

// Rules common to JS and TS files.
const rules = {
  "linebreak-style": "off",
  "newline-before-return": "error",
  "no-restricted-globals": "off",
  "no-unused-vars": "error",
  "no-plusplus": [
    "error",
    {
      allowForLoopAfterthoughts: true,
    },
  ],
  eqeqeq: "error",
  curly: "error",
  "no-console": "off",
  "prefer-object-spread": "error",
  "max-classes-per-file": "off",
  "react/state-in-constructor": "off",
  "no-else-return": "off",
  "no-use-before-define": "off",
  "arrow-body-style": "off",
  "no-restricted-syntax": [
    "error",
    {
      message:
        "Please use `pixelSpacing` or `stringySpacing` instead of `spacing`",
      selector: 'MemberExpression > Identifier[name="spacing"]',
    },
  ],
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "@mui/material",
          importNames: [
            "Button",
            "Dialog",
            "DialogContentText",
            "Paper",
            "Tooltip",
            "Typography",
          ],
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/Button",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/Dialog",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/DialogContentText",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/Paper",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/Tooltip",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "@mui/material/Typography",
          message:
            'Please import this from "@hyperexponential/common" unless you are certain you need custom behaviour',
        },
        {
          name: "react-router-dom",
          message:
            'Please import this from "@hyperexponential/common" as there can only be one router package import',
        },
      ],
    },
  ],

  // React
  "react/forbid-prop-types": "off",
  "react/react-in-jsx-scope": "off",
  "react/prop-types": "off",
  "react/no-unused-prop-types": "off",
  "react/destructuring-assignment": "off",
  "react/no-access-state-in-setstate": "off",
  "react/no-array-index-key": "off",
  "react/no-multi-comp": "off",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "react/require-default-props": "off",
  "react/jsx-props-no-spreading": "off",
  "react/no-did-update-set-state": "off",
  "react/jsx-filename-extension": [
    "warn",
    {
      extensions: [
        // CSP has jsx in `js`, like some tests in portal.
        ".js",
        // Because we redeclare this list we need to add `.tsx`
        ".tsx",
      ],
    },
  ],
  "react-redux/useSelector-prefer-selectors": "off", // TODO cover all codebase and use rule from overrides

  // Import
  "import/prefer-default-export": "off",
  "import/extensions": ["error", { json: "always", svg: "ignorePackages" }],
  "import/no-unresolved": [
    "error",
    {
      ignore: [
        "^@hyperexponential/",
        "customer-service/",
        "^@theme",
        "^@docusaurus",
        "^@generated",
        "unist",
        "mdast",
        "@site",
      ],
    },
  ],
  "import/no-extraneous-dependencies": [
    "error",
    {
      // scripts that are allowed to import from `devDependencies`.
      devDependencies: [
        "**/*.test.{ts,tsx,js}",
        "**/{__TEST__,__SPEC__}/**",
        "**/babel.config.js",
        "**/jest.config.js",
        "**/vite.config.ts",
        "**/vite/**",
        "**/test-utils/**",
      ],
    },
  ],

  // Accessability
  "jsx-a11y/anchor-is-valid": [
    "error",
    {
      components: ["Link"],
      specialLink: ["to"],
    },
  ],
  "jsx-a11y/no-static-element-interactions": "off",
  "jsx-a11y/click-events-have-key-events": "off",
};

const tsRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-throw-literal": "off",
  // disable deprecated rule, is covered by naming-convention
  "@typescript-eslint/camelcase": "off",
  "@typescript-eslint/no-use-before-define": "off",
  "@typescript-eslint/naming-convention": "off",
  // We have more than a few of these. A Redux reducer is a classic example where.
  "@typescript-eslint/default-param-last": "off",
};

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  extends: [
    // `airbnb-typescript` means we require neither `eslint:recommended` nor
    // `plugin:@typescript-eslint/recommended`. https://typescript-eslint.io/docs/linting/#community-configs
    "airbnb-typescript",
    // Note that this is only a config to disable formatting rules that are dealt with by prettier.
    // We do not check for prettier formatting errors as part of linting.
    // https://prettier.io/docs/en/integrating-with-linters.html
    // This practically mean NOT using eslint-plugin-prettier.
    // Must be last in the `extends` list.
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "jsx-a11y",
    "import",
    "react-redux",
  ],
  rules: {
    ...rules,
    ...tsRules,
  },
  overrides: [
    {
      files: "portal/**/*.tsx",
      rules: {
        "react-redux/useSelector-prefer-selectors": [
          "error",
          { matching: "^select.*$" },
        ],
      },
    },
  ],
};
