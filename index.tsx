import browserSync from 'browser-sync'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

import mdx from '@mdx-js/mdx'

import { i18nContents } from '../../../Item/i18n-sync/src/index'
import ReactLiveComponent from './components/ReactLiveComponent'

const PATH_CONTENTS = path.resolve( __dirname, './contents' )
const PATH_BUILD_CONTENTS = path.resolve( __dirname, './build-contents' )
const PATH_BUILD_PAGES = path.resolve( __dirname, './build-pages' )
// # use i18n-sync to set different types
const syncDifferentTypes = () => {
  const locales = [
    'name1',
    'name2',
  ]
  const backupName = ".backup"
  const extension = '.md'
  const syncConfig = {
    enableTranslation: false
  }
  const config = {
    locales,
    extension,
    backupName,
    syncConfig
  }
  i18nContents( PATH_CONTENTS, PATH_BUILD_CONTENTS, config )
}

syncDifferentTypes()

// # mdxjs generates codes, then react-live generates components 
// const jsx = mdx.sync( removedYmlText )
chokidar.watch( `${PATH_BUILD_CONTENTS}/**/*.md` ).on( 'change', filePath => {
  const name = path.parse( filePath ).name

  // # generate page
  const text = fs.readFileSync( filePath, { encoding: 'utf8' } )
  const jsx = mdx.sync( text )
  // remove `export default`
  let filteredJsx = jsx.replace(
    "export default class MDXContent",
    "class MDXContent"
  )

  // insert react-live's render method
  filteredJsx = `${filteredJsx}
render( <MDXContent /> )
  `
  const Component = () => <ReactLiveComponent code={ filteredJsx }/>
  const sheet = new ServerStyleSheet()
  const domStr = ReactDOMServer.renderToString(
    sheet.collectStyles(<Component />)
  )
  const styleTags = sheet.getStyleTags()
  const htmlText = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${name}</title>
    ${styleTags}
  </head>
  <body>
    ${domStr}
  </body>
  </html>`


  // # output pag
  const outputFilePath = path.resolve( PATH_BUILD_PAGES, `${name}.html` )
  fs.outputFileSync( outputFilePath, htmlText, { encoding: 'utf8' } )
} )


// # server
browserSync.init( {
  server: {
		baseDir: PATH_BUILD_PAGES,
		directory: true,
  },
  files: [
    `${PATH_BUILD_PAGES}/**/*.html`
  ],
  open: false,
} )