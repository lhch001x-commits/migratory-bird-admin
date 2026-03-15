import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from '@supabase/supabase-js'

export type Account = {
  id: string
  name: string
  ownerId: string
  province?: string;
  city?: string;
  community_name?: string;
}

type AccountContextType = {
  currentAccount: Account | null
  setCurrentAccount: (account: Account) => void
  accounts: Account[]
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined)

type AccountProviderProps = {
  children: ReactNode
}

// 你可以将这些环境变量调整为你的 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function AccountProvider({ children }: AccountProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchAccounts() {
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('*')

      if (error) {
        console.error('Error fetching accounts:', error)
        return
      }

      if (data && isMounted) {
        const mapped: Account[] = data.map((row: any) => ({
          id: row.id,
          name: row.account_name, // 映射 account_name -> name
          ownerId: row.ownerId || row.id, // 兼容 ownerId 可能缺省
          province: row.province,
          city: row.city,
          community_name: row.community_name,
        }))
        setAccounts(mapped)
        if (!currentAccount && mapped.length > 0) {
          setCurrentAccount(mapped[0])
        }
      }
    }
    fetchAccounts()
    return () => {
      isMounted = false
    }
    // 不要把 currentAccount 放依赖，否则会重复运行
  }, [])

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
        accounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}