import React, { createContext, useContext, useState, type ReactNode } from "react"

// 1. MOCK_ACCOUNTS 常量，带 ownerId 字段
export type Account = {
  id: string
  name: string
  ownerId: string
}

export const MOCK_ACCOUNTS: Account[] = [
  { id: "account_01", name: "黄花岗_User 01", ownerId: "account_01" },
  { id: "account_02", name: "桥东_User 02", ownerId: "account_02" },
]

// 2. 创建并导出 AccountContext
type AccountContextType = {
  currentAccount: Account
  setCurrentAccount: (account: Account) => void
  accounts: Account[]
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined)

// 3. 创建并导出 AccountProvider 组件
type AccountProviderProps = {
  children: ReactNode
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [currentAccount, setCurrentAccount] = useState<Account>(MOCK_ACCOUNTS[0])

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
        accounts: MOCK_ACCOUNTS,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

// 4. 创建并导出 useAccount 便捷 Hook
export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}