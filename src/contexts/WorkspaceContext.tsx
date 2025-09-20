import React, { createContext, useContext, useState, ReactNode } from 'react';

type WorkspaceType = 'personal' | 'business';

interface WorkspaceContextType {
  workspace: WorkspaceType;
  setWorkspace: (workspace: WorkspaceType) => void;
  toggleWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceType>('personal');

  const toggleWorkspace = () => {
    setWorkspace(prev => prev === 'personal' ? 'business' : 'personal');
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, toggleWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}