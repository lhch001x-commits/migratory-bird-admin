"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ElderlyTable } from "@/components/elderly-table"
import { ElderlyEditSheet } from "@/components/elderly-edit-sheet"
import { MessagePage } from "@/components/message-page"
import { useAppToast } from "@/components/app-toast"
import { AccountProvider } from '@/components/account-context';
import { supabase } from "@/lib/supabase"

// 🚀 版本弹窗组件
function VersionModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
      role="button"
      tabIndex={0}
      aria-label="点击关闭"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-0 w-[340px] sm:w-[380px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
          <div className="flex justify-between items-start px-5 pt-5 pb-1">
            <div className="flex-1 flex flex-col">
              {/* <div className="text-lg font-bold text-gray-900 mb-1 ml-1">版本说明</div> */}
              <div className="mt-1">
                {/* 修改1：头部标签，使用更明亮的浅橙背景和深橙文字 */}
                <span className="inline-block px-2 py-[2px] bg-orange-100 text-xs text-orange-600 rounded font-medium align-middle">
                  版本说明
                </span>
                {/* <span className="ml-2 text-gray-400 text-xs align-middle">版本说明</span> */}
              </div>
              {/* ↓↓↓ 控制两者纵向间距的定义 (mt-6) ↓↓↓ */}
              <span className="font-bold text-[14px] ml-[8px] mb-2 inline-block text-gray-700 mt-2">V1.0-候鸟老人信息管理闭环</span>
              {/* ↑↑↑ 控制两者纵向间距的定义 (mt-6) ↑↑↑ */}
            </div>
            
            {/* 右上角氛围图 */}
            <div className="flex-shrink-0 pt-1 pl-8">
            <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
              >
                {/* 笔记本外框 */}
                <rect
                  x="10"
                  y="8"
                  width="28"
                  height="32"
                  rx="4"
                  ry="4"
                  fill="#FFEDD5"      /* 浅橙背景 */
                  stroke="#F97316"    /* 主色橙色边框 */
                  strokeWidth="2"
                />
                {/* 左侧装订条 */}
                <rect
                  x="12"
                  y="10"
                  width="4"
                  height="28"
                  rx="2"
                  fill="#FDBA74"      /* 次级橙色 */
                />
                {/* 横线 */}
                <line x1="19" y1="16" x2="34" y2="16" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="19" y1="21" x2="34" y2="21" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="19" y1="26" x2="30" y2="26" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round" />
                {/* 右下角小折角 */}
                <path
                  d="M34 32L30 36H34C35.1046 36 36 35.1046 36 34V30L34 32Z"
                  fill="#FDBA74"
                />
              </svg>
            </div>
          </div>

          {/* Main Content: 功能介绍区域 */}
          <div className="px-5 pb-4 pt-1 text-gray-700 text-sm leading-relaxed">
            <ol className="pl-4 space-y-1 list-decimal">
              <ol className="pl-4 space-y-1 list-decimal">
                {/* <span className="font-bold text-[14px] ml-[-24px] mb-2 inline-block">支持功能：</span> */}
                <li><b>全维档案管理</b>：支持候鸟老人信息的增/删/改/查</li>
                <li><b>智能批量导入</b>：Excel一键上传,自动清洗格式极速入库</li>
                <li className="mb-4"><b>跨域自动流转</b>：上传数据即刻同步至对应迁入地社区</li>
                {/* <div className="flex justify-center my-4">
                  <hr className="w-3/5 border-gray-500" />
                </div> */}
                {/* <span className="block mt-4">右上角，可切换至“迁入地-社区”账号查验对应数据流转</span> */}
              </ol>
            </ol>
          </div>

          {/* Footer: 底部按钮 */}
          <div className="flex px-5 pb-5 pt-2">
            {/* 修改3：底部按钮改为实心橙色，Hover时颜色加深 */}
            <button
              className="flex-1 py-2 rounded font-semibold text-white bg-orange-500 "
              onClick={onClose}
              style={{ border: "none" }}
            >
              我知道了，去体验
            </button>
          </div>
      </div>
    </div>
  );
}

export type MenuItem = {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

export type ElderlyPerson = {
  id: string
  ownerId: string
  // user_id: string
  userId?: string;
  idCard: string
  name: string
  age: number
  gender: "男" | "女"
  hometown: string
  originalProvince: string
  originalCity: string
  originalCommunity: string
  phone: string
  status: "待抵达" | "居住中" | "已返乡"
  targetProvince: string
  targetCity: string
  targetCommunity: string
  targetAddress: string
  medicalInsuranceStatus: "已备案" | "未备案"
  volunteerLevel: "候鸟老年人才" | "候鸟老年志愿者" | "普通候鸟老人"
  spouseLiving?: "是" | "否"
  spouseName?: string
  emergencyContact?: string
  emergencyRelation?: "子女" | "朋友" | "配偶"
  emergencyPhone?: string
  residenceStartDate?: string
  residenceEndDate?: string
  healthStatus?: "完全自理" | "半自理"
  healthNote?: string
  hobbies?: string
  is_read?: boolean
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("migrate-out")
  const [editingPerson, setEditingPerson] = useState<ElderlyPerson | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { showToast } = useAppToast()

  // 页面加载后（客户端挂载完成）再显示版本弹窗，确保一刷新就能看到
  useEffect(() => {
    setShowVersionModal(true)
  }, [])

  // useEffect(() => {
  //   showToast({
  //     title: "提示",
  //     description: "MVP1.0 仅支持信息管理功能",
  //     duration: 3000,
  //   })
  // }, [showToast])

  const handleEdit = async (person: ElderlyPerson) => {
    setEditingPerson(person)
    setIsAddingNew(false)

    if (tableMode === "in" && !person.is_read) {
      const { error } = await supabase
        .from("elderly_info")
        .update({ is_read: true })
        .eq("id", person.id)

      if (!error) {
        setRefreshTrigger((prev) => prev + 1)
      } else {
        showToast({
          description: "已进入编辑，但未读状态更新失败：" + error.message,
          duration: 3000,
        })
      }
    }
  }

  const handleAddNew = () => {
    setEditingPerson(null)
    setIsAddingNew(true)
  }

  const handleCloseSheet = () => {
    setEditingPerson(null)
    setIsAddingNew(false)
  }

  const handleSave = async (data: Partial<ElderlyPerson>) => {
    console.log("保存数据:", data)
    handleCloseSheet()
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleMessageClick = () => {
    setShowMessages(true)
  }

  const handleBackFromMessages = () => {
    setShowMessages(false)
  }

  // 由activeMenu推导tableMode
  const tableMode = activeMenu === 'migrate-in' ? 'in' : 'out'

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
          mode={tableMode}
          refreshTrigger={refreshTrigger}
          onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
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
    <AccountProvider>
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
        <VersionModal
          open={showVersionModal}
          onClose={() => setShowVersionModal(false)}
        />
      </div>
    </AccountProvider>
  )
}
