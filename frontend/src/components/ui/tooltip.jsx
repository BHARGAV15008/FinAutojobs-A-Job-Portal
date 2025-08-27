import * as React from "react"

const TooltipContext = React.createContext({})

function TooltipProvider({ children }) {
  const [tooltip, setTooltip] = React.useState(null)

  return (
    <TooltipContext.Provider value={{ tooltip, setTooltip }}>
      {children}
      {tooltip && (
        <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black rounded shadow-sm">
          {tooltip}
        </div>
      )}
    </TooltipContext.Provider>
  )
}

function Tooltip({ children, content }) {
  const { setTooltip } = React.useContext(TooltipContext)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleMouseEnter = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
    setTooltip(content)
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return React.cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  })
}

export { TooltipProvider, Tooltip }