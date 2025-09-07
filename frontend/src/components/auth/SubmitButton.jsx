import React from 'react'
import { Button, useTheme } from '@mui/material'

const SubmitButton = ({ 
  children, 
  loading = false, 
  loadingText = "Loading...", 
  disabled = false,
  fullWidth = true,
  variant = "contained",
  size = "large",
  sx = {},
  ...props 
}) => {
  const theme = useTheme()

  const defaultSx = {
    py: 2,
    mb: 3,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
    ...sx
  }

  return (
    <Button
      type="submit"
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      disabled={loading || disabled}
      sx={defaultSx}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  )
}

export default SubmitButton