import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Typography, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import MessageOutlined from '@material-ui/icons/MessageOutlined';

import ComputerOutlinedIcon from '@material-ui/icons/ComputerOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import DnsOutlinedIcon from '@material-ui/icons/DnsOutlined';
import VerticalSplitOutlinedIcon from '@material-ui/icons/VerticalSplitOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import DonutLargeOutlinedIcon from '@material-ui/icons/DonutLargeOutlined';

import { primaryBlue } from '../../constants';
import { CustomDialog } from './CustomDialog';

import { hideHelpPopup } from '../../redux/actions/helpPopup';

const A = styled(Button)`
  && {
    width: 100%;
    height: 13rem;
    border: 1px #ddd solid;
    border-radius: 0.5rem;
    padding: 1rem;

    .MuiButton-label {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
      flex-direction: column;
    }
  }
`;

const MessageOutlinedIcon = styled(MessageOutlined)`
  && {
    color: ${primaryBlue};
    font-size: 2.8rem;
    margin-right: 0.5rem;
    margin-bottom: -0.5rem;
  }
`;

const Container = styled.div`
  margin-bottom: 1rem;
  margin: 0px -8px;
`;

// eslint-disable-next-line react/prop-types
function BlockItem({ Icon, text, section }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <A
        href={`https://zen.pole-emploi.fr/zen-doc/?${section}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon style={{
          marginBottom: '1rem', marginTop: '1rem', color: primaryBlue, fontSize: '4rem',
        }}
        />
        <Typography style={{ fontSize: '1.4rem' }}>{text}</Typography>
      </A>
    </Grid>
  );
}

function DialogHelp({ isOpened, onClose }) {
  return (
    <CustomDialog
      title={(
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageOutlinedIcon />
            CONTACTEZ-NOUS
          </div>
          <Typography style={{
            fontSize: '2rem', marginTop: '3rem', textAlign: 'left', textTransform: 'none',
          }}
          >
            Sur
            {' '}
            <b>quel sujet</b>
            {' '}
            porte votre demande ?
          </Typography>
        </div>
      )}
      titleId="HelpDialogContentText"
      fullWidth
      displayCancel
      isOpened={isOpened}
      content={(
        <Container>
          <Grid container spacing={2}>
            <BlockItem
              Icon={ComputerOutlinedIcon}
              text="S'actualiser sur Zen pour la première fois"
              section="cat=16"
            />
            <BlockItem
              Icon={AccountCircleOutlinedIcon}
              text="Mon compte"
              section="cat=22"
            />
            <BlockItem
              Icon={DescriptionOutlinedIcon}
              text="Ma déclaration"
              section="cat=17"
            />
            <BlockItem
              Icon={DnsOutlinedIcon}
              text="Mes employeurs"
              section="cat=18"
            />
            <BlockItem
              Icon={VerticalSplitOutlinedIcon}
              text="Mon actualisation"
              section="cat=19"
            />
            <BlockItem
              Icon={FileCopyOutlinedIcon}
              text="Mes justificatifs"
              section="cat=20"
            />
            <BlockItem
              Icon={DonutLargeOutlinedIcon}
              text="Mes allocations chomâge"
              section="cat=21"
            />
            <BlockItem
              Icon={EmailOutlinedIcon}
              text="Contactez Pôle emploi"
              section="p=298"
            />
          </Grid>
        </Container>
      )}
      onCancel={onClose}
      actions={<div style={{ marginTop: '1rem' }} />}
    />
  );
}

DialogHelp.propTypes = {
  onClose: PropTypes.func,
  isOpened: PropTypes.bool.isRequired,
};

export default connect(
  (state) => ({
    isOpened: state.helpPopup.isOpen,
  }),
  {
    onClose: hideHelpPopup,
  },
)(DialogHelp);
