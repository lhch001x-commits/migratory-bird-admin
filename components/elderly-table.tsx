"use client"
import { supabase } from "@/lib/supabase"
import { useAccount } from "@/components/account-context";
import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Upload, Download, FileSpreadsheet, X, RotateCcw, List } from "lucide-react"
import type { ElderlyPerson } from "@/app/page"
import { cn } from "@/lib/utils"
import { useAppToast } from "@/components/app-toast"
import * as XLSX from "xlsx"

type ElderlyTableProps = {
  title: string
  onEdit: (person: ElderlyPerson) => void
  onAddNew: () => void
  mode: 'in' | 'out'
  refreshTrigger?: number
  onImportSuccess?: () => void
}

export function ElderlyTable({ title, onEdit, onAddNew, mode, refreshTrigger, onImportSuccess }: ElderlyTableProps) {
  // ----- 分页配置与状态 -----
  const pageSize = 7
  const [currentPage, setCurrentPage] = useState(1)

  // sourceData 为从云端拉取并经过翻译官转换的全量云端数据
  const [sourceData, setSourceData] = useState<ElderlyPerson[]>([])
  // people 控制表格展示
  const [people, setPeople] = useState<ElderlyPerson[]>([])

  const [deleteTarget, setDeleteTarget] = useState<ElderlyPerson | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDialogFileInputRef = useRef<HTMLInputElement>(null)
  const [searchParams, setSearchParams] = useState({
    user_id: "",
    name: "",
    phone: "",
    status: "",
    hometown: "",
    targetCommunity: "",
  })
  const { showToast } = useAppToast()

  const ACCEPTED_EXCEL_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ]
  const ACCEPTED_EXCEL_EXTENSIONS = ".xlsx,.xls"

  // 获取当前账号
  const { currentAccount, accounts } = useAccount();

  // ======== 重构: Supabase 拉取&映射逻辑 ================
  console.log("📢 表格当前收到的 mode 是:", mode, " | 当前账号是:", currentAccount?.id);
  const fetchElderlyData = useCallback(async () => {
    // 前置拦截：无账号直接清空
    if (!currentAccount || !currentAccount.id) {
      setSourceData([]);
      setPeople([]);
      return;
    }

    // 动态构造 query
    let query = supabase.from('elderly_info').select('*');
    if (mode === 'out') {
      query = query.eq('out_account_id', currentAccount.id);
    } else if (mode === 'in') {
      query = query.eq('in_account_id', currentAccount.id);
    }

    // 添加倒序排序
    const { data, error } = await query.order('created_at', { ascending: false });
    console.log("Supabase 返回的原始数据:", data);
    if (error) {
      showToast({ description: "拉取候鸟老人数据失败：" + error.message, duration: 3000 });
      setSourceData([]);
      setPeople([]);
      return;
    }

    if (Array.isArray(data)) {
      const translated: ElderlyPerson[] = data.map((item: any) => ({
        id: String(item.id),
        ownerId: item.owner_id,
        user_id: item.user_id,
        userId: typeof item.id === "string" ? item.id.substring(0, 8) : String(item.id),
        idCard: item.id_card,
        name: item.name,
        age: item.age,
        gender: item.gender,
        hometown: item.hometown,
        originalProvince: item.original_province,
        originalCity: item.original_city,
        originalCommunity: item.original_community,
        phone: item.phone,
        status: item.status,
        targetProvince: item.target_province,
        targetCity: item.target_city,
        targetCommunity: item.target_community,
        targetAddress: item.target_address,
        medicalInsuranceStatus: item.medical_insurance_status,
        volunteerLevel: item.volunteer_level,
        spouseLiving:
          item.spouse_living === true || item.spouse_living === "true" || item.spouse_living === 1 || item.spouse_living === "1"
            ? "是"
            : item.spouse_living === false || item.spouse_living === "false" || item.spouse_living === 0 || item.spouse_living === "0"
              ? "否"
              : item.spouse_living,
        spouseName: item.spouse_name,
        emergencyContact: item.emergency_contact,
        emergencyRelation: item.emergency_contact_relation,
        emergencyPhone: item.emergency_phone,
        residenceStartDate: item.residence_start_date,
        residenceEndDate: item.residence_end_date,
        healthStatus: item.health_status,
        healthNote: item.health_details || "",
        hobbies: item.talents || "",
        is_read: item.is_read,
      }));
      setSourceData(translated);
      setPeople(translated);
    } else {
      setSourceData([]);
      setPeople([]);
    }
  }, [currentAccount?.id, mode, showToast, refreshTrigger]);

  // useEffect 依赖中加入 fetchElderlyData 保证最新
  useEffect(() => {
    fetchElderlyData();
  }, [fetchElderlyData]);
  // ===============================================

  const handleDownloadTemplate = useCallback(() => {
    const templateUrl = "/template/elder_infor_upload_template.xlsx"
    const link = document.createElement("a")
    link.href = templateUrl
    link.download = "候鸟老人信息导入模板.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const processExcelFile = useCallback(async (file: File) => {
    const reader = new FileReader()

    return new Promise<void>((resolve, reject) => {
      reader.onload = async (event) => {
        console.log("👉 2. 文件读取成功，准备进入 XLSX 解析")
        try {
          const binaryData = event.target?.result
          if (!binaryData) {
            reject(new Error("文件内容为空"))
            return
          }

          const workbook = XLSX.read(binaryData, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            defval: "",
            raw: false,
            dateNF: "yyyy-mm-dd",
          })
          console.log("👉 3. XLSX 提取出的原始行数据:", rows)
          const headerMap: Record<string, string> = {
            "姓名": "name",
            "身份证号": "id_card",
            "手机号": "phone",
            "当前状态": "status",
            "原住地-省份": "original_province",
            "原住地-城市": "original_city",
            "原住地-社区": "original_community",
            "迁入地-省份": "target_province",
            "迁入地-城市": "target_city",
            "迁入地-社区": "target_community",
            "迁入地详细住址": "target_address",
            "具体住址": "target_address",
            "年龄": "age",
            "性别": "gender",
            "居住开始时间": "residence_start_date",
            "居住结束时间": "residence_end_date",
            "夫妻同住": "spouse_living",
            "夫妻是否同住": "spouse_living",
            "配偶姓名": "spouse_name",
            "紧急联系人": "emergency_contact",
            "紧急联系人关系": "emergency_contact_relation",
            "紧急联系人电话": "emergency_phone",
            "健康状况": "health_status",
            "健康备注": "health_details",
            "异地医保": "medical_insurance_status",
            "才艺特长/兴趣爱好": "talents",
            "才艺特长": "talents",
            "志愿等级": "volunteer_level",
          }

          const LEGAL_DB_FIELDS = new Set<string>([
            "owner_id",
            "user_id",
            "name",
            "id_card",
            "phone",
            "gender",
            "age",
            "status",
            "hometown",
            "original_province",
            "original_city",
            "original_community",
            "target_province",
            "target_city",
            "target_community",
            "target_address",
            "medical_insurance_status",
            "volunteer_level",
            "spouse_living",
            "spouse_name",
            "emergency_contact",
            "emergency_contact_relation",
            "emergency_phone",
            "residence_start_date",
            "residence_end_date",
            "health_status",
            "health_details",
            "talents",
            "out_account_id",
            "in_account_id",
            "is_read",
          ])

          const chineseKeyRegex = /[\u4e00-\u9fff]/
          const dateFields = ["residence_start_date", "residence_end_date"]

          const mappedData = rows
            .map((row) => {
              return Object.entries(row).reduce<Record<string, any>>((acc, [key, value]) => {
                const normalizedKey = key.trim()
                const compactKey = normalizedKey.replace(/\s+/g, "")
                const mappedKey = headerMap[key] || headerMap[normalizedKey] || headerMap[compactKey] || key
                acc[mappedKey] = value
                return acc
              }, {})
            })
            .filter((item) => !!item.name?.toString().trim())

          const dbPayload = mappedData.map((item) => {
            const matchedInAccount = accounts?.find((acc) => acc.community_name === item.target_community)

            const payloadItem: Record<string, any> = {
              ...item,
              volunteer_level: item.volunteer_level?.toString().trim() || "普通候鸟老人",
              out_account_id: currentAccount?.id ?? null,
              in_account_id: matchedInAccount?.id ?? null,
              is_read: false,
            }

            if (!payloadItem.emergency_phone && item.emergency_contact_phone) {
              payloadItem.emergency_phone = item.emergency_contact_phone
            }
            if (!payloadItem.health_details && item.health_remark) {
              payloadItem.health_details = item.health_remark
            }

            payloadItem.age = item.age ? parseInt(item.age, 10) : null
            const spouseLivingRaw = item.spouse_living?.toString().trim()
            if (
              spouseLivingRaw === "是" ||
              spouseLivingRaw === "true" ||
              spouseLivingRaw === "1" ||
              spouseLivingRaw === "Y" ||
              spouseLivingRaw === "y"
            ) {
              payloadItem.spouse_living = "是"
            } else if (
              spouseLivingRaw === "否" ||
              spouseLivingRaw === "false" ||
              spouseLivingRaw === "0" ||
              spouseLivingRaw === "N" ||
              spouseLivingRaw === "n"
            ) {
              payloadItem.spouse_living = "否"
            } else {
              payloadItem.spouse_living = null
            }

            dateFields.forEach((key) => {
              const dateVal = item[key]
              payloadItem[key] =
                dateVal && !isNaN(Date.parse(dateVal)) ? new Date(dateVal).toISOString() : null
            })

            Object.keys(payloadItem).forEach((key) => {
              if (chineseKeyRegex.test(key) || !LEGAL_DB_FIELDS.has(key)) {
                delete payloadItem[key]
              }
            })

            Object.keys(payloadItem).forEach((key) => {
              if (payloadItem[key] === "") {
                payloadItem[key] = null
              }
            })

            return payloadItem
          })

          const { error } = await supabase.from('elderly_info').insert(dbPayload)
          if (error) {
            throw error
          }

          showToast({ description: "批量导入成功", duration: 3000 })
          onImportSuccess?.()
          resolve()
        } catch (error) {
          console.error("批量导入失败:", error)
          showToast({
            description: `导入失败：${error instanceof Error ? error.message : "请检查文件格式后重试"}`,
            duration: 3000
          })
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("文件读取失败"))
      }

      reader.readAsArrayBuffer(file)
    })
  }, [accounts, currentAccount?.id, onImportSuccess, showToast])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("👉 1. 触发了 onChange，拿到的文件是:", file?.name)
    if (!file) return

    processExcelFile(file).finally(() => {
      e.target.value = ""
    })
  }, [processExcelFile])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (ext !== ".xlsx" && ext !== ".xls") {
        showToast({ description: "文件格式不正确，请上传 .xlsx 或 .xls 格式的文件", duration: 3000 })
        if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
        return
      }

      if (!ACCEPTED_EXCEL_TYPES.includes(file.type) && ext !== ".xlsx" && ext !== ".xls") {
        showToast({ description: "文件格式不正确，请上传 .xlsx 或 .xls 格式的文件", duration: 3000 })
        if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
        return
      }

      setImportFile(file)
    },
    [showToast],
  )

  const handleImportUpload = useCallback(async () => {
    if (!importFile) return
    try {
      setIsUploading(true)
      await processExcelFile(importFile)
      setImportDialogOpen(false)
      setImportFile(null)
      if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
      fetchElderlyData()
    } catch {
      // 错误提示已在 processExcelFile 中处理
    } finally {
      setIsUploading(false)
    }
  }, [importFile, processExcelFile, fetchElderlyData])

  const handleRemoveFile = useCallback(() => {
    setImportFile(null)
    if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
  }, [])

  // ------------ 新分页逻辑开始 -------------
  // 总数与分页派生
  const totalCount = people.length
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1)
  const currentStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const currentEnd = Math.min(currentPage * pageSize, totalCount)

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    }

    const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1]
    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)

    // 靠近两端时扩大中间显示区，减少频繁跳动
    if (currentPage <= 3) end = 4
    if (currentPage >= totalPages - 2) start = totalPages - 3

    if (start > 2) pages.push("ellipsis-left")
    for (let page = start; page <= end; page += 1) {
      pages.push(page)
    }
    if (end < totalPages - 1) pages.push("ellipsis-right")

    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages])

  // 当前页校正
  if (currentPage > totalPages && totalPages > 0) {
    setTimeout(() => setCurrentPage(totalPages), 0)
  }

  // 当前页数据
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return people.slice(start, end)
  }, [people, currentPage, pageSize])

  // 搜索时用 sourceData 过滤 (而不是 mockData)
  const handleSearch = useCallback(() => {
    const filtered = sourceData.filter((item) => {
      // 账号隔离不需要，此时 sourceData 已为当前账号
      if (searchParams.user_id && item.userId !== searchParams.user_id) return false;
      if (searchParams.name && item.name !== searchParams.name) return false;
      if (searchParams.phone && item.phone !== searchParams.phone) return false;
      if (searchParams.status && item.status !== searchParams.status) return false;
      if (searchParams.hometown && item.originalCommunity !== searchParams.hometown) return false;
      if (searchParams.targetCommunity && item.targetCommunity !== searchParams.targetCommunity) return false;
      return true;
    });
    setPeople(filtered);
    setCurrentPage(1);
  }, [searchParams, sourceData]);

  // sourceData变化时，表格内容回置
  useEffect(() => {
    setPeople(sourceData)
    setCurrentPage(1)
  }, [sourceData])

  const handleReset = useCallback(() => {
    setSearchParams({
      user_id: "",
      name: "",
      phone: "",
      status: "",
      hometown: "",
      targetCommunity: "",
    });
    setPeople(sourceData);
    setCurrentPage(1);
  }, [sourceData]);

  const requestDelete = (person: ElderlyPerson) => {
    setDeleteTarget(person);
  }

  // 新的弹窗内删除逻辑（根据指令重写）
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);
    const { error } = await supabase.from('elderly_info').delete().eq('id', deleteTarget.id);
    if (error) {
      showToast({ description: "删除失败：" + error.message, duration: 3000 });
      setIsDeleting(false);
      return;
    }
    showToast({ description: "删除成功", duration: 3000 });
    setDeleteTarget(null); // 关闭二次确认弹窗
    setIsDeleting(false);
    // 刷新表格列表数据
    fetchElderlyData();
  }, [deleteTarget, showToast, fetchElderlyData]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "居住中":
        return "bg-orange-50 text-primary border border-primary"
      case "待抵达":
        return "bg-transparent text-primary border border-primary"
      case "已返乡":
        return "bg-transparent text-muted-foreground border border-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getVolunteerLevelStyle = (level: string) => {
    if (level === "候鸟老年人才" || level === "候鸟老年志愿者") {
      return "text-primary"
    }
    return "text-muted-foreground"
  }

  const getMedicalInsuranceStyle = (status: string) => {
    switch (status) {
      case "已备案":
        return "bg-orange-50 text-primary border border-primary"
      case "未备案":
        return "bg-transparent text-primary border border-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const truncateText = (str?: string) =>
    str && str.length > 10 ? str.slice(0, 10) + "..." : str

  const deleteDialogOpen = !!deleteTarget

  const warningIcon = useMemo(() => {
    return (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-destructive"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
    )
  }, [])

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <List className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">列表</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">候鸟老人信息</span>
      </div>

      {/* Search Section */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <h3 className="text-base font-medium mb-4 text-foreground/70">候鸟老人信息查询</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 第一行：用户ID、姓名、手机号、重置按钮 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              用户ID：
            </label>
            <div className="flex-1">
              <Input
                placeholder=""
                value={searchParams.user_id}
                onChange={e => setSearchParams(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              姓 名：
            </label>
            <div className="flex-1">
              <Input
                placeholder=""
                value={searchParams.name}
                onChange={e => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              手机号：
            </label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder=""
                value={searchParams.phone}
                onChange={e => setSearchParams(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchParams(prev => ({
                    ...prev,
                    user_id: "",
                    name: "",
                    phone: "",
                    status: "",
                    hometown: "",
                    targetCommunity: ""
                  }))
                  if (typeof handleReset === "function") handleReset()
                }}
                className="bg-gray-600 text-white hover:bg-gray-700 gap-2 ml-2"
              >
                <RotateCcw className="w-4 h-4" />
                重 置
              </Button>
            </div>
          </div>
          {/* 第二行：当前状态、原籍社区、迁入社区、查询按钮 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              当前状态：
            </label>
            <div className="flex-1">
              <Select
                value={searchParams.status}
                onValueChange={value => setSearchParams(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="待抵达">待抵达</SelectItem>
                  <SelectItem value="居住中">居住中</SelectItem>
                  <SelectItem value="已返乡">已返乡</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              原籍社区：
            </label>
            <div className="flex-1">
              <Input
                placeholder=""
                value={searchParams.hometown}
                onChange={e => setSearchParams(prev => ({ ...prev, hometown: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20 text-left shrink-0">
              迁入社区：
            </label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder=""
                value={searchParams.targetCommunity}
                onChange={e => setSearchParams(prev => ({ ...prev, targetCommunity: e.target.value }))}
                className="w-full"
              />
              <Button
                onClick={handleSearch}
                className="bg-gray-600 text-white hover:bg-gray-700 gap-2 ml-2"
              >
                <Search className="w-4 h-4" />
                查 询
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-4">
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          添加新信息
        </Button>
        
        <Button
          variant="outline"
          className="gap-2 text-primary border-primary hover:bg-primary/10"
          onClick={() => {
            setImportDialogOpen(true)
          }}
        >
          <Upload className="w-4 h-4" />
          批量导入
        </Button>

        <Button
          variant="outline"
          className="gap-2 text-primary border-primary hover:bg-primary/10"
          onClick={handleDownloadTemplate}
        >
          <Download className="w-4 h-4" />
          下载模板
        </Button>

        {/* 隐藏的真实接收器，只留这一个，乖乖藏好 */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden" 
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
      </div>

      {/* ======= 表格区域 (含新分页) ======= */}
      <>
        {/* 1. 注入滚动条控制魔法：强制右侧留白 */}
        <style dangerouslySetInnerHTML={{ __html: `
          .short-scrollbar::-webkit-scrollbar {
            height: 10px; 
          }
          .short-scrollbar::-webkit-scrollbar-track {
            background: transparent; 
            margin-right: 140px; 
          }
          .short-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 8px; 
          }
          .short-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
          }
        `}} />
        
        {/* 2. 表格主体容器 */}
        <div className="flex-1 min-w-0 overflow-x-auto border rounded-lg relative short-scrollbar">
          <Table className="w-full" style={{ minWidth: "1600px" }}>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[120px]">用户ID</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[180px]">身份证号</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[100px]">姓名</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[60px]">性别</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[60px]">年龄</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[100px]">当前状态</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[130px]">手机号</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[200px]">原住地-社区</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[200px]">迁入地-社区</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[250px]">迁入地住址</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[120px]">异地医保状态</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[120px]">志愿等级</TableHead>
                <TableHead className="text-center text-foreground/70 whitespace-nowrap w-[140px] sticky right-0 bg-muted z-20 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.1)]">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {mode === "in" && !person.is_read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2 flex-shrink-0" />
                        )}
                        <span>{person.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{person.idCard ? person.idCard.slice(0, 6) + "************" : ""}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      {person.name}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      {person.gender}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      {person.age}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      <span className={cn("inline-block px-2 py-0.5 rounded text-xs", getStatusStyle(person.status))}>
                        {person.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      {person.phone}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      <div className="max-w-[180px] truncate mx-auto" title={`${person.originalProvince || ''}-${person.originalCity || ''}-${person.originalCommunity || ''}`}>
                        {`${person.originalProvince || ''}-${person.originalCity || ''}-${person.originalCommunity || ''}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      <div className="max-w-[180px] truncate mx-auto" title={`${person.targetProvince || ''}-${person.targetCity || ''}-${person.targetCommunity || ''}`}>
                        {`${person.targetProvince || ''}-${person.targetCity || ''}-${person.targetCommunity || ''}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      <div className="max-w-[230px] truncate mx-auto" title={person.targetAddress}>
                        {person.targetAddress}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      <span className={cn("inline-block px-2 py-0.5 rounded text-xs", getMedicalInsuranceStyle(person.medicalInsuranceStatus))}>
                        {person.medicalInsuranceStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                      <span className={cn("text-sm", getVolunteerLevelStyle(person.volunteerLevel))}>
                        {person.volunteerLevel}
                      </span>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap sticky right-0 bg-background z-10 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(person)}
                          className="text-gray-600 hover:text-primary hover:bg-primary/10"
                        >
                          查看/编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => requestDelete(person)}
                          className="text-red-400 hover:bg-red-50 hover:text-red-500"
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-muted-foreground py-12">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </>

      {/* Pagination - 新实现 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-sm text-muted-foreground">
          共 {totalCount} 条数据，当前显示 {currentStart}-{currentEnd}
        </span>
        <div className="flex items-center gap-2">
          {/* 页码数字与切换 */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={currentPage <= 1}
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {visiblePages.map((page, index) => (
                page === "ellipsis-left" || page === "ellipsis-right" ? (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`${page}-${index}`}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      className={cn(
                        "transition-all duration-75",
                        page === currentPage
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : ""
                      )}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={currentPage >= totalPages}
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setIsDeleting(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="items-center text-center">
            {warningIcon}
            <DialogTitle className="mt-2 text-base font-semibold">
              确定要删除这条数据嘛
            </DialogTitle>
            <DialogDescription className="text-xs">
              此删除操作无法撤销，有数据丢失风险，请再次确认
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              className="bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入弹窗 */}
      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setImportDialogOpen(false)
            setImportFile(null)
            setIsUploading(false)
            if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden">
          <div className="flex flex-col">
            {/* 头部：标题 + 关闭 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-muted">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <DialogHeader className="p-0">
                  <DialogTitle className="text-base font-semibold">
                    上传文件
                  </DialogTitle>
                  {/* <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                    请按照模板要求上传 XLSX 文件
                  </DialogDescription> */}
                </DialogHeader>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="关闭"
                >
                  {/* <X className="w-4 h-4" /> */}
                </button>
              </DialogClose>
            </div>

            {/* 选择文件区域 */}
            <div className="px-6 py-5">
              <input
                ref={importDialogFileInputRef}
                type="file"
                accept={ACCEPTED_EXCEL_EXTENSIONS}
                className="hidden"
                onChange={handleFileSelect}
              />

              {!importFile ? (
                <button
                  type="button"
                  onClick={() => importDialogFileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors py-10 flex flex-col items-center justify-center gap-3 cursor-pointer group bg-muted/40"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    请按照模板要求上传 XLSX 文件
                  </span>
                </button>
              ) : (
                <div className="w-full rounded-xl border border-muted-foreground/20 bg-muted/40 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{importFile.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="shrink-0 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="px-6 pb-5 pt-3 border-t border-muted">
              <DialogFooter className="sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-gray-200 text-muted-foreground hover:bg-gray-300"
                  onClick={() => {
                    setImportDialogOpen(false)
                    setImportFile(null)
                    if (importDialogFileInputRef.current) importDialogFileInputRef.current.value = ""
                  }}
                  disabled={isUploading}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleImportUpload}
                  disabled={!importFile || isUploading}
                >
                  {isUploading ? "上传中..." : "上传"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
