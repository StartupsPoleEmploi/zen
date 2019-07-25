import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import { isNull } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import YesNoRadioGroup from '../Generic/YesNoRadioGroup'
import { mobileBreakpoint } from '../../constants'

const Container = styled.li`
  padding: 1rem 2.4rem 1rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding: 1rem 2.4rem 2.5rem;
  }
`

const MainQuestionContainer = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;

    @media (max-width: ${mobileBreakpoint}) {
      flex-direction: column;
    }
  }
`

const QuestionLabel = styled(Typography)`
  && {
    flex-shrink: 1;
  }
`

const StyledFormControl = styled(FormControl)`
  && {
    flex-shrink: 0;
    padding-left: 1rem;

    @media (max-width: ${mobileBreakpoint}) {
      padding: 1rem 0 0 0;
    }
  }
`

export class DeclarationQuestion extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onAnswer: PropTypes.func.isRequired,
    value: PropTypes.bool,
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
      withChildrenOnNo,
    } = this.props
    return (
      <Container style={style} id={name}>
        <MainQuestionContainer>
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
