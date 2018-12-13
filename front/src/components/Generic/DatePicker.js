import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Keyboard from '@material-ui/icons/Keyboard'
import MuiDatePicker from 'material-ui-pickers/DatePicker'
import MomentUtils from 'material-ui-pickers/utils/moment-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styled from 'styled-components'

const StyledMuiDatePicker = styled(MuiDatePicker)`
  && {
    padding-right: 1rem;
  }
`

export default class DatePicker extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    name: PropTypes.string.isRequired,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
  }

  handleDateChange = (momentDate) => {
    this.props.onSelectDate({
      controlName: this.props.name,
      date: momentDate.toDate(),
    })
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="fr">
        <StyledMuiDatePicker
          autoOk
          cancelLabel="Annuler"
          label={this.props.label}
          format="DD/MM/YYYY"
          onChange={this.handleDateChange}
          value={this.props.value || null}
          rightArrowIcon={<ChevronRight />}
          leftArrowIcon={<ChevronLeft />}
          keyboardIcon={<Keyboard />}
          maxDate={this.props.maxDate}
          minDate={this.props.minDate}
          maxDateMessage="La date doit faire partie du mois déclaré"
          minDateMessage="La date doit faire partie du mois déclaré"
        />
      </MuiPickersUtilsProvider>
    )
  }
}
