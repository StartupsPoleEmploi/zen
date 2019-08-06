import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { pdfjs, Document, Page } from 'react-pdf'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'

import ArrowBack from '@material-ui/icons/ArrowBack'
import ArrowForward from '@material-ui/icons/ArrowForward'
import { primaryBlue, mobileBreakpoint } from '../../constants'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`

const PDFViewerContainer = styled.div`
  canvas {
    overflow-x: auto;
    padding: 1.5rem;
    overflow-y: auto;
    margin: auto;
  }
`

const StylePDFPage = styled(Page)`
  && {
    overflow: auto;
    height: 55vh;
    box-shadow: 0px 0px 20px #ccc;
    margin: 2rem 0;
    min-width: 45rem;

    @media (max-width: ${mobileBreakpoint}) {
      width: 100%;
      min-width: auto;
    }
  }
`

const PaginationContainer = styled.div`
  position: relative;
  bottom: 0;
  display: flex;
  margin: 1rem;
  justify-content: center;
  align-items: center;
  text-align: center;
  @media (max-width: ${mobileBreakpoint}) {
    flex-direction: column;
  }
`

const PaginationButton = styled(Typography).attrs({ component: 'button' })`
  && {
    position: absolute;
    border: none;
    background: transparent;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    cursor: pointer;

    @media (max-width: ${mobileBreakpoint}) {
      position: static;
    }
  }
`

export default class PDFViewer extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    onPageNumberChange: PropTypes.func.isRequired,
  }

  state = {
    numPages: null,
    pageNumber: 1,
  }

  componentDidUpdate(prevProps, prevState) {
    // Notify parent when the current page or the total page number have been modified
    // For handling file page limit (or the delete page feature)
    if (
      prevState.numPages !== this.state.numPages ||
      prevState.pageNumber !== this.state.pageNumber
    ) {
      this.props.onPageNumberChange(this.state.pageNumber, this.state.numPages)
    }
  }

  onDocumentLoadSuccess = (doc) => {
    const { numPages } = doc
    this.setState({
      numPages,
      pageNumber: numPages,
    })
  }

  changePage = (offset) =>
    this.setState((prevState) => ({
      pageNumber: prevState.pageNumber + offset,
    }))

  previousPage = () => this.changePage(-1)

  nextPage = () => this.changePage(1)

  render() {
    const { numPages, pageNumber } = this.state

    return (
      <PDFViewerContainer>
        <Document
          style={{ overflow: 'auto' }}
          file={this.props.url}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <StylePDFPage pageNumber={pageNumber} />
        </Document>
        {numPages > 1 && (
          <PaginationContainer>
            {pageNumber > 1 && (
              <PaginationButton
                size="small"
                style={{ left: 0 }}
                disabled={pageNumber <= 1}
                onClick={this.previousPage}
                className="previous-page"
              >
                <ArrowBack
                  style={{ color: primaryBlue, marginRight: '.5rem' }}
                />{' '}
                Page précédente
              </PaginationButton>
            )}
            <Typography className="pager">
              {pageNumber}/{numPages}
            </Typography>

            {pageNumber < numPages && (
              <PaginationButton
                style={{ right: 0 }}
                size="small"
                disabled={pageNumber >= numPages}
                onClick={this.nextPage}
                className="next-page"
              >
                Page suivante
                <ArrowForward
                  style={{ color: primaryBlue, marginLeft: '.5rem' }}
                />
              </PaginationButton>
            )}
          </PaginationContainer>
        )}
      </PDFViewerContainer>
    )
  }
}
