import {
  FormControl,
  FormControlLabel,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  RadioGroup,
} from '@material-ui/core'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

const classes = {} // FIXME REMOVE ME

const MainListItem = styled(ListItem)`
  && {
    padding-top: 1.5rem;
  }
`

const SubListItem = styled(ListItem)`
  && {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-top: 0;
  }
`

export class DeclarationQuestion extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onAnswer: PropTypes.func.isRequired,
    withChildrenOnNo: PropTypes.bool,
  }

  constructor(props) {
    super(props)

    this.state = { value: null }
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ value })
    this.props.onAnswer({
      hasAnsweredYes: value === 'yes',
      controlName: this.props.name,
    })
  }

  render() {
    const { children, label, withChildrenOnNo } = this.props
    return (
      <Fragment>
        <MainListItem>
          <ListItemText primary={label} />
          <ListItemSecondaryAction>
            <FormControl
              component="fieldset"
              required
              error
              className={classes.formControl}
            >
              <RadioGroup
                row
                aria-label="oui ou non"
                name="yesOrNo"
                className={classes.group}
                value={this.state.value}
                onChange={this.handleChange}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio color="primary" />}
                  label="Oui"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio color="primary" />}
                  label="Non"
                />
              </RadioGroup>
            </FormControl>
          </ListItemSecondaryAction>
        </MainListItem>
        {this.state.value === (withChildrenOnNo ? 'no' : 'yes') &&
          children && <SubListItem>{children}</SubListItem>}
      </Fragment>
    )
  }
}

export default DeclarationQuestion
