"use client"

import { useState } from "react"
import { Bell, MapPin, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type HeaderProps = {
  onMessageClick: () => void
}

export function Header({ onMessageClick }: HeaderProps) {
  const [unreadCount] = useState(15)

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-end gap-6">
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
            <span>HuangHuaGang_User 01</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
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
