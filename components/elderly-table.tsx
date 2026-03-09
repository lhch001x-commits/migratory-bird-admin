"use client"

import { useState } from "react"
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
import { Plus, Upload, Download, RotateCcw, Search, List } from "lucide-react"
import type { ElderlyPerson } from "@/app/page"
import { cn } from "@/lib/utils"

// Mock data for elderly people
const mockData: ElderlyPerson[] = [
  {
    id: "1",
    name: "张建国",
    age: 72,
    gender: "男",
    hometown: "河北-石家庄",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "待抵达",
    targetCommunity: "黄花岗社区",
    volunteerLevel: "候鸟老年人才",
    spouseLiving: "是",
    spouseName: "王润玉",
    emergencyContact: "张悦",
    emergencyRelation: "子女",
    emergencyPhone: "13213321211",
    residenceStartDate: "2024-11-21",
    residenceEndDate: "2025-03-01",
    originalProvince: "河北",
    originalCity: "石家庄",
    targetProvince: "广东",
    targetCity: "广州",
    healthStatus: "完全自理",
    healthNote: "患有高血压慢性病，对抗生素药物存在过敏现象",
    hobbies: "下象棋，打太极拳",
  },
  {
    id: "2",
    name: "张建国",
    age: 65,
    gender: "女",
    hometown: "河北-张家口",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "待抵达",
    targetCommunity: "黄花岗社区",
    volunteerLevel: "候鸟老年志愿者",
  },
  {
    id: "3",
    name: "张建国",
    age: 72,
    gender: "男",
    hometown: "河北-承德",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "居住中",
    targetCommunity: "黄花岗社区",
    volunteerLevel: "普通候鸟老人",
  },
  {
    id: "4",
    name: "张建国",
    age: 60,
    gender: "女",
    hometown: "北京",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "已返乡",
    targetCommunity: "黄花岗社区",
    volunteerLevel: "普通候鸟老人",
  },
  {
    id: "5",
    name: "张建国",
    age: 63,
    gender: "女",
    hometown: "天津",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "居住中",
    targetCommunity: "白云山社区",
    volunteerLevel: "候鸟老年人才",
  },
  {
    id: "6",
    name: "张建国",
    age: 60,
    gender: "女",
    hometown: "天津",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "已返乡",
    targetCommunity: "白云山社区",
    volunteerLevel: "普通候鸟老人",
  },
  {
    id: "7",
    name: "张建国",
    age: 73,
    gender: "男",
    hometown: "吉林-长春",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "已返乡",
    targetCommunity: "香雪社区",
    volunteerLevel: "候鸟老年志愿者",
  },
  {
    id: "8",
    name: "张建国",
    age: 64,
    gender: "男",
    hometown: "河北-张家口",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "居住中",
    targetCommunity: "黄花岗社区",
    volunteerLevel: "候鸟老年人才",
  },
  {
    id: "9",
    name: "张建国",
    age: 68,
    gender: "女",
    hometown: "河北-石家庄",
    originalCommunity: "桥东三里桥社区",
    phone: "13323321031",
    status: "已返乡",
    targetCommunity: "香雪社区",
    volunteerLevel: "候鸟老年志愿者",
  },
]

type ElderlyTableProps = {
  title: string
  onEdit: (person: ElderlyPerson) => void
  onAddNew: () => void
}

export function ElderlyTable({ title, onEdit, onAddNew }: ElderlyTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchParams, setSearchParams] = useState({
    name: "",
    hometown: "",
    targetCommunity: "",
    phone: "",
    status: "",
    volunteerLevel: "",
  })

  const totalItems = 132
  const totalPages = 10

  const handleReset = () => {
    setSearchParams({
      name: "",
      hometown: "",
      targetCommunity: "",
      phone: "",
      status: "",
      volunteerLevel: "",
    })
  }

  const handleDelete = (id: string) => {
    console.log("删除:", id)
  }

  const handleVolunteerService = (id: string) => {
    console.log("志愿服务:", id)
  }

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

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <List className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">列表</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">候鸟老人信息</span>
      </div>

      {/* Search Section */}
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium mb-4">候鸟老人信息查询</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-16">
              姓 名：
            </label>
            <Input
              placeholder=""
              value={searchParams.name}
              onChange={(e) =>
                setSearchParams({ ...searchParams, name: e.target.value })
              }
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-16">
              原住地：
            </label>
            <Input
              placeholder=""
              value={searchParams.hometown}
              onChange={(e) =>
                setSearchParams({ ...searchParams, hometown: e.target.value })
              }
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20">
              迁入社区：
            </label>
            <Input
              placeholder=""
              value={searchParams.targetCommunity}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  targetCommunity: e.target.value,
                })
              }
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={handleReset}
              className="bg-gray-600 text-white hover:bg-gray-700 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重 置
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-16">
              手机号：
            </label>
            <Input
              placeholder=""
              value={searchParams.phone}
              onChange={(e) =>
                setSearchParams({ ...searchParams, phone: e.target.value })
              }
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20">
              当前状态：
            </label>
            <Select
              value={searchParams.status}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, status: value })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="待抵达">待抵达</SelectItem>
                <SelectItem value="居住中">居住中</SelectItem>
                <SelectItem value="已返乡">已返乡</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap w-20">
              志愿等级：
            </label>
            <Select
              value={searchParams.volunteerLevel}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, volunteerLevel: value })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="候鸟老年人才">候鸟老年人才</SelectItem>
                <SelectItem value="候鸟老年志愿者">候鸟老年志愿者</SelectItem>
                <SelectItem value="普通候鸟老人">普通候鸟老人</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gray-600 text-white hover:bg-gray-700 gap-2">
              <Search className="w-4 h-4" />
              查 询
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-4">
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          添加新信息
        </Button>
        <Button variant="outline" className="gap-2 text-primary border-primary hover:bg-primary/10">
          <Upload className="w-4 h-4" />
          批量导入
        </Button>
        <Button variant="outline" className="gap-2 text-primary border-primary hover:bg-primary/10">
          <Download className="w-4 h-4" />
          下载模板
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">姓名</TableHead>
              <TableHead className="text-center">年龄</TableHead>
              <TableHead className="text-center">性别</TableHead>
              <TableHead className="text-center">原住地</TableHead>
              <TableHead className="text-center">原住地社区</TableHead>
              <TableHead className="text-center">手机号</TableHead>
              <TableHead className="text-center">当前状态</TableHead>
              <TableHead className="text-center">迁入地社区</TableHead>
              <TableHead className="text-center w-32">志愿等级</TableHead>
              <TableHead className="text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="text-center">{person.name}</TableCell>
                <TableCell className="text-center">{person.age}</TableCell>
                <TableCell className="text-center">{person.gender}</TableCell>
                <TableCell className="text-center">{person.hometown}</TableCell>
                <TableCell className="text-center">
                  {person.originalCommunity}
                </TableCell>
                <TableCell className="text-center">{person.phone}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs",
                      getStatusStyle(person.status)
                    )}
                  >
                    {person.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {person.targetCommunity}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn("text-xs", getVolunteerLevelStyle(person.volunteerLevel))}>
                    {person.volunteerLevel}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(person)}
                      className="text-primary hover:underline text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleVolunteerService(person.id)}
                      className="text-primary hover:underline text-sm"
                    >
                      志愿服务
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="text-destructive hover:underline text-sm"
                    >
                      删除
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-sm text-muted-foreground">
          共{totalItems}条数据
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            第{currentPage}页，共{totalPages}页
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                />
              </PaginationItem>
              {[1, 2, 3, 4, 5, 6, 7].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page)
                    }}
                    className={
                      page === currentPage
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
