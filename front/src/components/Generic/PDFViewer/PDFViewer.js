import React, { PureComponent } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import { Document, Page, pdfjs } from 'react-pdf'
import styled from 'styled-components'

import PDFSlider from './PDFSlider'
import PDFNatigation from './PDFNatigation'
import PDFNatigationHover from './PDFNatigationHover'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`

const PDFViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  position: relative;

  canvas {
    margin: auto;
    /* Override react-pdf default styles */
    width: auto !important;
    height: auto !important;
  }

  /*
   * react-pdf__Page__textContent is what could allow selecting and copying text from the PDF document.
   * By hiding it, we can avoid layout problem it can cause.
   * Same for annotations.
   */
  .react-pdf__Page__textContent,
  .react-pdf__Page__annotations {
    display: none;
  }
`

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`

export default class PDFViewer extends PureComponent {
  static propTypes = {
    url: PropTypes.string.isRequired,
    onPageNumberChange: PropTypes.func.isRequired,
    originalFileName: PropTypes.string,
  }

  state = {
    numPages: null,
    pageNumber: 1,
    scale: 1,
    needScale: true,
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

  refPageContainer = React.createRef()

  onDocumentLoadSuccess = (doc) => {
    const { numPages } = doc
    this.setState({
      numPages,
      pageNumber: numPages,
    })
  }

  onDocumentRenderSuccess = () => {
    const canvas = document.getElementsByTagName('canvas')[0]
    if (this.state.needScale && canvas) {
      const wPage = this.refPageContainer.current.clientWidth
      const scale = Number(Math.max(wPage / canvas.width, 0.1).toFixed(1))
      if (wPage < canvas.width) {
        this.setState({ scale, needScale: false })
      }
    }
  }

  changePage = (offset) =>
    this.setState((prevState) => ({
      pageNumber: prevState.pageNumber + offset,
      needScale: true,
      scale: 1,
    }))

  previousPage = () => this.changePage(-1)

  nextPage = () => this.changePage(1)

  onChangeScale = (value) => this.setState({ scale: value })

  render() {
    const { originalFileName } = this.props
    const { numPages, pageNumber, scale } = this.state

    return (
      <PDFViewerContainer>
        {originalFileName && (
          <Typography style={{ marginTop: '1rem' }} className="filename">
            {originalFileName}
          </Typography>
        )}
        <PageContainer ref={this.refPageContainer}>
          <Document
            loading={<CircularProgress style={{ margin: '10rem auto' }} />}
            file={this.props.url}
            onLoadSuccess={this.onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              onRenderSuccess={this.onDocumentRenderSuccess}
            />
          </Document>
        </PageContainer>

        <PDFNatigationHover
          numPages={numPages}
          pageNumber={pageNumber}
          previousPage={this.previousPage}
          nextPage={this.nextPage}
        />

        <PDFNatigation
          numPages={numPages}
          pageNumber={pageNumber}
          previousPage={this.previousPage}
          nextPage={this.nextPage}
        />

        <PDFSlider onChange={this.onChangeScale} value={scale} />
      </PDFViewerContainer>
    )
  }
}
