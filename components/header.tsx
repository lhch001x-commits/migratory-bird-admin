"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "./account-context";
import { Bell, MapPin, User, LogOut, Plus, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  onMessageClick: () => void;
  showGuideBubble?: boolean;
  onCloseGuideBubble?: () => void;
};

export function Header({
  onMessageClick,
  showGuideBubble,
  onCloseGuideBubble,
}: HeaderProps) {
  const unreadCount = 0;
  const { currentAccount, setCurrentAccount, accounts } = useAccount();
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const [bubblePos, setBubblePos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (showGuideBubble && userBtnRef.current) {
      const rect = userBtnRef.current.getBoundingClientRect();
      setBubblePos({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2,
      });
    } else if (!showGuideBubble) {
      setBubblePos(null);
    }
  }, [showGuideBubble]);

  return (
    <>
      <header className="h-14 bg-card border-b border-border pl-6 pr-14 flex items-center justify-end gap-6">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {(currentAccount?.province || "") + (currentAccount?.city || "")}
          </span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              ref={userBtnRef}
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{currentAccount?.name || "HuangHuaGang_User 01"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {/* 账号列表区 */}
            {accounts.map((acc) =>
              acc.id === currentAccount?.id ? (
                <DropdownMenuItem
                  key={acc.id}
                  className="flex items-center justify-start font-medium text-primary bg-orange-50"
                >
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  <span>{acc.name}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={acc.id}
                  className="flex items-center justify-start"
                  onClick={() => setCurrentAccount(acc)}
                >
                  {/* 删除切换icon，仅左对齐账号 */}
                  <span className="ml-6">{acc.name}</span>
                </DropdownMenuItem>
              ),
            )}

            {/* 分割线 */}
            <DropdownMenuSeparator
              className="h-px bg-border"
              style={{ height: "1px" }}
            />

            {/* 添加账号按钮 */}
            <DropdownMenuItem
              className="flex items-center justify-start"
              disabled={accounts.length >= 3}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>添加账号</span>
            </DropdownMenuItem>

            {/* 再加一条分割线 */}
            <DropdownMenuSeparator
              className="h-px bg-border"
              style={{ height: "1px" }}
            />

            {/* 退出登录按钮 */}
            <DropdownMenuItem className="flex items-center justify-start cursor-pointer">
              <LogOut className="w-4 h-4 mr-2 " />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button
          type="button"
          onClick={onMessageClick}
          className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>消息</span>
          {unreadCount > 0 && (
            <span className="absolute -top-[10px] left-10 min-w-[16px] h-[16px] px-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* 指引气泡遮罩层 */}
      {showGuideBubble && bubblePos && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onCloseGuideBubble}
          />
          <div
            className="fixed z-50 bg-white rounded-xl shadow-2xl p-4 w-72 -translate-x-1/2"
            style={{ top: bubblePos.top, left: bubblePos.left }}
          >
            {/* 向上的三角箭头 */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-white" />
            {/* 关闭按钮 */}
            <button
              type="button"
              aria-label="关闭指引"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={onCloseGuideBubble}
            >
              <X className="w-4 h-4" />
            </button>
            {/* 文本内容 */}
            <p className="text-sm font-semibold text-gray-800 mb-1">
              切换账号体验数据流转
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              点击此处可切换至
              <span className="text-orange-500 font-medium">
                「迁入地·社区」
              </span>
              账号，查验候鸟老人数据是否已同步至对应社区。
            </p>
          </div>
        </>
      )}
    </>
  );
}
