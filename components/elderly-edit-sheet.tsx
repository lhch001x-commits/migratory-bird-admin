"use client"

import { useEffect, useState, useRef, useMemo } from "react"
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
import { supabase } from "@/lib/supabase"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
// 获取当前登录用户
import { useAccount } from "@/components/account-context"

type ElderlyEditSheetProps = {
  open: boolean
  onClose: () => void
  initialData?: ElderlyPerson
  isNew: boolean
  onSave: (data: Partial<ElderlyPerson>) => void
  person?: ElderlyPerson | null
  trigger?: React.ReactNode
}

// 返回称谓
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

// 字段反向映射：camelCase -> snake_case
function mapToDbPayload(formData: Partial<ElderlyPerson>) {
  return {
    id_card: formData.idCard,
    name: formData.name,
    age: formData.age,
    gender: formData.gender,
    phone: formData.phone,
    spouse_living: formData.spouseLiving,
    spouse_name: formData.spouseName,
    emergency_contact: formData.emergencyContact,
    emergency_contact_relation: formData.emergencyRelation,
    emergency_phone: formData.emergencyPhone,
    status: formData.status,
    residence_start_date: formData.residenceStartDate,
    residence_end_date: formData.residenceEndDate,
    original_province: formData.originalProvince,
    original_city: formData.originalCity,
    original_community: formData.originalCommunity,
    target_province: formData.targetProvince,
    target_city: formData.targetCity,
    target_community: formData.targetCommunity,
    target_address: formData.targetAddress,
    health_status: formData.healthStatus,
    health_details: formData.healthNote,
    medical_insurance_status: formData.medicalInsuranceStatus,
    talents: formData.hobbies,
    volunteer_level: formData.volunteerLevel,
    user_id: formData.userId
    // owner_id 不做类型限制，见 handleSave 处临时补充
  }
}

