import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import IconArrowBack from '@material-ui/icons/ArrowBack'
import IconArrowForward from '@material-ui/icons/ArrowForward'
import styled from 'styled-components'

import { primaryBlue } from '../../../constants'

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export default function PDFNavigation(props) {
  const { numPages, pageNumber, previousPage, nextPage } = props
  if (!numPages) return null

  return (
    <PaginationContainer className="pager">
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

      <Typography style={{ padding: '0 2rem' }}>
        {pageNumber}/{numPages}
      </Typography>

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

PDFNavigation.propTypes = {
  numPages: PropTypes.number,
  pageNumber: PropTypes.number.isRequired,
  previousPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
}
