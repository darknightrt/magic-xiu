import { BasicFieldType } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
export const DEFAULT_FIELD_ORDER: BasicFieldType[] = [
  { id: "1", key: "name", label: "姓名", type: "text", visible: true },

  { id: "2", key: "title", label: "职位", type: "text", visible: true },
  {
    id: "3",
    key: "employementStatus",
    label: "状态",
    type: "text",
    visible: true
  },
  { id: "4", key: "birthDate", label: "生日", type: "date", visible: true },
  { id: "5", key: "email", label: "邮箱", type: "text", visible: true },
  { id: "6", key: "phone", label: "电话", type: "text", visible: true },
  { id: "7", key: "location", label: "所在地", type: "text", visible: true }
];

export const DEFAULT_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "经典模板",
    description: "传统简约的简历布局，适合大多数求职场景",
    thumbnail: "classic",
    layout: "classic",
    colorScheme: {
      primary: "#000000",
      secondary: "#4b5563",
      background: "#ffffff",
      text: "#212529"
    },
    spacing: {
      sectionGap: 24,
      itemGap: 16,
      contentPadding: 32
    },
    basic: {
      layout: "center"
    }
  },
  {
    id: "modern",
    name: "两栏布局",
    description: "经典两栏，突出个人特色",
    thumbnail: "modern",
    layout: "modern",
    colorScheme: {
      primary: "#000000",
      secondary: "#6b7280",
      background: "#ffffff",
      text: "#212529"
    },
    spacing: {
      sectionGap: 20,
      itemGap: 20,
      contentPadding: 1
    },
    basic: {
      layout: "center"
    }
  },
  {
    id: "left-right",
    name: "模块标题背景色",
    description: "模块标题背景鲜明，突出美观特色",
    thumbnail: "leftRight",
    layout: "left-right",
    colorScheme: {
      primary: "#000000",
      secondary: "#9ca3af",
      background: "#ffffff",
      text: "#212529"
    },
    spacing: {
      sectionGap: 24,
      itemGap: 16,
      contentPadding: 32
    },
    basic: {
      layout: "left"
    }
  },
  {
    id: "timeline",
    name: "时间线风格",
    description: "时间线布局，突出经历的时间顺序",
    thumbnail: "timeline",
    layout: "timeline",
    colorScheme: {
      primary: "#18181b",
      secondary: "#64748b",
      background: "#ffffff",
      text: "#212529"
    },
    spacing: {
      sectionGap: 1,
      itemGap: 12,
      contentPadding: 24
    },
    basic: {
      layout: "right"
    }
  },
  {
    id: "classic-vertical",
    name: "经典上下结构",
    description: "顶部整宽色块头部，内容上下分区的经典布局",
    thumbnail: "classicVertical",
    layout: "classic-vertical",
    colorScheme: {
      primary: "#1d4ed8",
      secondary: "#4b5563",
      background: "#ffffff",
      text: "#111827"
    },
    spacing: {
      sectionGap: 24,
      itemGap: 16,
      contentPadding: 32
    },
    basic: {
      layout: "left"
    }
  },
  {
    id: "gray-split",
    name: "灰色左右分栏",
    description: "左侧灰色信息栏，右侧白色内容区，层次感分明",
    thumbnail: "graySplit",
    layout: "gray-split",
    colorScheme: {
      primary: "#374151",
      secondary: "#9ca3af",
      background: "#ffffff",
      text: "#111827"
    },
    spacing: {
      sectionGap: 24,
      itemGap: 16,
      contentPadding: 32
    },
    basic: {
      layout: "center"
    }
  },
  {
    id: "popular-columns",
    name: "热门经典分栏",
    description: "顶部色带 + 轻量分栏的现代经典布局",
    thumbnail: "popularColumns",
    layout: "popular-columns",
    colorScheme: {
      primary: "#b45309",
      secondary: "#6b7280",
      background: "#ffffff",
      text: "#111827"
    },
    spacing: {
      sectionGap: 20,
      itemGap: 16,
      contentPadding: 28
    },
    basic: {
      layout: "center"
    }
  },
  {
    id: "demo-three",
    name: "热门个人模版",
    description: "现代简约风格，顶部金色装饰条，左侧导航栏，右侧内容区，蓝白灰配色",
    thumbnail: "demoThree",
    layout: "demo-three",
    colorScheme: {
      primary: "#1e3a8a",
      secondary: "#d4af37",
      background: "#f5f6fb",
      text: "#111827"
    },
    spacing: {
      sectionGap: 28,
      itemGap: 18,
      contentPadding: 32
    },
    basic: {
      layout: "center"
    }
  }
];

export const GITHUB_REPO_URL = "https://github.com/JOYCEQL/magic-resume";

export const PDF_EXPORT_CONFIG = {
  SERVER_URL:
    "https://1255612844-0z3iovadu8.ap-chengdu.tencentscf.com/generate-pdf",
  TIMEOUT: 30000, // 30秒超时
  MAX_RETRY: 3 // 最大重试次数
} as const;
