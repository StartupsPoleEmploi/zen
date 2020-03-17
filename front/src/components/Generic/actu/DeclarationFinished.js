import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import PrintIcon from '@material-ui/icons/Print'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'

import {
  primaryBlue,
  darkBlue,
  intermediaryBreakpoint,
} from '../../../constants'

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const Dot = styled.span`
  color: ${primaryBlue};
  font-family: serif;
  font-size: 3.5rem;
  font-weight: bold;
  margin-right: 2.5rem;
  position: relative;
  top: -5px;
`

const Section = styled.div`
  text-transform: uppercase;
  display: flex;
`

const UlEmployers = styled.ul`
  margin: 0;
  list-style: none;
  padding-left: 3.5rem;
`

const UlFiles = styled.ul`
  border-top: solid 1px lightgray;
  padding: 2rem 0;
  list-style: none;
  margin-top: 2rem;
  display: inline-block;

  @media (max-width: ${intermediaryBreakpoint}) {
    width: 100%;
  }
`

const FileLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: black;
  &:hover {
    text-decoration: underline;
    color: ${primaryBlue};
  }
`

const DECLARATION_FILE_URL = '/api/declarations/summary-file'

const DeclarationFinished = ({ declaration }) => {
  const [showPrintIframe, setShowPrintIframe] = useState(false)
  const iframeEl = useRef(null)

  const salary = Math.round(
    declaration.employers.reduce((prev, emp) => prev + emp.salary, 0),
  )

  function printDeclaration(e) {
    e.preventDefault()

    if (showPrintIframe) {
      try {
        iframeEl.current.contentWindow.print()
      } catch (err) {
        // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
        // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
        window.open(DECLARATION_FILE_URL, '_blank')
      }
    } else setShowPrintIframe(true)
  }

  function printIframeContent(e) {
    try {
      e.target.contentWindow.print()
    } catch (err) {
      // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
      // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
      window.open(DECLARATION_FILE_URL, '_blank')
    }
  }

  return (
    <>
      <Section>
        <div>
          <Typography
            className="declaration-status"
            style={{ marginBottom: '1rem' }}
          >
            <StyledDoneIcon />
            <strong>Actualisation envoyée</strong>
          </Typography>

          <div>
            <Typography
              component="h3"
              style={{ lineHeight: 1, color: darkBlue }}
            >
              <Dot>.</Dot>
              Mes employeurs
            </Typography>
            <Typography>
              <UlEmployers>
                {declaration.employers.map((emp) => (
                  <li key={emp.id}>
                    <strong>{emp.employerName}</strong>
                  </li>
                ))}
              </UlEmployers>
            </Typography>
          </div>
          <div>
            <Typography
              component="h3"
              style={{ lineHeight: 1, color: darkBlue }}
            >
              <Dot>.</Dot>
              Salaire brut déclaré
              <br />
            </Typography>
            <Typography style={{ marginLeft: '3.5rem' }}>
              <strong>{salary} €</strong>
            </Typography>
          </div>
        </div>
      </Section>

      <UlFiles>
        <Typography component="li" style={{ padding: '0 0 1rem 0' }}>
          <FileLink
            href="/api/declarations/summary-file?download=true"
            target="_blank"
            title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
          >
            <VerticalAlignBottomIcon
              style={{ color: primaryBlue, marginRight: '1rem' }}
            />
            Télécharger ma déclaration
          </FileLink>
        </Typography>

        <Typography component="li" style={{ padding: '0 0 1rem 0' }}>
          <FileLink href="#" onClick={printDeclaration}>
            <PrintIcon style={{ color: primaryBlue, marginRight: '1rem' }} />
            Imprimer ma déclaration
          </FileLink>
        </Typography>
      </UlFiles>

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
  )
}

DeclarationFinished.propTypes = {
  declaration: PropTypes.object.isRequired,
}

export default DeclarationFinished
