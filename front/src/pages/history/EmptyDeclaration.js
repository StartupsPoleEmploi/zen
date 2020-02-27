import React from 'react'
import styled from 'styled-components'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { Typography } from '@material-ui/core'
import { intermediaryBreakpoint, mobileBreakpoint } from '../../constants'

const StyledCloseIcon = styled(CloseOutlinedIcon)`
  && {
    margin-right: 0.5rem;
    display: inline-block;
    vertical-align: bottom;
    color: gray;
  }
`

const Row = styled.div`
  display: flex;
  align-self: center;
  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column;
    text-align: center;
  }
  @media (max-width: ${mobileBreakpoint}) {
    padding: 1rem 1rem 1rem 0;
    justify-content: left;
    text-align: left;
  }
`

const Cell = styled.div`
  flex: 1;
  padding: 2rem 1rem;
  @media (max-width: ${intermediaryBreakpoint}) {
    justify-content: center;
  }
  @media (max-width: ${mobileBreakpoint}) {
    justify-content: flex-start;
    padding: 0;
    border: none;
  }
`

const NoDataCell = styled(Cell)`
  && {
    border-left: solid 1px #ddd;
    text-align: center;

    @media (max-width: ${intermediaryBreakpoint}) {
      border-left: none;
      border-top: solid 1px #ddd;
    }
    @media (max-width: ${mobileBreakpoint}) {
      border: none;
      text-align: left;
      padding: 0.5rem 0 0 3rem;
    }
  }
`

const EmptyCell = styled(Cell)`
  padding: 2rem 1rem;
  @media (max-width: ${intermediaryBreakpoint}) {
    display: none;
  }
`

function EmptyDeclaration() {
  return (
    <Row>
      <Cell className="status" style={{ display: 'flex' }}>
        <StyledCloseIcon />
        <Typography>Pas d'actualisation sur Zen</Typography>
      </Cell>

      <NoDataCell className="text">
        <Typography>Aucune information sur Zen</Typography>
      </NoDataCell>

      <EmptyCell style={{ borderLeft: 'solid 1px #ddd' }} />
    </Row>
  )
}

export default EmptyDeclaration
