import React, { useState, useEffect } from 'react'
import { Typography, CircularProgress } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import { H1 } from '../../components/Generic/Titles'

const StyledConseillersHelp = styled.div`
  background: #f3f4f5;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 15% 3rem 15%;
  margin: auto;
`

const StyledH1 = styled(H1)`
  && {
    padding-bottom: 2rem;
  }
`

function ConseillersHelp() {
  const history = useHistory()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/api/user/is-pro')
      if (body.status === 'Authorized') {
        setShowContent(true)
      } else {
        history.push('/')
      }
    }
    fetchData()
  }, [showContent, setShowContent])

  if (!showContent) {
    return <CircularProgress />
  }

  return (
    <StyledConseillersHelp>
      <Content>
        <StyledH1 style={{ fontSize: '3rem' }}>
          Aide pour les conseillers Pôle emploi
        </StyledH1>

        <Typography>Aide à destination des conseillers</Typography>

        <Typography>
          <strong>En construction</strong>
        </Typography>
      </Content>
    </StyledConseillersHelp>
  )
}

export default ConseillersHelp
