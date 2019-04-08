import React, { Component } from 'react'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'
import styled, { createGlobalStyle } from 'styled-components'

import { MDXTag } from '@mdx-js/tag'

import GlobalMarkdownStyle from '../styles/GlobalMarkdownStyle'
import Markdown from './Markdown'

const basicScope = {
  React,
  styled,
  MDXTag,
  M: Markdown
}

export default function ReactLiveComponent(props: any = {}) {
  const { code, noInline = true, standalone } = props
  const scope = {
    ...basicScope,
    ...props,
    ...(props.scope || {})
  }
  const computedNoInline = standalone != null ? !standalone : noInline
  return (
    <React.Fragment>
      <LiveProvider
        scope={scope}
        noInline={computedNoInline}
        code={code}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <LiveError
          style={{
            width: "100%",
            height: "100%"
          }}
        />
        <StyledPreview>
          <LivePreview className="markdown-body" />
        </StyledPreview>
      </LiveProvider>

      <GlobalMarkdownStyle />
    </React.Fragment>
  )
}

const StyledPreview = styled.div`
  height: 100%;
  .markdown-body {
    height: 100%;
    
    > div {
      height: 100%;
    }
  }
`
