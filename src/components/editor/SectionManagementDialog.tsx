"use client";
import { useTranslations } from "next-intl";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DraggableDialog } from "@/components/ui/draggable-dialog";
import LayoutSetting from "./layout/LayoutSetting";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { generateUUID } from "@/utils/uuid";

interface SectionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionManagementDialog({
  open,
  onOpenChange,
}: SectionManagementDialogProps) {
  const t = useTranslations("workbench.sidePanel");
  const {
    activeResume,
    setActiveSection,
    toggleSectionVisibility,
    updateMenuSections,
    reorderSections,
    addCustomData,
  } = useResumeStore();

  const { menuSections = [], activeSection } = activeResume || {};

  const handleCreateSection = () => {
    const customSections = menuSections.filter((s) =>
      s.id.startsWith("custom")
    );
    const nextNum = customSections.length + 1;
    const sectionId = `custom-${nextNum}`;
    const newSection = {
      id: sectionId,
      title: sectionId,
      icon: "➕",
      enabled: true,
      order: menuSections.length,
    };

    updateMenuSections([...menuSections, newSection]);
    addCustomData(sectionId);
  };

  return (
    <DraggableDialog 
      open={open} 
      onOpenChange={onOpenChange}
      className="max-w-2xl max-h-[80vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>模块管理</DialogTitle>
        <DialogDescription>
          管理简历模块的显示、排序和删除
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <LayoutSetting
          menuSections={menuSections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          toggleSectionVisibility={toggleSectionVisibility}
          updateMenuSections={updateMenuSections}
          reorderSections={reorderSections}
        />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCreateSection}
          className="flex justify-center w-full rounded-lg items-center gap-2 py-2 px-3 text-sm font-medium text-primary bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("layout.addCustomSection")}
        </motion.button>
      </div>
    </DraggableDialog>
  );
}

