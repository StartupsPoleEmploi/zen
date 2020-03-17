import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import { isNull } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import YesNoRadioGroup from '../Generic/YesNoRadioGroup'
import { mobileBreakpoint } from '../../constants'

const Container = styled.li`
  padding: 1rem;
`

const MainQuestionContainer = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }
`

const QuestionLabel = styled(Typography)`
  && {
    flex-shrink: 1;

    @media (max-width: ${mobileBreakpoint}) {
      margin-bottom: 0.5rem;
    }
  }
`

const StyledFormControl = styled(FormControl)`
  && {
    flex-shrink: 0;
    padding-left: 1rem;
  }
`

export class DeclarationQuestion extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onAnswer: PropTypes.func.isRequired,
    value: PropTypes.bool,
    verticalLayout: PropTypes.bool,
    withChildrenOnNo: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line
  }

  handleChange = ({ target: { value } }) => {
    this.props.onAnswer({
      hasAnsweredYes: value,
      controlName: this.props.name,
    })
  }

  render() {
    const {
      children,
      label,
      name,
      value,
      style = {},
      verticalLayout,
      withChildrenOnNo,
    } = this.props
    return (
      <Container style={style} id={name}>
        <MainQuestionContainer
          style={{
            flexDirection: verticalLayout ? 'column' : 'row',
            textAlign: verticalLayout ? 'center' : 'left',
          }}
        >
          <QuestionLabel>{label}</QuestionLabel>
          <StyledFormControl component="fieldset" required error>
            <YesNoRadioGroup
              name={name}
              value={value}
              onAnswer={this.handleChange}
            />
          </StyledFormControl>
        </MainQuestionContainer>
        {!isNull(value) && value === !withChildrenOnNo && children}
      </Container>
    )
  }
}

export default DeclarationQuestion
