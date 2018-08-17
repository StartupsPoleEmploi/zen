import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

const Container = styled.li`
  padding: 1rem 0.8rem 1rem 2.4rem;
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
const StyledFormControlLabel = styled(FormControlLabel)`
  background-color: ${({ isSelected }) => (isSelected ? '#4b4b4b' : '#f0f0f0')};
  & > span {
    color: ${({ isSelected }) => (isSelected ? '#fff' : 'inherit')};
  }
  height: 3rem;
  padding-right: 1rem;
`

const FirstFormControlLabel = StyledFormControlLabel.extend`
  border-radius: 0.5rem 0 0 0.5rem;
`
const SecondFormControlLabel = StyledFormControlLabel.extend`
  border-radius: 0 0.5rem 0.5rem 0;
`

const StyledRadio = styled(Radio)`
  && {
    && {
      color: ${({ isSelected }) => (isSelected ? '#7dde8f' : 'inherit')};
      svg {
        font-size: 1.5rem;
      }
    }
  }
`

const getFormValue = (value) => (value === null ? value : value ? 'yes' : 'no')

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
      hasAnsweredYes: value === 'yes',
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
            <RadioGroup
              row
              aria-label="oui ou non"
              name="yesOrNo"
              value={getFormValue(value)}
              onChange={this.handleChange}
            >
              <FirstFormControlLabel
                value="yes"
                control={<StyledRadio isSelected={value} />}
                label="oui"
                isSelected={value}
              />
              <SecondFormControlLabel
                value="no"
                control={<StyledRadio isSelected={value === false} />}
                label="non"
                isSelected={value === false}
              />
            </RadioGroup>
          </FormControl>
        </MainQuestionContainer>
        {getFormValue(value) === (withChildrenOnNo ? 'no' : 'yes') &&
          children && <div>{children}</div>}
      </Container>
    )
  }
}

export default DeclarationQuestion
