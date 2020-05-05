import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styled from 'styled-components'
import { Typography, Grid } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import PrintIcon from '@material-ui/icons/Print'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'
import withWidth from '@material-ui/core/withWidth'
import NumberFormat from 'react-number-format'

import { primaryBlue } from '../../../constants'
import { ActuStatusBlock, ActuHr } from './ActuGenericComponent'

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
const Hr = styled.div`
  width: 0.3rem;
  height: 100%; 
  background-color: #ffffff;
  margin: ${({ width }) => {
    if (['xs', 'sm', 'md'].includes(width)) return '0 2rem;'
    return '0 4rem;'
  }};
`


const Block = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const DECLARATION_FILE_URL = '/api/declarations/summary-file'

const DeclarationFinished = ({ declaration, width }) => {
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
      <Grid container spacing={2}>
        <Grid item sm={12} md={6} lg={5}>
          <ActuStatusBlock title="Actualisation envoyée" Icon={<DoneIcon style={{color: "green"}}/>}>
            <Typography>
              Le {moment(declaration.transmitedAt).format('DD/MM/YYYY à HH:mm')}
            </Typography>
          </ActuStatusBlock>
        </Grid>
        <Grid item sm={12} md={6}>
          <Typography  style={{ padding: '0 0 1rem 0' }}>
            <FileLink
              href="/api/declarations/summary-file?download=true"
              target="_blank"
              title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
            >
              <VerticalAlignBottomIcon style={{ color: primaryBlue, marginRight: '1rem' }}/>
              Télécharger ma déclaration
            </FileLink>
          </Typography>

          <Typography  style={{ padding: '0 0 1rem 0' }}>
            <FileLink href="#" onClick={printDeclaration}>
              <PrintIcon style={{ color: primaryBlue, marginRight: '1rem' }} />
              Imprimer ma déclaration
            </FileLink>
          </Typography>
        </Grid>
      </Grid>
      <ActuHr/>
      <div style={{margin: '2rem auto 2rem auto'}}>
        <Grid container >
          <Grid item xs={5} sm={4} md={4} lg={3} justify="center" alignItems="center">
            <Block>
              <div>
                <Typography>Employeur(s)</Typography>
                <Typography variant="h2" style={{lineHeight: '1'}}>
                  {declaration.employers.length}
                </Typography>
              </div>
            </Block>
          </Grid>
          <Grid item ><Hr width={width}/></Grid>
          <Grid item xs={5} sm={4}>
            <Block>
              <div>
                <Typography>Rémunération déclarée</Typography>
                <Typography variant="h2" style={{lineHeight: '1'}}>
                  <NumberFormat
                    thousandSeparator=" "
                    decimalSeparator=","
                    decimalScale={0}
                    fixedDecimalScale
                    displayType="text"
                    value={salary}
                  />{' '}€
                </Typography>
              </div>
            </Block>
          </Grid>
        </Grid>
      </div>

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
  width: PropTypes.string.isRequired,
}

export default withWidth()(DeclarationFinished)
