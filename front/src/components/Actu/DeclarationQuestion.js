import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import { isNull } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import YesNoRadioGroup from '../Generic/YesNoRadioGroup'

const Container = styled.li`
  padding: 1rem 2.4rem 1rem;
`

const MainQuestionContainer = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    flex-wrap: wrap;
  }
`

const QuestionLabel = styled(Typography)`
  && {
    flex: 0 0 66%;
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
  }

  handleChange = ({ target: { value } }) => {
    this.props.onAnswer({
      hasAnsweredYes: value,
      controlName: this.props.name,
    })
  }

  render() {
    const { children, label, value, withChildrenOnNo } = this.props
    return (
      <Container>
        <MainQuestionContainer>
          <QuestionLabel>{label}</QuestionLabel>
          <FormControl component="fieldset" required error>
            <YesNoRadioGroup
              name="yesOrNo"
              value={value}
              onAnswer={this.handleChange}
            />
          </FormControl>
        </MainQuestionContainer>
        {!isNull(value) &&
          value === !withChildrenOnNo &&
          children && <div>{children}</div>}
      </Container>
    )
  }
}

export default DeclarationQuestion
