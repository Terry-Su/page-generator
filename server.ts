import browserSync from 'browser-sync'

import { PATH_BUILD_PAGES } from './index'

// # server
browserSync.init({
  server: {
    baseDir: PATH_BUILD_PAGES,
    directory: true
  },
  files: [`${PATH_BUILD_PAGES}/**/*.html`],
  open: false
})
