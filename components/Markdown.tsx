import React, { Component } from 'react'
import showdown from 'showdown'
import styled from 'styled-components'

export default class Markdown extends Component {
  props: any
  render() {
    const { children, inline = false, ...rest } = this.props
    const converter = new showdown.Converter({ metadata: true })
    let html
    try {
      html = converter.makeHtml(children)
    } catch (e) {
      console.log(e)
      html = ""
    }

    return (
      <StyledRoot
        dangerouslySetInnerHTML={{
          __html: html
        }}
        inline
        {...rest}
      />
    )
  }
}

const StyledRoot = styled.div`
  ${ props => props.inline ? "display: inline; & > p { display: inline; } " : "block" };
  

`