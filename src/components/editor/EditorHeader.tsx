"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Settings, Layout, Type, Upload, FileEdit, PanelsLeftBottom } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import PdfExport from "../shared/PdfExport";
import ThemeToggle from "../shared/ThemeToggle";
import { useResumeStore } from "@/store/useResumeStore";
import { getThemeConfig } from "@/theme/themeConfig";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SectionManagementDialog } from "./SectionManagementDialog";
import { StyleSettingsDialog } from "./StyleSettingsDialog";
import { ImportResumeButton } from "./ImportResumeButton";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATES } from "@/config";
import classic from "@/assets/images/template-cover/classic.png";
import modern from "@/assets/images/template-cover/modern.png";
import leftRight from "@/assets/images/template-cover/left-right.png";
import timeline from "@/assets/images/template-cover/timeline.png";
import classicVertical from "@/assets/images/template-cover/classsic-vertical.png";
import popularColumns from "@/assets/images/template-cover/popular-columns.png";
import demoThree from "@/assets/images/template-cover/demo-three.png";

// 模板选择器包装组件
function TemplateSheetWrapper({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeResume, setTemplate } = useResumeStore();
  const t = useTranslations("templates");
  const currentTemplate =
    DEFAULT_TEMPLATES.find((t) => t.id === activeResume?.templateId) ||
    DEFAULT_TEMPLATES[0];

  const templateImages: { [key: string]: any } = {
    classic,
    modern,
    "left-right": leftRight,
    timeline,
    "classic-vertical": classicVertical,
    "popular-columns": popularColumns,
    "demo-three": demoThree,
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute left-0 top-0 h-full w-1/2 bg-background border-r shadow-lg overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{t("switchTemplate")}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {DEFAULT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setTemplate(template.id);
                onOpenChange(false);
              }}
              className={cn(
                "relative group rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02]",
                template.id === currentTemplate.id
                  ? "border-primary dark:border-primary shadow-lg dark:shadow-primary/30"
                  : "dark:border-neutral-800 dark:hover:border-neutral-700 border-gray-100 hover:border-gray-200"
              )}
            >
              <img
                src={templateImages[template.id]?.src || templateImages[template.id]}
                alt={template.name}
                className="w-full h-auto"
              />
              {template.id === currentTemplate.id && (
                <motion.div
                  layoutId="template-selected"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-white/30"
                >
                  <Layout className="w-6 h-6 text-white dark:text-primary" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EditorHeaderProps {
  isMobile?: boolean;
}

export function EditorHeader({ isMobile }: EditorHeaderProps) {
  const { activeResume, setActiveSection, updateResumeTitle } =
    useResumeStore();
  const { menuSections = [], activeSection } = activeResume || {};
  const themeConfig = getThemeConfig();
  const { errors, selectError } = useGrammarCheck();
  const router = useRouter();
  const t = useTranslations();
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false);
  const visibleSections = menuSections
    ?.filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <motion.header
      className={`h-16 border-b sticky top-0 z-10`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="flex items-center justify-between px-6 h-full pr-2">
        <div className="flex items-center space-x-6  scrollbar-hide">
          <motion.div
            className="flex items-center space-x-2 shrink-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              router.push("/app/dashboard");
            }}
          >
            <span className="text-lg font-semibold">{t("common.title")}</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </motion.div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {errors.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center space-x-1 cursor-pointer">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500 hidden md:inline">
                    发现 {errors.length} 个问题
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">语法检查结果</h4>
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm space-y-1">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p>{error.message}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => selectError(index)}
                              >
                                定位
                              </Button>
                            </div>
                            {error.suggestions.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground font-medium">
                                  建议修改：
                                </p>
                                {error.suggestions.map((suggestion, i) => (
                                  <p
                                    key={i}
                                    className="text-xs mt-1 px-2 py-1 bg-muted rounded"
                                  >
                                    {suggestion}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}

          {/* 功能按钮组 */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            {/* 模块管理 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSectionDialogOpen(true)}
              className="flex items-center gap-2"
              title="模块管理"
            >
              <Layout className="w-4 h-4" />
              <span className="hidden lg:inline">模块管理</span>
            </Button>

            {/* 更换模板 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTemplateSheetOpen(true)}
              className="flex items-center gap-2"
              title="更换模板"
            >
              <PanelsLeftBottom className="w-4 h-4" />
              <span className="hidden lg:inline">更换模板</span>
            </Button>

            {/* 样式排版 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStyleDialogOpen(true)}
              className="flex items-center gap-2"
              title="样式排版"
            >
              <Type className="w-4 h-4" />
              <span className="hidden lg:inline">样式排版</span>
            </Button>
          </div>

          {/* 导入导出组 */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ImportResumeButton />
            <div className="hidden md:block">
              <PdfExport />
            </div>
          </div>

          {/* 重命名 */}
          <div className="flex items-center gap-2">
            {isRenaming ? (
              <Input
                defaultValue={activeResume?.title || ""}
                onBlur={(e) => {
                  updateResumeTitle(e.target.value || "未命名简历");
                  setIsRenaming(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateResumeTitle(e.currentTarget.value || "未命名简历");
                    setIsRenaming(false);
                  } else if (e.key === "Escape") {
                    setIsRenaming(false);
                  }
                }}
                autoFocus
                className="w-40 md:w-60 text-sm"
                placeholder="简历名称"
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRenaming(true)}
                className="flex items-center gap-2 text-sm font-medium"
                title="重命名简历"
              >
                <FileEdit className="w-4 h-4" />
                <span className="max-w-[120px] md:max-w-[200px] truncate">
                  {activeResume?.title || "未命名简历"}
                </span>
              </Button>
            )}
          </div>

          {/* 主题切换和更多设置 */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSectionDialogOpen(true)}>
                  <Layout className="w-4 h-4 mr-2" />
                  模块管理
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStyleDialogOpen(true)}>
                  <Type className="w-4 h-4 mr-2" />
                  样式排版
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="md:hidden">
                  <DropdownMenuItem onClick={() => setTemplateSheetOpen(true)}>
                    <PanelsLeftBottom className="w-4 h-4 mr-2" />
                    更换模板
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div>
                      <PdfExport />
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 对话框 */}
        <SectionManagementDialog
          open={sectionDialogOpen}
          onOpenChange={setSectionDialogOpen}
        />
        <StyleSettingsDialog
          open={styleDialogOpen}
          onOpenChange={setStyleDialogOpen}
        />
        {templateSheetOpen && (
          <TemplateSheetWrapper
            open={templateSheetOpen}
            onOpenChange={setTemplateSheetOpen}
          />
        )}
      </div>
    </motion.header>
  );
}

