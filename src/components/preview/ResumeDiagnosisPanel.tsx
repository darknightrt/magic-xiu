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

// 评分规则配置（总分100分）
const SCORING_RULES = {
  // 基本信息（总分20分）
  BASIC_INFO: {
    name: 5,           // 姓名：5分
    email: 5,          // 邮箱：5分
    phone: 5,          // 电话：5分
    title: 5,          // 职位/标题：5分
  },
  // 工作经历（总分30分）
  EXPERIENCE: {
    hasExperience: 10,           // 有至少1条工作经历：10分
    perCompleteExp: 5,           // 每条完整经历：5分（公司+职位+描述）
    qualityBonus: 2,             // 描述质量加分（超过20字）：2分/条
    maxExperiences: 3,           // 最多计算3条经历（最多21分：10+3*5+3*2）
  },
  // 教育经历（总分15分）
  EDUCATION: {
    hasEducation: 5,             // 有至少1条教育经历：5分
    perCompleteEdu: 5,           // 每条完整教育经历：5分（学校+专业）
    maxEducations: 2,            // 最多计算2条教育经历（最多15分：5+2*5）
  },
  // 项目经验（总分20分）
  PROJECTS: {
    hasProject: 5,               // 有至少1个项目：5分
    perCompleteProject: 5,       // 每个完整项目：5分（名称+描述）
    qualityBonus: 2,             // 描述质量加分（超过20字）：2分/个
    maxProjects: 2,              // 最多计算2个项目（最多19分：5+2*5+2*2）
  },
  // 专业技能（总分10分）
  SKILLS: {
    hasSkills: 10,               // 有技能内容：10分
  },
  // 其他加分项（总分5分）
  BONUS: {
    photo: 2,                    // 有照片：2分
    customFields: 3,             // 有自定义字段：3分
  },
};

