import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Third-party code is vendored verbatim so it can be diffed against upstream; our
  // rules don't apply to it.
  // `docs` is Vite's committed production output for GitHub Pages. Lint the source that
  // creates it, not React and other dependencies after they have been minified into it.
  globalIgnores(['dist', 'docs', 'src/components/vendor']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
