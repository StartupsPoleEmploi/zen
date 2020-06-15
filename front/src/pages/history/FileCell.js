import React, { useRef, useState } from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import PrintIcon from '@material-ui/icons/Print';

import {
  intermediaryBreakpoint,
  mobileBreakpoint,
  primaryBlue,
} from '../../constants';

const Cell = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 1rem;
  height: 100%;
  @media (max-width: ${intermediaryBreakpoint}) {
    justify-content: center;
    padding: 2rem;
  }
  @media (max-width: ${mobileBreakpoint}) {
    justify-content: left;
    padding: 0;
  }
`;

const StyledFileCell = styled(Cell)`
  && {
    border-left: solid 1px #ddd;
    padding-left: 3rem;
    flex-direction: column;
    align-items: flex-start;

    @media (max-width: ${intermediaryBreakpoint}) {
      border-left: none;
      align-items: center;
      border-top: solid 1px #ddd;
    }
    @media (max-width: ${mobileBreakpoint}) {
      align-items: flex-start;
      border-top: solid 1px #ececec;
      padding: 2rem 1rem 1rem 0rem;
    }
  }
`;

const ActionLink = styled.a`
  display: flex;
  color: black;
  text-decoration: none;
  color: black;
  &:first-child {
    padding-bottom: 1rem;
  }
  &:hover {
    text-decoration: underline;
  }
`;

const FileCell = ({ declaration }) => {
  const [showPrintIframe, setShowPrintIframe] = useState(false);
  const iframeEl = useRef(null);

  // Missing justificatifs
  const DECLARATION_FILE_URL = `/api/declarations/summary-file?id=${declaration.id}`;

  function printDeclaration(e) {
    e.preventDefault();

    if (showPrintIframe) {
      try {
        iframeEl.current.contentWindow.print();
      } catch (err) {
        // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
        // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
        window.open(DECLARATION_FILE_URL, '_blank');
      }
    } else setShowPrintIframe(true);
  }

  function printIframeContent(e) {
    try {
      e.target.contentWindow.print();
    } catch (err) {
      // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
      // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
      window.open(DECLARATION_FILE_URL, '_blank');
    }
  }

  return (
    <>
      <StyledFileCell className="download">
        <ActionLink
          href={`/api/declarations/summary-file?download=true&id=${declaration.id}`}
          target="_blank"
          title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
        >
          <VerticalAlignBottomIcon
            style={{ color: primaryBlue, marginRight: '1rem' }}
          />
          <Typography>Télécharger ma déclaration</Typography>
        </ActionLink>

        <ActionLink href="#" onClick={printDeclaration}>
          <PrintIcon style={{ color: primaryBlue, marginRight: '1rem' }} />
          <Typography>Imprimer ma déclaration</Typography>
        </ActionLink>
      </StyledFileCell>

      {showPrintIframe && (
        <iframe
          src={DECLARATION_FILE_URL}
          title="Aucun contenu (dispositif technique)"
          style={{ display: 'none' }}
          ref={iframeEl}
          id="declarationIframe"
          onLoad={printIframeContent}
        />
      )}
    </>
  );
};

FileCell.propTypes = {
  declaration: PropTypes.object,
};

export default FileCell;