// 简历评分和问题检测（采用加分制）
const analyzeResume = (resume: ResumeData): DiagnosisResult => {
  const issues: DiagnosisIssue[] = [];
  let totalIssues = 0;
  let score = 0; // 初始分数为0

  // 1. 基本信息评分和检查
  const basicIssues: string[] = [];
  if (resume.basic.name && resume.basic.name.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.name;
  } else {
    basicIssues.push("缺少姓名");
  }
  
  if (resume.basic.email && resume.basic.email.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.email;
  } else {
    basicIssues.push("缺少邮箱");
  }
  
  if (resume.basic.phone && resume.basic.phone.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.phone;
  } else {
    basicIssues.push("缺少电话");
  }
  
  if (resume.basic.title && resume.basic.title.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.title;
  } else {
    basicIssues.push("缺少职位/标题");
  }
  
  if (basicIssues.length > 0) {
    issues.push({
      category: "基本信息",
      count: basicIssues.length,
      details: basicIssues,
    });
    totalIssues += basicIssues.length;
  }

  // 2. 工作/实习经历评分和检查
  const experienceIssues: string[] = [];
  if (resume.experience.length > 0) {
    score += SCORING_RULES.EXPERIENCE.hasExperience;
    
    // 计算完整经历的数量（最多3条）
    const completeExperiences = resume.experience
      .slice(0, SCORING_RULES.EXPERIENCE.maxExperiences)
      .filter((exp) => {
        const hasCompany = exp.company && exp.company.trim() !== "";
        const hasPosition = exp.position && exp.position.trim() !== "";
        const hasDetails = exp.details && exp.details.trim() !== "";
        return hasCompany && hasPosition && hasDetails;
      });
    
    // 每条完整经历加分
    completeExperiences.forEach((exp) => {
      score += SCORING_RULES.EXPERIENCE.perCompleteExp;
      // 描述质量加分
      if (exp.details && exp.details.trim().length >= 20) {
        score += SCORING_RULES.EXPERIENCE.qualityBonus;
      }
    });
    
    // 检查问题
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
  } else {
    experienceIssues.push("缺少工作/实习经历");
  }
  
  if (experienceIssues.length > 0) {
    issues.push({
      category: "工作/实习经历",
      count: experienceIssues.length,
      details: experienceIssues,
    });
    totalIssues += experienceIssues.length;
  }

  // 3. 教育经历评分和检查
  const educationIssues: string[] = [];
  if (resume.education.length > 0) {
    score += SCORING_RULES.EDUCATION.hasEducation;
    
    // 计算完整教育经历的数量（最多2条）
    const completeEducations = resume.education
      .slice(0, SCORING_RULES.EDUCATION.maxEducations)
      .filter((edu) => {
        const hasSchool = edu.school && edu.school.trim() !== "";
        const hasMajor = edu.major && edu.major.trim() !== "";
        return hasSchool && hasMajor;
      });
    
    // 每条完整教育经历加分
    completeEducations.forEach(() => {
      score += SCORING_RULES.EDUCATION.perCompleteEdu;
    });
    
    // 检查问题
    resume.education.forEach((edu, index) => {
      if (!edu.school || edu.school.trim() === "") {
        educationIssues.push(`第${index + 1}条教育经历缺少学校名称`);
      }
      if (!edu.major || edu.major.trim() === "") {
        educationIssues.push(`第${index + 1}条教育经历缺少专业`);
      }
    });
  } else {
    educationIssues.push("缺少教育经历");
  }
  
  if (educationIssues.length > 0) {
    issues.push({
      category: "教育经历",
      count: educationIssues.length,
      details: educationIssues,
    });
    totalIssues += educationIssues.length;
  }

  // 4. 项目经验评分和检查
  const projectIssues: string[] = [];
  if (resume.projects.length > 0) {
    score += SCORING_RULES.PROJECTS.hasProject;
    
    // 计算完整项目的数量（最多2个）
    const completeProjects = resume.projects
      .slice(0, SCORING_RULES.PROJECTS.maxProjects)
      .filter((proj) => {
        const hasName = proj.name && proj.name.trim() !== "";
        const hasDescription = proj.description && proj.description.trim() !== "";
        return hasName && hasDescription;
      });
    
    // 每个完整项目加分
    completeProjects.forEach((proj) => {
      score += SCORING_RULES.PROJECTS.perCompleteProject;
      // 描述质量加分
      if (proj.description && proj.description.trim().length >= 20) {
        score += SCORING_RULES.PROJECTS.qualityBonus;
      }
    });
    
    // 检查问题
    resume.projects.forEach((proj, index) => {
      if (!proj.name || proj.name.trim() === "") {
        projectIssues.push(`第${index + 1}个项目缺少项目名称`);
      }
      if (!proj.description || proj.description.trim() === "" || proj.description.trim().length < 20) {
        projectIssues.push(`第${index + 1}个项目描述过于简短（建议至少20字）`);
      }
    });
  } else {
    projectIssues.push("缺少项目经验");
  }
  
  if (projectIssues.length > 0) {
    issues.push({
      category: "项目经验",
      count: projectIssues.length,
      details: projectIssues,
    });
    totalIssues += projectIssues.length;
  }

  // 5. 技能评分和检查
  const skillIssues: string[] = [];
  if (resume.skillContent && resume.skillContent.trim() !== "") {
    score += SCORING_RULES.SKILLS.hasSkills;
  } else {
    skillIssues.push("缺少专业技能");
  }
  
  if (skillIssues.length > 0) {
    issues.push({
      category: "专业技能",
      count: skillIssues.length,
      details: skillIssues,
    });
    totalIssues += skillIssues.length;
  }

  // 6. 其他加分项
  // 照片加分
  if (resume.basic.photo && resume.basic.photo.trim() !== "") {
    score += SCORING_RULES.BONUS.photo;
  }
  
  // 自定义字段加分
  const customFieldsCount = Object.keys(resume.basic.customFields || {}).length;
  if (customFieldsCount > 0) {
    score += SCORING_RULES.BONUS.customFields;
  }

  // 7. 校内经历检查（可选，不影响分数）
  const campusIssues: string[] = [];
  if (resume.customData) {
    const campusData = resume.customData["campus"] || resume.customData["校内经历"];
    if (campusData && campusData.length > 0) {
      campusData.forEach((item, index) => {
        if (!item.title || item.title.trim() === "") {
          campusIssues.push(`第${index + 1}条校内经历缺少标题`);
        }
      });
    }
  }
  if (campusIssues.length > 0) {
    issues.push({
      category: "校内经历",
      count: campusIssues.length,
      details: campusIssues,
    });
    totalIssues += campusIssues.length;
  }

  // 确保分数在0-100之间
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score: finalScore,
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

