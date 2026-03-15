"use client"
import { ElderlyEditSheet } from './elderly-edit-sheet';
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Upload, Download, FileSpreadsheet, X, RotateCcw, List } from "lucide-react"
import type { ElderlyPerson } from "@/app/page"
import { cn } from "@/lib/utils"
import { useAppToast } from "@/components/app-toast"

type ElderlyTableProps = {
  title: string
  onEdit: (person: ElderlyPerson) => void
  onAddNew: () => void
  mode: 'in' | 'out'
}

export function ElderlyTable({ title, onEdit, onAddNew, mode }: ElderlyTableProps) {
  // ----- 分页配置与状态 -----
  const pageSize = 10
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
  const { currentAccount } = useAccount();

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
        spouseLiving: item.spouse_living,
        spouseName: item.spouse_name,
        emergencyContact: item.emergency_contact,
        emergencyRelation: item.emergency_contact_relation,
        emergencyPhone: item.emergency_phone,
        residenceStartDate: item.residence_start_date,
        residenceEndDate: item.residence_end_date,
        healthStatus: item.health_status,
        healthNote: item.health_details || "",
        hobbies: item.talents || "",
      }));
      setSourceData(translated);
      setPeople(translated);
    } else {
      setSourceData([]);
      setPeople([]);
    }
  }, [currentAccount?.id, mode, showToast]);

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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (ext !== ".xlsx" && ext !== ".xls") {
        showToast({ description: "文件格式不正确，请上传 .xlsx 或 .xls 格式的文件", duration: 3000 })
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      if (!ACCEPTED_EXCEL_TYPES.includes(file.type) && ext !== ".xlsx" && ext !== ".xls") {
        showToast({ description: "文件格式不正确，请上传 .xlsx 或 .xls 格式的文件", duration: 3000 })
        if (fileInputRef.current) fileInputRef.current.value = ""
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
      // TODO: 替换为真实的后端上传接口
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      showToast({ description: "批量导入成功", duration: 3000 })
      setImportDialogOpen(false)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      // 上传后自动刷新
      fetchElderlyData()
    } catch {
      showToast({ description: "导入失败，请重试", duration: 3000 })
    } finally {
      setIsUploading(false)
    }
  }, [importFile, showToast, fetchElderlyData])

  const handleRemoveFile = useCallback(() => {
    setImportFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  // ------------ 新分页逻辑开始 -------------
  // 总数与分页派生
  const totalCount = people.length
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1)

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
          onClick={() => setImportDialogOpen(true)}
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
                      {/* 修复：此处应使用 person.userId 而非 person.user_id */}
                      {person.userId}
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
                      <ElderlyEditSheet
                        initialData={person}
                        trigger={
                          <Button variant="outline" size="sm">
                            查看/编辑
                          </Button>
                        }
                        // 👇 下面这 4 个就是补齐的缺失参数
                        isNew={false}              // 明确告诉组件：这是编辑老数据，不是新增
                        open={false}           // 因为我们用了 trigger 按钮，开合状态交给组件内部处理即可
                        onClose={() => {}}         // 塞一个空函数占位，防止 TypeScript 报错
                        onSave={fetchElderlyData}  // 极其关键：保存成功后，重新调用拉取云端数据的函数，刷新表格！
                      />
                        <Button variant="destructive" size="sm" onClick={() => requestDelete(person)}>
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
          共 {people.length} 条数据
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
              {
                Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <PaginationItem key={page}>
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
                ))
              }
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
            if (fileInputRef.current) fileInputRef.current.value = ""
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg font-semibold">
              批量导入数据
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              请按照模版要求上传 .xlsx / .xls 文件
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXCEL_EXTENSIONS}
              className="hidden"
              onChange={handleFileSelect}
            />

            {!importFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors py-10 flex flex-col items-center justify-center gap-3 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  选择您要上传的文件
                </span>
              </button>
            ) : (
              <div className="w-full rounded-lg border border-muted-foreground/20 bg-muted/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{importFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="shrink-0 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              className="bg-muted text-muted-foreground hover:bg-muted/80"
              style={{ backgroundColor: "#e5e7eb" }} // tailwind bg-gray-200 (#e5e7eb)，比bg-muted略深
              onClick={() => {
                setImportDialogOpen(false)
                setImportFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
