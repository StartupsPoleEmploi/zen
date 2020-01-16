import React, { useEffect, useState } from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import CustomDialog from '../CustomDialog'
import DialogUser from './DialogUser'
import DialogActualisation from './DialogActualisation'

const ESCAPE_KEY_CODE = 27

function TabPanel(props) {
  // eslint-disable-next-line react/prop-types
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

/*
  This dialog's objective is to provide a better development experience.
  As such, unlike others components, it handles its own display logic
  and ajax calls in order not to pollute others parts of the code
  with dev-only logic.
  This should not be replicated to others components.
 */
export default function DeveloperDialog() {
  const [isDisplayed, setDisplayed] = useState(false)
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.keyCode !== ESCAPE_KEY_CODE) return

      setDisplayed(!isDisplayed)
    })
  }, [])

  if (!isDisplayed) return null

  return (
    <CustomDialog
      content={
        <div>
          <Tabs value={value} onChange={handleChange} >
            <Tab label="User"  />
            <Tab label="Actualisation" />
          </Tabs>
          <TabPanel value={value} index={0}>
            <DialogUser />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <DialogActualisation />
          </TabPanel>
        </div>
      }
      title="Modal Développeur"
      titleId="DevDialogContentText"
      isOpened
      onCancel={() => setDisplayed(false)}
    />
  )
}

