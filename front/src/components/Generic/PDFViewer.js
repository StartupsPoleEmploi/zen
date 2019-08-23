import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ArrowForward from '@material-ui/icons/ArrowForward'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import styled from 'styled-components'

import { primaryBlue } from '../../constants'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`

const PDFViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;

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
  padding-top: 1rem;
  justify-content: center;
  align-items: center;
  text-align: center;
`

export default class PDFViewer extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    onPageNumberChange: PropTypes.func.isRequired,
    originalFileName: PropTypes.string,
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
    const { originalFileName } = this.props
    const { numPages, pageNumber } = this.state

    return (
      <PDFViewerContainer>
        <Document
          loading={<CircularProgress style={{ margin: '10rem auto' }} />}
          file={this.props.url}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>

        {originalFileName && (
          <Typography style={{ marginTop: '1rem' }}>
            {originalFileName}
          </Typography>
        )}

        {numPages > 1 && (
          <PaginationContainer className="pager">
            <Button
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
              Précédente
            </Button>

            <Typography style={{ padding: '0 2rem' }}>
              {pageNumber}/{numPages}
            </Typography>

            <Button
              disabled={pageNumber >= numPages}
              onClick={this.nextPage}
              className="next-page"
            >
              Suivante
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
