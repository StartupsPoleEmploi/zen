import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
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

const getFormValue = (value) => (value === null ? value : value ? 'yes' : 'no')

export class DeclarationQuestion extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onAnswer: PropTypes.func.isRequired,
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
                value={getFormValue(value)}
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
        {getFormValue(value) === (withChildrenOnNo ? 'no' : 'yes') &&
          children && <SubListItem>{children}</SubListItem>}
      </Fragment>
    )
  }
}

export default DeclarationQuestion
