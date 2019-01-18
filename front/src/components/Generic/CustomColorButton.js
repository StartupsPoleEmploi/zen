import { withStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import grey from '@material-ui/core/colors/grey'
import PropTypes from 'prop-types'
import React from 'react'

const styles = (theme) => ({
  greyButton: {
    color: theme.palette.getContrastText(grey[700]),
    backgroundColor: grey[700],
    '&:hover': {
      backgroundColor: grey[900],
    },
  },
})

const CustomColorButton = ({ classes, children, ...props }) => (
  <Button variant="contained" classes={{ root: classes.greyButton }} {...props}>
    {children}
  </Button>
)

CustomColorButton.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
}

export default withStyles(styles)(CustomColorButton)
