import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { pdfjs, Document, Page } from 'react-pdf'
import styled from 'styled-components'
import CustomColorButton from '../Generic/CustomColorButton'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`

const PDFViewerContainer = styled.div`
  background: lightgray;
  padding: 1.5rem;
  border: solid 1px darkgray;
  overflow-y: auto;

  canvas {
    margin: auto;
  }
`

const PaginationContainer = styled.div`
  text-align: center;
`

export default class PDFViewer extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
  }

  state = {
    numPages: null,
    pageNumber: 1,
  }

  onDocumentLoadSuccess = (doc) => {
    const { numPages } = doc
    this.setState({
      numPages,
      pageNumber: 1,
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
            <p>
              Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}
            </p>
            <CustomColorButton
              component="span"
              size="small"
              type="button"
              disabled={pageNumber <= 1}
              onClick={this.previousPage}
            >
              Page précédente
            </CustomColorButton>
            <CustomColorButton
              style={{ marginLeft: '1rem' }}
              component="span"
              size="small"
              type="button"
              disabled={pageNumber >= numPages}
              onClick={this.nextPage}
            >
              Page suivante
            </CustomColorButton>
          </PaginationContainer>
        )}
      </PDFViewerContainer>
    )
  }
}
