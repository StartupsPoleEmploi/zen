import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const StyledThanks = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 48rem;
`

const LandingText = styled(Typography)`
  padding: 8rem 0;
`

export const Thanks = ({ activeMonth, location: { search } }) => (
  <StyledThanks>
    <LandingText variant="headline">Merci !</LandingText>
    <LandingText variant="title">
      {search.includes('later')
        ? 'Vous pourrez reprendre ultérieurement'
        : `Vous avez terminé votre declaration ${
            activeMonth ? `de ${moment(activeMonth).format('MMMM')} !` : '' // eslint-disable-line no-irregular-whitespace
          }`}
    </LandingText>
  </StyledThanks>
)

Thanks.propTypes = {
  activeMonth: PropTypes.instanceOf(Date),
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
}

export default Thanks
