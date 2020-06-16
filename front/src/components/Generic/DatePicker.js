import MomentUtils from '@date-io/moment';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { omit } from 'lodash';
import {
  DatePicker as MuiDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class DatePicker extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    name: PropTypes.string.isRequired,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    initialFocusedDate: PropTypes.instanceOf(Date),
  }

  handleDateChange = (momentDate) => {
    this.props.onSelectDate({
      controlName: this.props.name,
      date: momentDate.toDate(),
    });
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale="fr">
        <MuiDatePicker
          autoOk
          cancelLabel="Annuler"
          format="DD/MM/YYYY"
          onChange={this.handleDateChange}
          rightArrowIcon={<ChevronRight />}
          leftArrowIcon={<ChevronLeft />}
          maxDateMessage="La date doit faire partie du mois déclaré"
          minDateMessage="La date doit faire partie du mois déclaré"
          {...omit(this.props, 'onSelectDate')}
          value={
            this.props.value || null /* force null value with empty string */
          }
        />
      </MuiPickersUtilsProvider>
    );
  }
}
