"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import type { ResumeData, Experience, Education, Project } from "@/types/resume";
import AutoOptimizeButton from "./AutoOptimizeButton";

interface DiagnosisIssue {
  category: string;
  count: number;
  details: string[];
}

interface DiagnosisResult {
  score: number;
  totalIssues: number;
  issues: DiagnosisIssue[];
}

// 简历评分和问题检测
const analyzeResume = (resume: ResumeData): DiagnosisResult => {
  const issues: DiagnosisIssue[] = [];
  let totalIssues = 0;

  // 1. 基本信息检查
  const basicIssues: string[] = [];
  if (!resume.basic.name || resume.basic.name.trim() === "") {
    basicIssues.push("缺少姓名");
  }
  if (!resume.basic.email || resume.basic.email.trim() === "") {
    basicIssues.push("缺少邮箱");
  }
  if (!resume.basic.phone || resume.basic.phone.trim() === "") {
    basicIssues.push("缺少电话");
  }
  if (basicIssues.length > 0) {
    issues.push({
      category: "基本信息",
      count: basicIssues.length,
      details: basicIssues,
    });
    totalIssues += basicIssues.length;
  }

  // 2. 工作/实习经历检查
  const experienceIssues: string[] = [];
  if (resume.experience.length === 0) {
    experienceIssues.push("缺少工作/实习经历");
  } else {
    resume.experience.forEach((exp, index) => {
      if (!exp.company || exp.company.trim() === "") {
        experienceIssues.push(`第${index + 1}条经历缺少公司名称`);
      }
      if (!exp.position || exp.position.trim() === "") {
        experienceIssues.push(`第${index + 1}条经历缺少职位`);
      }
      if (!exp.details || exp.details.trim() === "" || exp.details.trim().length < 20) {
        experienceIssues.push(`第${index + 1}条经历描述过于简短（建议至少20字）`);
      }
    });
  }
  if (experienceIssues.length > 0) {
    issues.push({
      category: "工作/实习经历",
      count: experienceIssues.length,
      details: experienceIssues,
    });
    totalIssues += experienceIssues.length;
  }

  // 3. 教育经历检查
  const educationIssues: string[] = [];
  if (resume.education.length === 0) {
    educationIssues.push("缺少教育经历");
  } else {
    resume.education.forEach((edu, index) => {
      if (!edu.school || edu.school.trim() === "") {
        educationIssues.push(`第${index + 1}条教育经历缺少学校名称`);
      }
      if (!edu.major || edu.major.trim() === "") {
        educationIssues.push(`第${index + 1}条教育经历缺少专业`);
      }
    });
  }
  if (educationIssues.length > 0) {
    issues.push({
      category: "教育经历",
      count: educationIssues.length,
      details: educationIssues,
    });
    totalIssues += educationIssues.length;
  }

  // 4. 项目经验检查
  const projectIssues: string[] = [];
  if (resume.projects.length === 0) {
    projectIssues.push("缺少项目经验");
  } else {
    resume.projects.forEach((proj, index) => {
      if (!proj.name || proj.name.trim() === "") {
        projectIssues.push(`第${index + 1}个项目缺少项目名称`);
      }
      if (!proj.description || proj.description.trim() === "" || proj.description.trim().length < 20) {
        projectIssues.push(`第${index + 1}个项目描述过于简短（建议至少20字）`);
      }
    });
  }
  if (projectIssues.length > 0) {
    issues.push({
      category: "项目经验",
      count: projectIssues.length,
      details: projectIssues,
    });
    totalIssues += projectIssues.length;
  }

  // 5. 技能检查
  const skillIssues: string[] = [];
  if (!resume.skillContent || resume.skillContent.trim() === "") {
    skillIssues.push("缺少专业技能");
  } else if (resume.skillContent.trim().length < 10) {
    skillIssues.push("专业技能描述过于简短");
  }
  if (skillIssues.length > 0) {
    issues.push({
      category: "专业技能",
      count: skillIssues.length,
      details: skillIssues,
    });
    totalIssues += skillIssues.length;
  }

  // 6. 校内经历检查（如果有自定义数据）
  const campusIssues: string[] = [];
  const campusData = resume.customData["campus"] || resume.customData["校内经历"];
  if (!campusData || campusData.length === 0) {
    // 可选，不强制要求
  } else {
    campusData.forEach((item, index) => {
      if (!item.title || item.title.trim() === "") {
        campusIssues.push(`第${index + 1}条校内经历缺少标题`);
      }
    });
  }
  if (campusIssues.length > 0) {
    issues.push({
      category: "校内经历",
      count: campusIssues.length,
      details: campusIssues,
    });
    totalIssues += campusIssues.length;
  }

  // 计算分数（满分100，每个问题扣分）
  const maxScore = 100;
  const deductionPerIssue = 5; // 每个问题扣5分
  const score = Math.max(0, maxScore - totalIssues * deductionPerIssue);

  return {
    score: Math.round(score),
    totalIssues,
    issues,
  };
};

// 环形进度图组件
const CircularProgress: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* 背景圆环（灰色） */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-gray-300 dark:text-gray-700"
          />
          {/* 进度圆环（蓝色渐变） */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        {/* 中心分数 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {score}
          </span>
        </div>
      </div>
      {/* 下方标签 */}
      <div className="mt-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        AI智能诊断
      </div>
    </div>
  );
};

// 分类建议项组件
const CategoryItem: React.FC<{
  category: string;
  count: number;
  details: string[];
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, count, details, isExpanded, onToggle }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {category}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {count} 处问题
          </span>
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{count}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-3 pt-2 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50">
          <ul className="space-y-2">
            {details.map((detail, index) => (
              <li
                key={index}
                className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2"
              >
                <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ResumeDiagnosisPanel: React.FC = () => {
  const { activeResume } = useResumeStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const diagnosis = useMemo(() => {
    if (!activeResume) return null;
    return analyzeResume(activeResume);
  }, [activeResume]);

  if (!activeResume || !diagnosis) return null;

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // 生成提示文案
  const getPromptText = () => {
    if (diagnosis.totalIssues === 0) {
      return "你的简历内容完整，继续保持！";
    }
    return `你的简历内容尚有部分缺失，还有${diagnosis.totalIssues}处可以改进，再加把劲儿，机会总是留给准备充分的人。`;
  };

  return (
    <div className="w-full max-w-sm bg-gray-50 dark:bg-neutral-900 rounded-lg p-5 space-y-5 shadow-lg">
      {/* 顶部提示文案 */}
      <div className="bg-neutral-800 dark:bg-neutral-950 rounded-lg p-3">
        <p className="text-sm text-gray-100 leading-relaxed">
          {getPromptText()}
        </p>
      </div>

      {/* AI智能诊断环形进度图 */}
      <div className="flex flex-col items-center">
        <CircularProgress score={diagnosis.score} size={120} />
      </div>

      {/* 优化建议总数 */}
      {diagnosis.totalIssues > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            简历诊断优化建议：共
            <span className="text-orange-500 font-semibold mx-1">
              {diagnosis.totalIssues}
            </span>
            条
          </p>
        </div>
      )}

      {/* 一键优化按钮 */}
      <div className="flex justify-center">
        <AutoOptimizeButton />
      </div>

      {/* 分类优化建议列表 */}
      {diagnosis.issues.length > 0 && (
        <div className="space-y-2.5">
          {diagnosis.issues.map((issue) => (
            <CategoryItem
              key={issue.category}
              category={issue.category}
              count={issue.count}
              details={issue.details}
              isExpanded={expandedCategories.has(issue.category)}
              onToggle={() => toggleCategory(issue.category)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeDiagnosisPanel;

