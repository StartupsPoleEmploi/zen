import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { pdfjs, Document, Page } from 'react-pdf'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import ArrowBack from '@material-ui/icons/ArrowBack'
import ArrowForward from '@material-ui/icons/ArrowForward'
import { primaryBlue } from '../../constants'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`

const PDFViewerContainer = styled.div`
  canvas {
    margin: auto;
    /* Override react-pdf default styles */
    max-height: 70vh;
    width: auto !important;
    height: auto !important;
    max-width: 90% !important;
    box-shadow: 0px 0px 20px #ccc;
  }

  /*
   * This element is what could allow selecting and copying text from the PDF document.
   * By hiding it, we can avoid layout problem it can cause
   */
  .react-pdf__Page__textContent {
    display: none;
  }
`

const PaginationContainer = styled.div`
  display: flex;
  padding: 1rem 0;
  justify-content: space-between;
  align-items: center;
  text-align: center;
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
          file={this.props.url}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        {numPages > 1 && (
          <PaginationContainer>
            <Button
              size="small"
              style={{ flexBasis: '40%' }}
              disabled={pageNumber <= 1}
              onClick={this.previousPage}
              className="previous-page"
            >
              <ArrowBack
                style={{
                  color: pageNumber <= 1 ? 'inherit' : primaryBlue,
                  marginRight: '.5rem',
                }}
              />{' '}
              Page précédente
            </Button>
            <Typography style={{ flexBasis: '20%' }}>
              {pageNumber}/{numPages}
            </Typography>

            <Button
              style={{ flexBasis: '40%' }}
              size="small"
              disabled={pageNumber >= numPages}
              onClick={this.nextPage}
              className="next-page"
            >
              Page suivante
              <ArrowForward
                style={{
                  color: pageNumber >= numPages ? 'inherit' : primaryBlue,
                  marginLeft: '.5rem',
                }}
              />
            </Button>
          </PaginationContainer>
        )}
      </PDFViewerContainer>
    )
  }
}
