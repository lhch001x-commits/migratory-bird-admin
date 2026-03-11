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
          {/* <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-primary-foreground"
            fill="currentColor"
          >
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 8v8l-6 3.5L6 16V8l6-3.5z" />
          </svg> */}
          <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="256" 
          height="256" 
          viewBox="0 0 256 256" 
          fill="none">
            <rect width="256" height="256" rx="37.7037" fill="#FF802D"/>
            <path d="M136.007 176.175C147.584 162.944 150.938 144.936 151.168 137.585L93.2793 145.854C100.997 178.381 142.897 216.833 162.882 231.994C140.28 201.673 135.548 182.148 136.007 176.175Z" fill="#37221B"/>
            <path d="M129.381 46.005C116.634 44.671 108.89 44.0923 102.229 43.8626C86.7935 30.6316 73.2863 42.025 68.4621 49.3755C49.1669 67.9817 48.2656 113.794 59.5039 141.717C72.0869 172.981 119.686 211.777 144.954 227.167C115.735 199.603 109.809 176.632 110.498 168.592C193.743 117.322 206.285 51.2132 202.15 24.5674C181.201 57.6449 127.267 88.4254 102.918 99.681C100.161 122.422 88.446 126.556 78.7989 123.8C63.2006 119.343 61.5709 94.3977 62.9487 80.3857C64.4029 67.7897 72.1818 57.9221 77.2354 55.8547C79.7621 57.6924 86.7867 60.4056 92.2996 58.7517C97.8126 57.0978 102.229 53.0508 103.607 50.7538C106.363 48.5486 120.69 47.1638 129.381 46.005Z" fill="white"/>
            <path d="M83.6063 44.2689C86.7073 43.0209 91.7179 41.9513 97.402 44.8295C94.0354 48.3247 86.5033 48.9041 83.6063 44.2689Z" fill="#F0872F"/>
          </svg>
        </div>
        <div>
          <h1 className="text-primary font-semibold">鹭源</h1>
          <p className="text-xs text-muted-foreground">候鸟式养老服务运营后台</p>
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
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base transition-colors",
                  isActive
                    ? "text-foreground/70 font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(isActive && "text-foreground/70")}>
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