export function ElderlyEditSheet({
  open,
  onClose,
  initialData,
  person,
  isNew,
  onSave,
  trigger,
}: ElderlyEditSheetProps) {
  // 获取当前登录用户，只取 currentAccount
  const { currentAccount } = useAccount()

  const [formData, setFormData] = useState<Partial<ElderlyPerson>>({})
  const [error, setError] = useState<{ field: string; msg: string } | null>(null)
  const { showToast } = useAppToast()
  const didEffect = useRef(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [sysLocations, setSysLocations] = useState<any[]>([])
  console.log("【抽屉收到的包裹 initialData】:", initialData);

  // ========== 获取省市社区动态数据 ==========
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('sys_communities').select('*')
      if (!error && Array.isArray(data)) setSysLocations(data)
    })()
  }, [])

  useEffect(() => {
    setInternalOpen(open)
  }, [open])

  // 回显
  useEffect(() => {
    if (internalOpen && initialData) {
      setFormData({
        ...initialData,
        originalProvince: initialData.originalProvince ?? "",
        originalCity: initialData.originalCity ?? "",
        originalCommunity: initialData.originalCommunity ?? "",
        targetProvince: initialData.targetProvince ?? "",
        targetCity: initialData.targetCity ?? "",
        targetCommunity: initialData.targetCommunity ?? "",
        healthNote: initialData.healthNote || (initialData as any).health_details || "",
        hobbies: initialData.hobbies || (initialData as any).talents || "",
      })
      didEffect.current = true
    } else if (internalOpen && !initialData && person) {
      setFormData({
        ...person,
        originalProvince: person.originalProvince ?? "",
        originalCity: person.originalCity ?? "",
        originalCommunity: person.originalCommunity ?? "",
        targetProvince: person.targetProvince ?? "",
        targetCity: person.targetCity ?? "",
        targetCommunity: person.targetCommunity ?? "",
        healthNote: person.healthNote || (person as any).health_details || "",
        hobbies: person.hobbies || (person as any).talents || "",
      })
      didEffect.current = true
    } else if (internalOpen && !initialData && !person) {
      setFormData({ emergencyRelation: "子女" })
      didEffect.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, person, internalOpen])

  // 下拉联动
  const originalProvinces = useMemo(() => {
    const set = new Set<string>()
    sysLocations.forEach(item => { if(item.province) set.add(item.province) })
    return Array.from(set)
  }, [sysLocations])

  const originalCities = useMemo(() => {
    if (!formData.originalProvince) return []
    const set = new Set<string>()
    sysLocations
      .filter(item => item.province === formData.originalProvince)
      .forEach(item => { if(item.city) set.add(item.city) })
    return Array.from(set)
  }, [formData.originalProvince, sysLocations])

  const originalCommunities = useMemo(() => {
    if (!formData.originalProvince || !formData.originalCity) return []
    const set = new Set<string>()
    sysLocations
      .filter(item =>
        item.province === formData.originalProvince &&
        item.city === formData.originalCity
      )
      .forEach(item => { if(item.community) set.add(item.community) })
    return Array.from(set)
  }, [formData.originalProvince, formData.originalCity, sysLocations])

  const targetProvinces = useMemo(() => {
    const set = new Set<string>()
    sysLocations.forEach(item => { if(item.province) set.add(item.province) })
    return Array.from(set)
  }, [sysLocations])

  const targetCities = useMemo(() => {
    if (!formData.targetProvince) return []
    const set = new Set<string>()
    sysLocations
      .filter(item => item.province === formData.targetProvince)
      .forEach(item => { if(item.city) set.add(item.city) })
    return Array.from(set)
  }, [formData.targetProvince, sysLocations])

  const targetCommunities = useMemo(() => {
    if (!formData.targetProvince || !formData.targetCity) return []
    const set = new Set<string>()
    sysLocations
      .filter(item =>
        item.province === formData.targetProvince &&
        item.city === formData.targetCity
      )
      .forEach(item => { if(item.community) set.add(item.community) })
    return Array.from(set)
  }, [formData.targetProvince, formData.targetCity, sysLocations])

  useEffect(() => {
    if (!internalOpen) setError(null)
  }, [internalOpen])

  const handleSave = async () => {
    const isEmpty = (val: unknown): boolean =>
      val === undefined || val === null || String(val).trim() === ""
    const block = (field: string, msg: string = "此为必填项") => {
      setError({ field, msg })
      document.getElementById("field-" + field)?.scrollIntoView({ behavior: "smooth", block: "center" })
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

    // === 准备发送至后端的真实数据库字段对象 ===
    // 用 any，彻底去掉类型限制，允许 owner_id
    let dbPayload: any = { ...mapToDbPayload(formData) }

    // 删除无关字段，防止 TS 报错，防止冗余
    if ("emergency_relation" in dbPayload) {
      delete dbPayload.emergency_relation
    }

    if (isNew) {
      // 必须能拿到登录用户ID
      if (!currentAccount?.id) {
        showToast({ description: "无法获取当前账号信息，请重新登录", duration: 3000 })
        return
      }
      dbPayload.owner_id = currentAccount.id

      try {
        const { error: insertError, data: insertData } = await supabase
          .from("elderly_info")
          .insert(dbPayload as any)
          .select()
        if (insertError) {
          showToast({ description: "新增失败：" + insertError.message, duration: 3000 })
          return
        }
        showToast({ description: "新增成功", duration: 2000 })
        if (Array.isArray(insertData) && insertData[0]) {
          onSave(insertData[0])
        } else {
          onSave(formData)
        }
        setInternalOpen(false)
        onClose?.()
      } catch (err) {
        showToast({ description: "新增异常", duration: 3000 })
      }
      return
    }

    // 编辑模式，确保不传 owner_id/user_id
    if ("owner_id" in dbPayload) delete dbPayload.owner_id
    if ("user_id" in dbPayload) delete dbPayload.user_id

    const updateData = { ...formData }
    const trueId =
      (initialData && initialData.id) ||
      (person && person.id) ||
      updateData.id

    if (!trueId) {
      showToast({ description: "无法获取ID，无法保存", duration: 3000 })
      return
    }

    // 类型 any，彻底去掉校验限制
    let dbPayloadForUpdate: any = { ...dbPayload }

    try {
      const { error: updateError } = await supabase
        .from("elderly_info")
        .update(dbPayloadForUpdate)
        .eq("id", trueId)

      if (updateError) {
        showToast({ description: "更新失败：" + updateError.message, duration: 3000 })
        return
      }
      showToast({ description: "更新成功", duration: 2000 })
      onSave({ ...updateData, id: trueId })
      setInternalOpen(false)
      onClose?.()
    } catch (err) {
      showToast({ description: "更新异常", duration: 3000 })
    }
  }

  // 绝不做任何提前 return 判断，trigger 必须保证直出
  return (
    <Sheet open={internalOpen} onOpenChange={(o) => {
      setInternalOpen(o)
      if (!o) onClose?.()
    }}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="sm:max-w-[500px] w-[90vw] overflow-y-auto flex flex-col px-0 py-0"
      >
        <SheetHeader>
          <SheetTitle>
            {isNew ? "新增候鸟老人信息" : "候鸟老人信息编辑"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* 用户编号 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              用户编号：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-user_id">
              <Input
                value={formData.userId || "保存后，由系统自动生成"}
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
                {!isNew && formData.volunteerLevel && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {getVolunteerLevelLabel(formData.volunteerLevel)}
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
            <Label className="text-left mt-2 shrink-0 text-sm font-medium text-muted-foreground">
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
            <Label className="text-left mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              原住地-社区：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-originalProvince">
              <span id="field-originalCity" />
              <span id="field-originalCommunity" />
              <div className="flex items-center gap-2">
                {/* 省份动态 */}
                <Select
                  value={formData.originalProvince || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      originalProvince: value,
                      originalCity: "",
                      originalCommunity: ""
                    })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="省份" />
                  </SelectTrigger>
                  <SelectContent>
                    {originalProvinces.length === 0 && (
                      <SelectItem value="" disabled>加载中…</SelectItem>
                    )}
                    {originalProvinces.map(p => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 城市动态 */}
                <Select
                  value={formData.originalCity || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      originalCity: value,
                      originalCommunity: ""
                    })
                  }}
                  disabled={!formData.originalProvince}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.originalProvince && originalCities.length === 0 && (
                      <SelectItem value="" disabled>无可选城市</SelectItem>
                    )}
                    {originalCities.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 社区动态 */}
                <Select
                  value={formData.originalCommunity || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      originalCommunity: value
                    })
                  }}
                  disabled={!formData.originalProvince || !formData.originalCity}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="社区" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.originalProvince && formData.originalCity && originalCommunities.length === 0 && (
                      <SelectItem value="" disabled>无可选社区</SelectItem>
                    )}
                    {originalCommunities.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
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
            <Label className="text-left mt-2 shrink-0 text-sm font-medium text-muted-foreground">
              迁入地-社区：
            </Label>
            <div className="col-span-3 flex flex-col gap-1 w-full relative" id="field-targetProvince">
              <span id="field-targetCity" />
              <span id="field-targetCommunity" />
              <div className="flex items-center gap-2">
                {/* 省份动态 */}
                <Select
                  value={formData.targetProvince || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      targetProvince: value,
                      targetCity: "",
                      targetCommunity: ""
                    })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="省份" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetProvinces.length === 0 && (
                      <SelectItem value="" disabled>加载中…</SelectItem>
                    )}
                    {targetProvinces.map(p => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 城市动态 */}
                <Select
                  value={formData.targetCity || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      targetCity: value,
                      targetCommunity: ""
                    })
                  }}
                  disabled={!formData.targetProvince}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.targetProvince && targetCities.length === 0 && (
                      <SelectItem value="" disabled>无可选城市</SelectItem>
                    )}
                    {targetCities.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 社区动态 */}
                <Select
                  value={formData.targetCommunity || ""}
                  onValueChange={value => {
                    setError(null)
                    setFormData({
                      ...formData,
                      targetCommunity: value
                    })
                  }}
                  disabled={!formData.targetProvince || !formData.targetCity}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="社区" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.targetProvince && formData.targetCity && targetCommunities.length === 0 && (
                      <SelectItem value="" disabled>无可选社区</SelectItem>
                    )}
                    {targetCommunities.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
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

        <div className="p-4 border-t">
          <Button type="button" onClick={e => { e.preventDefault(); handleSave(); }} className="w-full">
            保 存
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
