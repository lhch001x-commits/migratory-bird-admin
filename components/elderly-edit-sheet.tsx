"use client"

import { useEffect, useState } from "react"
import { X, ExternalLink } from "lucide-react"
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

  useEffect(() => {
    if (person) {
      setFormData(person)
    } else {
      setFormData({
        gender: "男",
        spouseLiving: "否",
        emergencyRelation: "子女",
        status: "待抵达",
        healthStatus: "完全自理",
      })
    }
  }, [person, open])

  const handleSave = () => {
    onSave(formData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-card shadow-xl flex flex-col z-50">
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
          {/* Name */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              姓名：
            </Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-28"
              />
              {!isNew && person?.volunteerLevel && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {getVolunteerLevelLabel(person?.volunteerLevel)}
                </span>
              )}
            </div>
          </div>

          {/* Age */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              年龄：
            </Label>
            <Input
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
              }
              className="flex-1"
            />
          </div>

          {/* Gender */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              性别：
            </Label>
            <RadioGroup
              value={formData.gender || "男"}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value as "男" | "女" })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="男" id="male" className="border-primary text-primary" />
                <Label htmlFor="male" className="text-sm">
                  男
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="女" id="female" className="border-primary text-primary" />
                <Label htmlFor="female" className="text-sm">
                  女
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              联系方式：
            </Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="flex-1"
            />
          </div>

          {/* Spouse Living */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              是否夫妻同住：
            </Label>
            <RadioGroup
              value={formData.spouseLiving || "否"}
              onValueChange={(value) =>
                setFormData({ ...formData, spouseLiving: value as "是" | "否" })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="是" id="spouse-yes" className="border-primary text-primary" />
                <Label htmlFor="spouse-yes" className="text-sm">
                  是
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="否" id="spouse-no" className="border-primary text-primary" />
                <Label htmlFor="spouse-no" className="text-sm">
                  否
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Spouse Name */}
          {formData.spouseLiving === "是" && (
            <div className="flex items-center gap-3">
              <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
                配偶姓名：
              </Label>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={formData.spouseName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, spouseName: e.target.value })
                  }
                  className="flex-1"
                />
                <button className="text-primary text-sm flex items-center gap-1 whitespace-nowrap hover:underline">
                  点击查看信息
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              紧急联系人：
            </Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={formData.emergencyContact || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                placeholder=""
                className="w-24"
              />
              <Select
                value={formData.emergencyRelation || "子女"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    emergencyRelation: value as "子女" | "朋友" | "配偶",
                  })
                }
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
              <Label className="text-sm text-muted-foreground">联系方式：</Label>
              <Input
                value={formData.emergencyPhone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              当前状态：
            </Label>
            <RadioGroup
              value={formData.status || "待抵达"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "待抵达" | "居住中" | "已返乡",
                })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="居住中" id="status-living" className="border-primary text-primary" />
                <Label htmlFor="status-living" className="text-sm">
                  居住中
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="待抵达" id="status-pending" className="border-primary text-primary" />
                <Label htmlFor="status-pending" className="text-sm">
                  待抵达
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="已返乡" id="status-returned" className="border-primary text-primary" />
                <Label htmlFor="status-returned" className="text-sm">
                  已返乡
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Residence Time */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              居住时间：
            </Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="date"
                value={formData.residenceStartDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    residenceStartDate: e.target.value,
                  })
                }
                className="flex-1"
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="date"
                value={formData.residenceEndDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, residenceEndDate: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Original Location */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              原住地-社区：
            </Label>
            <div className="flex-1 flex items-center gap-2">
              <Select
                value={formData.originalProvince || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, originalProvince: value })
                }
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
                onValueChange={(value) =>
                  setFormData({ ...formData, originalCity: value })
                }
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
              <Input
                value={formData.originalCommunity || ""}
                onChange={(e) =>
                  setFormData({ ...formData, originalCommunity: e.target.value })
                }
                placeholder="社区"
                className="flex-1"
              />
            </div>
          </div>

          {/* Target Location */}
          <div className="flex items-center gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0">
              迁入地-社区：
            </Label>
            <div className="flex-1 flex items-center gap-2">
              <Select
                value={formData.targetProvince || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetProvince: value })
                }
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
                onValueChange={(value) =>
                  setFormData({ ...formData, targetCity: value })
                }
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
                onValueChange={(value) =>
                  setFormData({ ...formData, targetCommunity: value })
                }
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
          </div>

          {/* Health Status */}
          <div className="flex items-start gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0 pt-2">
              健康状况：
            </Label>
            <div className="flex-1 space-y-2">
              <RadioGroup
                value={formData.healthStatus || "完全自理"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    healthStatus: value as "完全自理" | "半自理",
                  })
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="完全自理"
                    id="health-full"
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="health-full" className="text-sm text-primary">
                    完全自理
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="半自理"
                    id="health-half"
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="health-half" className="text-sm">
                    半自理
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {formData.healthNote ||
                  "患有高血压慢性病，对抗生素药物存在过敏现象"}
              </p>
            </div>
          </div>

          {/* Hobbies */}
          <div className="flex items-start gap-3">
            <Label className="w-24 text-right text-sm text-muted-foreground shrink-0 pt-2">
              才艺特长/兴趣爱好：
            </Label>
            <textarea
              value={formData.hobbies || ""}
              onChange={(e) =>
                setFormData({ ...formData, hobbies: e.target.value })
              }
              placeholder="下象棋，打太极拳"
              className={cn(
                "flex-1 min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button onClick={handleSave} className="w-full">
            保 存
          </Button>
        </div>
      </div>
    </div>
  )
}
