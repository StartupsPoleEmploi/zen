import React, { Component } from 'react'
import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import LoadingDialog from './LoadingDialog'
import ErrorsDialog from './ErrorsDialog'
import ConsistencyErrorsDialogs from './ConsistencyErrorsDialog'
import DeclarationSummaryDialog from './DeclarationSummaryDialog'

class DeclarationDialogsHandler extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isOpened: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    consistencyErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    validationErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    declaration: PropTypes.object,
    employers: PropTypes.arrayOf(PropTypes.object),
  }

  confirmAndIgnoreErrors = () => this.props.onConfirm({ ignoreErrors: true })

  render() {
    const {
      isLoading,
      isOpened,
      consistencyErrors,
      validationErrors,
      onCancel,
      declaration,
      employers,
    } = this.props

    const defaultProps = {
      title: "Envoi de l'actualisation",
      titleId: 'ActuDialogContentText',
      isOpened,
      onCancel,
    }

    if (isLoading) {
      return <LoadingDialog {...defaultProps} />
    }

    if (validationErrors.length > 0) {
      return (
        <ErrorsDialog validationErrors={validationErrors} {...defaultProps} />
      )
    }

    if (consistencyErrors.length > 0) {
      return (
        <ConsistencyErrorsDialogs
          consistencyErrors={consistencyErrors}
          confirmAndIgnoreErrors={this.confirmAndIgnoreErrors}
          {...defaultProps}
        />
      )
    }

    if (!isEmpty(declaration)) {
      return (
        <DeclarationSummaryDialog
          declaration={declaration}
          employers={employers}
          onConfirm={this.props.onConfirm}
          {...defaultProps}
        />
      )
    }

    return null
  }
}

export default DeclarationDialogsHandler
