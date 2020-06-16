import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import IconImage from '@material-ui/icons/Image';

function ValueLabelComponent({ children, open, value }) {
  const popperRef = React.useRef(null);
  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  return (
    <Tooltip
      PopperProps={{ popperRef }}
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={`${(value * 100).toFixed(0)}%`}
    >
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
};

export default function PDFSlider({ onChange, value }) {
  const [zoom, setZoom] = useState(value);

  React.useEffect(() => {
    setZoom(value);
  }, [value]);

  const onChangeSlide = (_, val) => {
    setZoom(val);
  };

  const onChangeCommitted = (_, val) => {
    setZoom(val);
    onChange(val);
  };

  return (
    <Grid container justify="center" spacing={2}>
      <Grid item xs={10} sm={8} md={4}>
        <Grid container justify="center" alignItems="center" spacing={2}>
          <Grid item>
            <IconImage style={{ fontSize: '2rem' }} color="primary" />
          </Grid>
          <Grid item xs={8}>
            <Slider
              defaultValue={zoom}
              value={zoom}
              min={0.1}
              max={1.9}
              step={0.1}
              onChange={onChangeSlide}
              onChangeCommitted={onChangeCommitted}
              ValueLabelComponent={ValueLabelComponent}
            />
          </Grid>
          <Grid item>
            <IconImage style={{ fontSize: '3rem' }} color="primary" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

PDFSlider.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
};
