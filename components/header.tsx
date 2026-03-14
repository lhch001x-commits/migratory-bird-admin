"use client"

import { useAccount, MOCK_ACCOUNTS } from './account-context';
import { useState } from "react"
import { Bell, MapPin, User, LogOut, Plus, Check, ArrowRightLeft } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type HeaderProps = {
  onMessageClick: () => void
}

export function Header({ onMessageClick }: HeaderProps) {
  const [unreadCount] = useState(15)
  const { currentAccount, setCurrentAccount } = useAccount();
  return (
    <header className="h-14 bg-card border-b border-border pl-6 pr-14 flex items-center justify-end gap-6">
      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>广州-黄花岗社区</span>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-4 h-4" />
            <span>{currentAccount?.name || "HuangHuaGang_User 01"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {/* 账号列表区 */}
          {MOCK_ACCOUNTS.map((acc) =>
            acc.id === currentAccount.id ? (
              <DropdownMenuItem
                key={acc.id}
                className="flex items-center justify-start font-medium text-primary bg-orange-50"
              >
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span>{acc.name}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={acc.id}
                className="flex items-center justify-start"
                onClick={() => setCurrentAccount(acc)}
              >
                {/* 删除切换icon，仅左对齐账号 */}
                <span className="ml-6">{acc.name}</span>
              </DropdownMenuItem>
            )
          )}

          {/* 分割线 */}
          <DropdownMenuSeparator className="h-px bg-border" style={{ height: "1px" }} />

          {/* 添加账号按钮 */}
          <DropdownMenuItem
            className="flex items-center justify-start"
            disabled={MOCK_ACCOUNTS.length >= 3}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>添加账号</span>
          </DropdownMenuItem>

          {/* 再加一条分割线 */}
          <DropdownMenuSeparator className="h-px bg-border" style={{ height: "1px" }} />

          {/* 退出登录按钮 */}
          <DropdownMenuItem className="flex items-center justify-start cursor-pointer">
            <LogOut className="w-4 h-4 mr-2 " />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <button
        onClick={onMessageClick}
        className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-4 h-4" />
        <span>消息</span>
        {unreadCount > 0 && (
          <span className="absolute -top-[10px] left-10 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}
