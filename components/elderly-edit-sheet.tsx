"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ElderlyPerson } from "@/app/page"
import { cn } from "@/lib/utils"
import { useAppToast } from "@/components/app-toast"

type ElderlyEditSheetProps = {
  open: boolean
  onClose: () => void
  person: ElderlyPerson | null
  isNew: boolean
  onSave: (data: Partial<ElderlyPerson>) => void
}

const getVolunteerLevelLabel = (level: string | undefined) => {
  if (!level) return ""
  switch (level) {
    case "候鸟老年人才":
      return "（候鸟老年人才）"
    case "候鸟老年志愿者":
      return "（候鸟老年志愿者）"
    case "普通候鸟老人":
      return "（普通候鸟老人）"
    default:
      return ""
  }
}

export function ElderlyEditSheet({
  open,
  onClose,
  person,
  isNew,
  onSave,
}: ElderlyEditSheetProps) {
  const [formData, setFormData] = useState<Partial<ElderlyPerson>>({})
  const [error, setError] = useState<{field: string; msg: string} | null>(null)
  const errorField = error?.field ?? null
  const { showToast } = useAppToast()

  useEffect(() => {
    if (person) {
      setFormData(person)
    } else {
      setFormData({
        emergencyRelation: "子女",
      })
    }
  }, [person, open])

  // 清空错误状态: 弹窗关闭时
  useEffect(() => {
    if (!open) setError(null)
  }, [open])

  const handleSave = () => {
    const isEmpty = (val: unknown): boolean =>
      val === undefined || val === null || String(val).trim() === ''

    const block = (field: string, msg: string = '此为必填项') => {
      setError({ field, msg })
      document.getElementById('field-' + field)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return true
    }

    if (isNew) {
      if (isEmpty(formData.idCard)) { if (block('idCard')) return }
      else if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2][1-9]|10|20|30|31)\d{3}[0-9Xx]$/.test(formData.idCard || '')) { if (block('idCard', '请输入正确的18位身份证号')) return }
    }
    if (isEmpty(formData.name)) { if (block('name')) return }
    if (isEmpty(formData.age)) { if (block('age')) return }
    if (isEmpty(formData.gender)) { if (block('gender')) return }
    if (isEmpty(formData.phone)) { if (block('phone')) return }
    else if (!/^1[3-9]\d{9}$/.test(formData.phone || '')) { if (block('phone', '请输入11位正确手机号')) return }
    if (isEmpty(formData.spouseLiving)) { if (block('spouseLiving')) return }
    if (formData.spouseLiving === '是' && isEmpty(formData.spouseName)) { if (block('spouseName')) return }
    if (isEmpty(formData.emergencyContact)) { if (block('emergencyContact')) return }
    if (isEmpty(formData.emergencyPhone)) { if (block('emergencyPhone')) return }
    else if (!/^1[3-9]\d{9}$/.test(formData.emergencyPhone || '')) { if (block('emergencyPhone', '请输入11位正确手机号')) return }
    if (isEmpty(formData.status)) { if (block('status')) return }
    if (isEmpty(formData.residenceStartDate)) { if (block('residenceStartDate')) return }
    if (isEmpty(formData.residenceEndDate)) { if (block('residenceEndDate')) return }
    if (isEmpty(formData.originalProvince)) { if (block('originalProvince')) return }
    if (isEmpty(formData.originalCity)) { if (block('originalCity')) return }
    if (isEmpty(formData.originalCommunity)) { if (block('originalCommunity')) return }
    if (isEmpty(formData.targetProvince)) { if (block('targetProvince')) return }
    if (isEmpty(formData.targetCity)) { if (block('targetCity')) return }
    if (isEmpty(formData.targetCommunity)) { if (block('targetCommunity')) return }
    if (isEmpty(formData.targetAddress)) { if (block('targetAddress')) return }
    if (isEmpty(formData.healthStatus)) { if (block('healthStatus')) return }
    if (isEmpty(formData.medicalInsuranceStatus)) { if (block('medicalInsuranceStatus')) return }
    if (isEmpty(formData.hobbies)) { if (block('hobbies')) return }

    onSave(formData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-[450px] bg-card shadow-xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isNew ? "新增候鸟老人信息" : "候鸟老人信息编辑"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">

          {/* 用户编号 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              用户编号：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-user_id">
              <Input
                value={formData.user_id || "保存后，由系统自动生成"}
                disabled
                className="w-56"
              />
              {error?.field === 'user_id' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 身份证号 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              身份证号：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-idCard">
              <div className="flex items-center gap-2">
                <Input
                  value={
                    isNew
                      ? formData.idCard || ""
                      : formData.idCard
                      ? formData.idCard.slice(0, 6) + "************"
                      : ""
                  }
                  onChange={
                    isNew
                      ? (e) => {
                          setError(null)
                          setFormData({ ...formData, idCard: e.target.value })
                        }
                      : undefined
                  }
                  disabled={!isNew}
                  className="w-56"
                />
                {!isNew && (
                  <span
                    className="text-orange-500 cursor-pointer text-sm shrink-0 whitespace-nowrap"
                    onClick={() =>
                      showToast({
                        description: "当前账号暂无查看完整身份证信息的权限",
                      })
                    }
                  >
                    查看
                  </span>
                )}
              </div>
              {error?.field === 'idCard' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 姓名 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              姓名：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-name">
              <div className="flex items-center gap-2">
                <Input
                  value={formData.name || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, name: e.target.value })
                  }}
                  className="w-28"
                />
                {!isNew && person?.volunteerLevel && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {getVolunteerLevelLabel(person?.volunteerLevel)}
                  </span>
                )}
              </div>
              {error?.field === 'name' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 年龄 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              年龄：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-age">
              <Input
                type="number"
                value={formData.age || ""}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                }}
                className="w-28"
              />
              {error?.field === 'age' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 性别 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              性别：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-gender">
              <RadioGroup
                value={formData.gender ?? ""}
                onValueChange={(value) => {
                  setError(null)
                  setFormData({ ...formData, gender: value as "男" | "女" })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="男"
                    id="male"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="male"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.gender === "男" && "text-primary"
                    )}
                  >
                    男
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="女"
                    id="female"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="female"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.gender === "女" && "text-primary"
                    )}
                  >
                    女
                  </Label>
                </div>
              </RadioGroup>
              {error?.field === 'gender' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              联系方式：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-phone">
              <Input
                value={formData.phone || ""}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, phone: e.target.value })
                }}
                className="w-32"
              />
              {error?.field === 'phone' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 夫妻同住 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              夫妻同住：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-spouseLiving">
              <RadioGroup
                value={formData.spouseLiving ?? ""}
                onValueChange={(value) => {
                  setError(null)
                  setFormData({ ...formData, spouseLiving: value as "是" | "否" })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="是"
                    id="spouse-yes"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="spouse-yes"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.spouseLiving === "是" && "text-primary"
                    )}
                  >
                    是
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="否"
                    id="spouse-no"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="spouse-no"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.spouseLiving === "否" && "text-primary"
                    )}
                  >
                    否
                  </Label>
                </div>
              </RadioGroup>
              {error?.field === 'spouseLiving' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 配偶姓名（条件渲染） */}
          {formData.spouseLiving === "是" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
                配偶姓名：
              </Label>
              <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-spouseName">
                <Input
                  value={formData.spouseName || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, spouseName: e.target.value })
                  }}
                  className="w-28"
                />
                {error?.field === 'spouseName' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
              </div>
            </div>
          )}

          {/* 紧急联系人 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              紧急联系人：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-emergencyContact">
              <div className="flex items-center gap-2">
                <Input
                  value={formData.emergencyContact || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, emergencyContact: e.target.value })
                  }}
                  className="w-28"
                />
                <Select
                  value={formData.emergencyRelation || "子女"}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({
                      ...formData,
                      emergencyRelation: value as "子女" | "朋友" | "配偶",
                    })
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="子女">子女</SelectItem>
                    <SelectItem value="朋友">朋友</SelectItem>
                    <SelectItem value="配偶">配偶</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(error?.field === 'emergencyContact' || error?.field === 'emergencyRelation') && (
                <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>
              )}
            </div>
          </div>

          {/* 紧急联系人电话 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-left mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              紧急联系人电话：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-emergencyPhone">
              <Input
                value={formData.emergencyPhone || ""}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }}
                className="w-32"
              />
              {error?.field === 'emergencyPhone' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 当前状态 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              当前状态：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-status">
              <RadioGroup
                value={formData.status ?? ""}
                onValueChange={(value) => {
                  setError(null)
                  setFormData({
                    ...formData,
                    status: value as "待抵达" | "居住中" | "已返乡",
                  })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="居住中"
                    id="status-living"
                    className={cn(
                      "border-gray-400 text-gray-400 data-[state=checked]:border-orange-500 data-[state=checked]:text-orange-500"
                    )}
                  />
                  <Label
                    htmlFor="status-living"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.status === "居住中" && "text-orange-500"
                    )}
                  >
                    居住中
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="待抵达"
                    id="status-pending"
                    className={cn(
                      "border-gray-400 text-gray-400 data-[state=checked]:border-orange-500 data-[state=checked]:text-orange-500"
                    )}
                  />
                  <Label
                    htmlFor="status-pending"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.status === "待抵达" && "text-orange-500"
                    )}
                  >
                    待抵达
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="已返乡"
                    id="status-returned"
                    className={cn(
                      "border-gray-400 text-gray-400 data-[state=checked]:border-orange-500 data-[state=checked]:text-orange-500"
                    )}
                  />
                  <Label
                    htmlFor="status-returned"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.status === "已返乡" && "text-orange-500"
                    )}
                  >
                    已返乡
                  </Label>
                </div>
              </RadioGroup>
              {error?.field === 'status' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 居住时间 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              居住时间：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-residenceStartDate">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={formData.residenceStartDate || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, residenceStartDate: e.target.value })
                  }}
                  className="flex-1"
                />
                <span className="text-muted-foreground shrink-0">—</span>
                <Input
                  type="date"
                  value={formData.residenceEndDate || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, residenceEndDate: e.target.value })
                  }}
                  className="flex-1"
                />
              </div>
              {(error?.field === 'residenceStartDate' || error?.field === 'residenceEndDate') && (
                <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>
              )}
            </div>
          </div>

          {/* 原住地-社区 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              原住地-社区：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-originalProvince">
              {/* 隐式锚点，供 originalCity / originalCommunity 的 scrollIntoView 使用 */}
              <span id="field-originalCity" />
              <span id="field-originalCommunity" />
              <div className="flex items-center gap-2">
                <Select
                  value={formData.originalProvince || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, originalProvince: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="省份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="河北">河北</SelectItem>
                    <SelectItem value="北京">北京</SelectItem>
                    <SelectItem value="天津">天津</SelectItem>
                    <SelectItem value="山东">山东</SelectItem>
                    <SelectItem value="吉林">吉林</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.originalCity || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, originalCity: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="石家庄">石家庄</SelectItem>
                    <SelectItem value="张家口">张家口</SelectItem>
                    <SelectItem value="承德">承德</SelectItem>
                    <SelectItem value="长春">长春</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.originalCommunity || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, originalCommunity: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="社区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="桥东三里桥社区">桥东三里桥社区</SelectItem>
                    <SelectItem value="桥西明德社区">桥西明德社区</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(error?.field === 'originalProvince' || error?.field === 'originalCity' || error?.field === 'originalCommunity') && (
                <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>
              )}
            </div>
          </div>

          {/* 迁入地-社区 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              迁入地-社区：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-targetProvince">
              {/* 隐式锚点，供 targetCity / targetCommunity 的 scrollIntoView 使用 */}
              <span id="field-targetCity" />
              <span id="field-targetCommunity" />
              <div className="flex items-center gap-2">
                <Select
                  value={formData.targetProvince || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, targetProvince: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="省份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="广东">广东</SelectItem>
                    <SelectItem value="海南">海南</SelectItem>
                    <SelectItem value="云南">云南</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.targetCity || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, targetCity: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="广州">广州</SelectItem>
                    <SelectItem value="深圳">深圳</SelectItem>
                    <SelectItem value="珠海">珠海</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.targetCommunity || ""}
                  onValueChange={(value) => {
                    setError(null)
                    setFormData({ ...formData, targetCommunity: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="社区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="黄花岗社区">黄花岗社区</SelectItem>
                    <SelectItem value="白云山社区">白云山社区</SelectItem>
                    <SelectItem value="香雪社区">香雪社区</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(error?.field === 'targetProvince' || error?.field === 'targetCity' || error?.field === 'targetCommunity') && (
                <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>
              )}
            </div>
          </div>

          {/* 具体住址 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              具体住址：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-targetAddress">
              <textarea
                value={formData.targetAddress || ""}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, targetAddress: e.target.value })
                }}
                maxLength={200}
                placeholder="请填写详细的住址信息"
                className={cn(
                  "w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none placeholder:text-foreground/30"
                )}
              />
              {error?.field === 'targetAddress' && (
                <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>
              )}
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {(formData.targetAddress || "").length}/200
                </span>
              </div>
            </div>
          </div>

          {/* 健康状况 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              健康状况：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-healthStatus">
              <RadioGroup
                value={formData.healthStatus ?? ""}
                onValueChange={(value) => {
                  setError(null)
                  setFormData({
                    ...formData,
                    healthStatus: value as "完全自理" | "半自理",
                  })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="完全自理"
                    id="health-full"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="health-full"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.healthStatus === "完全自理" && "text-primary"
                    )}
                  >
                    完全自理
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="半自理"
                    id="health-half"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="health-half"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.healthStatus === "半自理" && "text-primary"
                    )}
                  >
                    半自理
                  </Label>
                </div>
              </RadioGroup>
              {error?.field === 'healthStatus' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
              <div className="flex flex-col gap-1 w-full relative" id="field-healthNote">
                <textarea
                  value={formData.healthNote || ""}
                  onChange={(e) => {
                    setError(null)
                    setFormData({ ...formData, healthNote: e.target.value })
                  }}
                  maxLength={200}
                  placeholder="请填写详细的身体健康状况，诸如当前患病及服药情况"
                  className={cn(
                    "w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none placeholder:text-foreground/30"
                  )}
                />
                {error?.field === 'healthNote' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {(formData.healthNote || "").length}/200
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 异地医保 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              异地医保：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-medicalInsuranceStatus">
              <RadioGroup
                value={formData.medicalInsuranceStatus ?? ""}
                onValueChange={(value) => {
                  setError(null)
                  setFormData({
                    ...formData,
                    medicalInsuranceStatus: value as "已备案" | "未备案",
                  })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="已备案"
                    id="insurance-registered"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="insurance-registered"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.medicalInsuranceStatus === "已备案" && "text-primary"
                    )}
                  >
                    已备案
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="未备案"
                    id="insurance-not-registered"
                    className="border-muted-foreground text-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor="insurance-not-registered"
                    className={cn(
                      "text-sm text-muted-foreground",
                      formData.medicalInsuranceStatus === "未备案" && "text-primary"
                    )}
                  >
                    未备案
                  </Label>
                </div>
              </RadioGroup>
              {error?.field === 'medicalInsuranceStatus' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
            </div>
          </div>

          {/* 才艺特长/兴趣爱好 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-left mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              才艺特长/兴趣爱好：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-hobbies">
              <textarea
                value={formData.hobbies || ""}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, hobbies: e.target.value })
                }}
                maxLength={200}
                placeholder="请填写才艺特长及兴趣爱好，诸如跳广场舞等"
                className={cn(
                  "w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none placeholder:text-foreground/30"
                )}
              />
              {error?.field === 'hobbies' && <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap z-10">{error.msg}</span>}
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {(formData.hobbies || "").length}/200
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button type="button" onClick={(e) => { e.preventDefault(); handleSave(); }} className="w-full">
            保 存
          </Button>
        </div>
      </div>
    </div>
  )
}
