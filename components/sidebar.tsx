"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Gift,
  Megaphone,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"

type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  children?: { id: string; label: string }[]
}

type SidebarProps = {
  activeMenu: string
  onMenuChange: (menuId: string) => void
}

const menuItems: MenuItem[] = [
  {
    id: "info-management",
    label: "信息管理",
    icon: <ClipboardList className="w-5 h-5" />,
    children: [
      { id: "migrate-in", label: "迁入候鸟老人" },
      { id: "migrate-out", label: "迁出候鸟老人" },
    ],
  },
  {
    id: "activity-management",
    label: "活动宣发管理",
    icon: <Megaphone className="w-5 h-5" />,
    children: [
      { id: "activity-operation", label: "活动运营管理" },
      { id: "activity-approval", label: "活动审批管理" },
    ],
  },
  {
    id: "points-management",
    label: "积分兑换管理",
    icon: <Gift className="w-5 h-5" />,
    children: [
      { id: "points-record", label: "积分兑换服务记录" },
      { id: "exchange-service", label: "兑换服务管理" },
    ],
  },
  {
    id: "push-management",
    label: "推送管理",
    icon: <Send className="w-5 h-5" />,
  },
]

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["info-management"])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isMenuActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some((child) => child.id === activeMenu)
    }
    return item.id === activeMenu
  }

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-primary-foreground"
            fill="currentColor"
          >
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 8v8l-6 3.5L6 16V8l6-3.5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-primary font-semibold">鹭源</h1>
          <p className="text-xs text-muted-foreground">后台管理系统</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = isMenuActive(item)
          const isExpanded = expandedMenus.includes(item.id)

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.id)
                  } else {
                    onMenuChange(item.id)
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(isActive && "text-foreground")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <span className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                )}
              </button>

              {/* Sub-menu */}
              {item.children && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = child.id === activeMenu
                    return (
                      <button
                        key={child.id}
                        onClick={() => onMenuChange(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          isChildActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {child.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
