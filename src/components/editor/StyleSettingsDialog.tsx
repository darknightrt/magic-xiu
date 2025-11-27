"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResumeStore } from "@/store/useResumeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Type, SpaceIcon, Palette, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_COLORS } from "@/types/resume";
import { motion } from "framer-motion";
import { useMemo } from "react";
import debounce from "lodash/debounce";

interface StyleSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "border shadow-sm",
        "dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-neutral-900/50",
        "bg-white border-gray-100 shadow-gray-100/50"
      )}
    >
      <CardHeader className="p-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Icon
            className={cn("w-4 h-4 text-gray-600", "dark:text-neutral-300")}
          />
          <span className={cn("dark:text-neutral-200", "text-gray-700")}>
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

export function StyleSettingsDialog({
  open,
  onOpenChange,
}: StyleSettingsDialogProps) {
  const t = useTranslations("workbench.sidePanel");
  const {
    activeResume,
    updateGlobalSettings,
    setThemeColor,
  } = useResumeStore();

  const { globalSettings = {} } = activeResume || {};
  const { themeColor = THEME_COLORS[0] } = globalSettings;

  const debouncedSetColor = useMemo(
    () =>
      debounce((value) => {
        setThemeColor(value);
      }, 100),
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>样式排版</DialogTitle>
          <DialogDescription>
            调整简历的字体、间距、颜色等样式设置
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* 主题色设置 */}
          <SettingCard icon={Palette} title={t("theme.title")}>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {THEME_COLORS.map((presetTheme) => (
                  <button
                    key={presetTheme}
                    className={cn(
                      "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                      themeColor === presetTheme
                        ? "border-black dark:border-white"
                        : "dark:border-neutral-800 dark:hover:border-neutral-700 border-gray-100 hover:border-gray-200"
                    )}
                    onClick={() => setThemeColor(presetTheme)}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: presetTheme }}
                    />
                    {themeColor === presetTheme && (
                      <motion.div
                        layoutId="theme-selected"
                        className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-white/20"
                        initial={false}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("theme.custom")}
                </div>
                <motion.input
                  type="color"
                  value={themeColor}
                  onChange={(e) => debouncedSetColor(e.target.value)}
                  className="w-[40px] h-[40px] rounded-lg cursor-pointer overflow-hidden hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </SettingCard>

          {/* 排版设置 */}
          <SettingCard icon={Type} title={t("typography.title")}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("typography.lineHeight.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[globalSettings?.lineHeight || 1.5]}
                    min={1}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      updateGlobalSettings?.({ lineHeight: value })
                    }
                  />
                  <span className="min-w-[3ch] text-sm text-gray-600 dark:text-neutral-300">
                    {globalSettings?.lineHeight}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("typography.baseFontSize.title")}
                </Label>
                <Select
                  value={globalSettings?.baseFontSize?.toString()}
                  onValueChange={(value) =>
                    updateGlobalSettings?.({ baseFontSize: parseInt(value) })
                  }
                >
                  <SelectTrigger className="border border-gray-200 bg-white text-gray-700 transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={cn(
                      "dark:bg-neutral-900 dark:border-neutral-800 dark:text-white",
                      "bg-white border-gray-200"
                    )}
                  >
                    {[12, 13, 14, 15, 16, 18, 20, 24].map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="cursor-pointer transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                      >
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("typography.headerSize.title")}
                </Label>
                <Select
                  value={globalSettings?.headerSize?.toString()}
                  onValueChange={(value) =>
                    updateGlobalSettings?.({ headerSize: parseInt(value) })
                  }
                >
                  <SelectTrigger className="border border-gray-200 bg-white text-gray-700 transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={cn(
                      "dark:bg-neutral-900 dark:border-neutral-800 dark:text-white",
                      "bg-white border-gray-200"
                    )}
                  >
                    {[12, 13, 14, 15, 16, 18, 20, 24].map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="cursor-pointer transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                      >
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("typography.subheaderSize.title")}
                </Label>
                <Select
                  value={globalSettings?.subheaderSize?.toString()}
                  onValueChange={(value) =>
                    updateGlobalSettings?.({ subheaderSize: parseInt(value) })
                  }
                >
                  <SelectTrigger className="border border-gray-200 bg-white text-gray-700 transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={cn(
                      "dark:bg-neutral-900 dark:border-neutral-800 dark:text-white",
                      "bg-white border-gray-200"
                    )}
                  >
                    {[12, 13, 14, 15, 16, 18, 20, 24].map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="cursor-pointer transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                      >
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingCard>

          {/* 间距设置 */}
          <SettingCard icon={SpaceIcon} title={t("spacing.title")}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("spacing.pagePadding.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[globalSettings?.pagePadding || 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      updateGlobalSettings?.({ pagePadding: value })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <div className="flex h-8 w-20 overflow-hidden rounded-md border border-input">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={globalSettings?.pagePadding || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            updateGlobalSettings?.({ pagePadding: value });
                          }
                        }}
                        className="h-full w-12 border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0 no-spinner"
                      />
                    </div>
                    <span className="ml-1 text-sm text-gray-600 dark:text-neutral-300">
                      px
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("spacing.sectionSpacing.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[globalSettings?.sectionSpacing || 0]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      updateGlobalSettings?.({ sectionSpacing: value })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <div className="flex h-8 w-20 overflow-hidden rounded-md border border-input">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={globalSettings?.sectionSpacing || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 100) {
                            updateGlobalSettings?.({ sectionSpacing: value });
                          }
                        }}
                        className="h-full w-12 border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0 no-spinner"
                      />
                    </div>
                    <span className="ml-1 text-sm text-gray-600 dark:text-neutral-300">
                      px
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("spacing.paragraphSpacing.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[globalSettings?.paragraphSpacing || 0]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={([value]) =>
                      updateGlobalSettings?.({ paragraphSpacing: value })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <div className="flex h-8 w-20 overflow-hidden rounded-md border border-input">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={globalSettings?.paragraphSpacing || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            updateGlobalSettings?.({ paragraphSpacing: value });
                          }
                        }}
                        className="h-full w-12 border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0 no-spinner"
                      />
                    </div>
                    <span className="ml-1 text-sm text-gray-600 dark:text-neutral-300">
                      px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SettingCard>

          {/* 模式设置 */}
          <SettingCard icon={Zap} title={t("mode.title")}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("mode.useIconMode.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={globalSettings.useIconMode}
                    onCheckedChange={(checked) =>
                      updateGlobalSettings({
                        useIconMode: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-neutral-300">
                  {t("mode.centerSubtitle.title")}
                </Label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={globalSettings.centerSubtitle}
                    onCheckedChange={(checked) =>
                      updateGlobalSettings({
                        centerSubtitle: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </SettingCard>
        </div>
      </DialogContent>
    </Dialog>
  );
}


