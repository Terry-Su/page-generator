import chokidar from 'chokidar'
import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

import mdx from '@mdx-js/mdx'

import { i18nContents } from '../../../Item/i18n-sync/src/index'
import ReactLiveComponent from './components/ReactLiveComponent'

const PATH_CONTENTS = path.resolve(__dirname, "./contents")
const PATH_BUILD_CONTENTS = path.resolve(__dirname, "./build-contents")
export const PATH_BUILD_PAGES = path.resolve(__dirname, "./build-pages")
// # use i18n-sync to set different types
const syncDifferentTypes = () => {
  const files = glob.sync(`${PATH_CONTENTS}/**/*.js`)
  const locales = files.map(file => path.parse(file).name)
  const backupName = ".backup"
  const extension = ".js"
  const syncConfig = {
    enableTranslation: false
  }
  const config = {
    locales,
    extension,
    backupName,
    syncConfig
  }
  i18nContents(PATH_CONTENTS, PATH_BUILD_CONTENTS, config)
}

syncDifferentTypes()

// # mdxjs generates codes, then react-live generates components
// const jsx = mdx.sync( removedYmlText )
const handleChange = filePath => {
  const name = path.parse(filePath).name

  // # generate page
  let reactLiveCode = fs.readFileSync(filePath, { encoding: "utf8" })
  // const jsx = mdx.sync(text)
  // remove `export default`
//   let filteredJsx = jsx.replace(
//     "export default class MDXContent",
//     "class MDXContent"
//   )

  let Component
  try {
    Component = () => <ReactLiveComponent code={reactLiveCode} />
  } catch ( e ) {
    console.log( e )
    Component = () => <div></div>
  }
  
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
    <style>
      html, body {
        width: 100%;
        height: 100%;
      }
      html, body, h1, h2, h3, p, ol, ul, li{
        padding: 0;
        margin: 0;
      }
    </style>
    ${styleTags}
  </head>
  <body>
    ${domStr}
  </body>
  </html>`

  // # output pag
  const outputFilePath = path.resolve(PATH_BUILD_PAGES, `${name}.html`)
  fs.outputFileSync(outputFilePath, htmlText, { encoding: "utf8" })
}
glob.sync( `${PATH_BUILD_CONTENTS}/**/*.js` ).forEach( handleChange )
chokidar.watch(`${PATH_BUILD_CONTENTS}/**/*.js`).on("change", handleChange)

