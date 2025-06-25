import { ReactNode } from 'react'
import { ReactFlowProvider } from 'reactflow'

interface ReactFlowWrapperProps {
  children: ReactNode
}

/**
 * A wrapper component to ensure all ReactFlow instances have the required provider
 */
const ReactFlowWrapper = ({ children }: ReactFlowWrapperProps) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}

export default ReactFlowWrapper