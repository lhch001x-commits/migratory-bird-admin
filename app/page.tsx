"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ElderlyTable } from "@/components/elderly-table"
import { ElderlyEditSheet } from "@/components/elderly-edit-sheet"
import { MessagePage } from "@/components/message-page"

export type MenuItem = {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

export type ElderlyPerson = {
  id: string
  name: string
  age: number
  gender: "男" | "女"
  hometown: string
  originalCommunity: string
  phone: string
  status: "待抵达" | "居住中" | "已返乡"
  targetCommunity: string
  volunteerLevel: "候鸟老年人才" | "候鸟老年志愿者" | "普通候鸟老人"
  spouseLiving?: "是" | "否"
  spouseName?: string
  emergencyContact?: string
  emergencyRelation?: "子女" | "朋友" | "配偶"
  emergencyPhone?: string
  residenceStartDate?: string
  residenceEndDate?: string
  originalProvince?: string
  originalCity?: string
  targetProvince?: string
  targetCity?: string
  healthStatus?: "完全自理" | "半自理"
  healthNote?: string
  hobbies?: string
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("migrate-in")
  const [editingPerson, setEditingPerson] = useState<ElderlyPerson | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  const handleEdit = (person: ElderlyPerson) => {
    setEditingPerson(person)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingPerson(null)
    setIsAddingNew(true)
  }

  const handleCloseSheet = () => {
    setEditingPerson(null)
    setIsAddingNew(false)
  }

  const handleSave = (data: Partial<ElderlyPerson>) => {
    console.log("保存数据:", data)
    handleCloseSheet()
  }

  const handleMessageClick = () => {
    setShowMessages(true)
  }

  const handleBackFromMessages = () => {
    setShowMessages(false)
  }

  const renderContent = () => {
    if (showMessages) {
      return <MessagePage onBack={handleBackFromMessages} />
    }

    if (activeMenu === "migrate-in" || activeMenu === "migrate-out") {
      const title = activeMenu === "migrate-in" ? "迁入候鸟老人" : "迁出候鸟老人"
      return (
        <ElderlyTable
          title={title}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
        />
      )
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>MVP2.0 版本即将推出，敬请期待</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMessageClick={handleMessageClick} />
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-card rounded-lg shadow-sm h-full">
            {renderContent()}
          </div>
        </main>
      </div>
      <ElderlyEditSheet
        open={!!editingPerson || isAddingNew}
        onClose={handleCloseSheet}
        person={editingPerson}
        isNew={isAddingNew}
        onSave={handleSave}
      />
    </div>
  )
}
