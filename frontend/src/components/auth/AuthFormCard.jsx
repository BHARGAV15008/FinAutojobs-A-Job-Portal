import React from 'react'
import { Card, CardContent } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}))

const AuthFormCard = ({ children, sx = {} }) => {
  return (
    <StyledCard sx={sx}>
      <CardContent sx={{ p: 4 }}>
        {children}
      </CardContent>
    </StyledCard>
  )
}

export default AuthFormCard