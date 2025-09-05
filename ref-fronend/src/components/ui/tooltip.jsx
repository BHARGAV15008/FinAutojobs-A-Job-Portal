import { createContext, useContext } from 'react'

const TooltipContext = createContext({})

export const TooltipProvider = ({ children, ...props }) => {
  return (
    <TooltipContext.Provider value={props}>
      {children}
    </TooltipContext.Provider>
  )
}

export const useTooltip = () => {
  return useContext(TooltipContext)
}