import React, { createContext, useContext, useCallback, useState } from 'react';

interface DataSyncContextType {
  triggerTransactionSync: () => void;
  transactionSyncKey: number;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const [transactionSyncKey, setTransactionSyncKey] = useState(0);

  const triggerTransactionSync = useCallback(() => {
    setTransactionSyncKey(prev => prev + 1);
  }, []);

  return (
    <DataSyncContext.Provider value={{ triggerTransactionSync, transactionSyncKey }}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
}
