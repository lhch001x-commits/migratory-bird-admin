"use client"

import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

type MessagePageProps = {
  onBack: () => void
}

export function MessagePage({ onBack }: MessagePageProps) {
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">消息中心</h2>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Bell className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">暂无消息</p>
        <p className="text-sm mt-2">新消息将会显示在这里</p>
      </div>
    </div>
  )
}
