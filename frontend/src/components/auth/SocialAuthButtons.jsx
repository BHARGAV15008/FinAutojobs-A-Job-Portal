import React from 'react'
import { Grid, Button, Divider, Typography } from '@mui/material'
import { Google, Microsoft, Apple } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.primary.main,
  },
}))

const SocialAuthButtons = ({ label = "Or continue with" }) => {
  return (
    <>
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <SocialButton fullWidth variant="outlined">
            <Google sx={{ color: '#4285F4' }} />
          </SocialButton>
        </Grid>
        <Grid item xs={4}>
          <SocialButton fullWidth variant="outlined">
            <Microsoft sx={{ color: '#00BCF2' }} />
          </SocialButton>
        </Grid>
        <Grid item xs={4}>
          <SocialButton fullWidth variant="outlined">
            <Apple sx={{ color: '#000' }} />
          </SocialButton>
        </Grid>
      </Grid>
    </>
  )
}

export default SocialAuthButtons