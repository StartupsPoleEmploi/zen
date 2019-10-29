import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IconArrowBack from '@material-ui/icons/ArrowBack'
import IconArrowForward from '@material-ui/icons/ArrowForward'
import styled from 'styled-components'

import { primaryBlue } from '../../../constants'

const PaginationContainer = styled.div`
  .previous-page,
  .next-page {
    position: absolute;
    height: 200px;
    top: calc((100% - 200px) / 2);
  }

  .previous-page {
    left: 16px;
  }

  .next-page {
    right: 16px;
  }
`

export default function PDFNatigationHover(props) {
  const { numPages, pageNumber, previousPage, nextPage } = props
  if (!numPages) return null

  return (
    <PaginationContainer>
      <Button
        disabled={pageNumber <= 1}
        onClick={previousPage}
        className="previous-page"
      >
        <IconArrowBack
          style={{
            color: pageNumber <= 1 ? 'inherit' : primaryBlue,
          }}
        />
      </Button>
      <Button
        disabled={pageNumber >= numPages}
        onClick={nextPage}
        className="next-page"
      >
        <IconArrowForward
          style={{
            color: pageNumber >= numPages ? 'inherit' : primaryBlue,
          }}
        />
      </Button>
    </PaginationContainer>
  )
}

PDFNatigationHover.propTypes = {
  numPages: PropTypes.number,
  pageNumber: PropTypes.number.isRequired,
  previousPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
}
