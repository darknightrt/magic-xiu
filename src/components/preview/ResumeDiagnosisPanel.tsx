"use client";

import React, { useState, useEffect } from "react";
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

// 评分规则配置（基础分100分，采用加减分制）
const SCORING_RULES = {
  // 基础分数
  BASE_SCORE: 100,
  
  // 基本信息（加分13分 / 减分13分）- 不参与大模块减分
  BASIC_INFO: {
    name: { add: 3, deduct: 3 },           // 姓名：有+3分，无-3分
    email: { add: 2, deduct: 2 },          // 邮箱：有+2分，无-2分
    phone: { add: 3, deduct: 3 },          // 电话：有+3分，无-3分
    title: { add: 5, deduct: 5 },          // 职位/标题：有+5分，无-5分
  },
  
  // 工作经历（大模块默认15分）
  EXPERIENCE: {
    moduleDeduct: 15,                      // 大模块缺失减分：-15分
    hasExperience: { add: 5, deduct: 5 },  // 有至少1条工作经历：有+5分，无-5分
    perCompleteExp: { add: 5, deduct: 5 }, // 每条完整经历：完整+5分，不完整-5分
    qualityBonus: { add: 5, deduct: 3 },   // 描述质量：超过20字+5分，不足-3分
    maxExperiences: 2,                     // 最多计算2条经历
  },
  
  // 教育经历（大模块默认15分）
  EDUCATION: {
    moduleDeduct: 15,                      // 大模块缺失减分：-15分
    hasEducation: { add: 5, deduct: 5 },   // 有至少1条教育经历：有+5分，无-5分
    perCompleteEdu: { add: 5, deduct: 5 }, // 每条完整教育经历：完整+5分，不完整-5分
    maxEducations: 2,                      // 最多计算2条教育经历
  },
  
  // 项目经验（大模块默认15分）
  PROJECTS: {
    moduleDeduct: 15,                          // 大模块缺失减分：-15分
    hasProject: { add: 5, deduct: 5 },         // 有至少1个项目：有+5分，无-5分
    perCompleteProject: { add: 5, deduct: 5 }, // 每个完整项目：完整+5分，不完整-5分
    qualityBonus: { add: 5, deduct: 3 },       // 描述质量：超过20字+5分，不足-3分
    maxProjects: 3,                            // 最多计算3个项目
  },
  
  // 专业技能（大模块默认15分）
  SKILLS: {
    moduleDeduct: 15,                      // 大模块缺失减分：-15分
    hasSkills: { add: 2, deduct: 5 },      // 有技能内容：有+2分，无-5分
    qualityBonus: { add: 3, deduct: 2 },   // 技能内容质量：超过10字+3分，不足-2分
  },
  
  // 自定义模块（大模块默认10分）
  CUSTOM_MODULE: {
    moduleDeduct: 10,                          // 大模块缺失减分：-10分
    perCompleteModule: { add: 10, deduct: 5 }, // 完整的自定义模块：完整+10分，不完整-5分
    qualityBonus: { add: 5, deduct: 3 },       // 描述质量：超过20字+5分，不足-3分
    maxModules: 1,                             // 最多计算1个自定义模块
  },
  
  // 其他加分项（总分2分）
  BONUS: {
    photo: { add: 2, deduct: 0 },          // 有照片：+2分，无不减分
  },
};

// 简历评分和问题检测（采用加减分制，基础分100分）
const analyzeResume = (resume: ResumeData): DiagnosisResult => {
  const issues: DiagnosisIssue[] = [];
  let totalIssues = 0;
  let score = SCORING_RULES.BASE_SCORE; // 基础分100分

  // 1. 基本信息评分和检查（不参与大模块减分）
  const basicIssues: string[] = [];
  if (resume.basic.name && resume.basic.name.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.name.add;
  } else {
    score -= SCORING_RULES.BASIC_INFO.name.deduct;
    basicIssues.push("缺少姓名");
  }
  
  if (resume.basic.email && resume.basic.email.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.email.add;
  } else {
    score -= SCORING_RULES.BASIC_INFO.email.deduct;
    basicIssues.push("缺少邮箱");
  }
  
  if (resume.basic.phone && resume.basic.phone.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.phone.add;
  } else {
    score -= SCORING_RULES.BASIC_INFO.phone.deduct;
    basicIssues.push("缺少电话");
  }
  
  if (resume.basic.title && resume.basic.title.trim() !== "") {
    score += SCORING_RULES.BASIC_INFO.title.add;
  } else {
    score -= SCORING_RULES.BASIC_INFO.title.deduct;
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

  // 2. 工作/实习经历评分和检查（大模块默认15分）
  const experienceIssues: string[] = [];
  if (resume.experience.length > 0) {
    score += SCORING_RULES.EXPERIENCE.hasExperience.add;
    
    // 计算完整经历的数量（最多2条）
    const experiencesToCheck = resume.experience.slice(0, SCORING_RULES.EXPERIENCE.maxExperiences);
    
    experiencesToCheck.forEach((exp, index) => {
      const hasCompany = exp.company && exp.company.trim() !== "";
      const hasPosition = exp.position && exp.position.trim() !== "";
      const hasDetails = exp.details && exp.details.trim() !== "";
      
      if (hasCompany && hasPosition && hasDetails) {
        // 完整经历加分
        score += SCORING_RULES.EXPERIENCE.perCompleteExp.add;
        // 描述质量检查
        if (exp.details.trim().length >= 20) {
          score += SCORING_RULES.EXPERIENCE.qualityBonus.add;
        } else {
          score -= SCORING_RULES.EXPERIENCE.qualityBonus.deduct;
          experienceIssues.push(`第${index + 1}条经历描述过于简短（建议至少20字）`);
        }
      } else {
        // 不完整经历减分
        score -= SCORING_RULES.EXPERIENCE.perCompleteExp.deduct;
        if (!hasCompany) {
          experienceIssues.push(`第${index + 1}条经历缺少公司名称`);
        }
        if (!hasPosition) {
          experienceIssues.push(`第${index + 1}条经历缺少职位`);
        }
        if (!hasDetails) {
          experienceIssues.push(`第${index + 1}条经历缺少描述`);
        }
      }
    });
  } else {
    // 大模块缺失减分
    score -= SCORING_RULES.EXPERIENCE.moduleDeduct;
    experienceIssues.push("缺少工作/实习经历（-15分）");
  }
  
  if (experienceIssues.length > 0) {
    issues.push({
      category: "工作/实习经历",
      count: experienceIssues.length,
      details: experienceIssues,
    });
    totalIssues += experienceIssues.length;
  }

  // 3. 教育经历评分和检查（大模块默认15分）
  const educationIssues: string[] = [];
  if (resume.education.length > 0) {
    score += SCORING_RULES.EDUCATION.hasEducation.add;
    
    // 计算完整教育经历的数量（最多2条）
    const educationsToCheck = resume.education.slice(0, SCORING_RULES.EDUCATION.maxEducations);
    
    educationsToCheck.forEach((edu, index) => {
      const hasSchool = edu.school && edu.school.trim() !== "";
      const hasMajor = edu.major && edu.major.trim() !== "";
      
      if (hasSchool && hasMajor) {
        // 完整教育经历加分
        score += SCORING_RULES.EDUCATION.perCompleteEdu.add;
      } else {
        // 不完整教育经历减分
        score -= SCORING_RULES.EDUCATION.perCompleteEdu.deduct;
        if (!hasSchool) {
          educationIssues.push(`第${index + 1}条教育经历缺少学校名称`);
        }
        if (!hasMajor) {
          educationIssues.push(`第${index + 1}条教育经历缺少专业`);
        }
      }
    });
  } else {
    // 大模块缺失减分
    score -= SCORING_RULES.EDUCATION.moduleDeduct;
    educationIssues.push("缺少教育经历（-15分）");
  }
  
  if (educationIssues.length > 0) {
    issues.push({
      category: "教育经历",
      count: educationIssues.length,
      details: educationIssues,
    });
    totalIssues += educationIssues.length;
  }

  // 4. 项目经验评分和检查（大模块默认15分）
  const projectIssues: string[] = [];
  if (resume.projects.length > 0) {
    score += SCORING_RULES.PROJECTS.hasProject.add;
    
    // 计算完整项目的数量（最多3个）
    const projectsToCheck = resume.projects.slice(0, SCORING_RULES.PROJECTS.maxProjects);
    
    projectsToCheck.forEach((proj, index) => {
      const hasName = proj.name && proj.name.trim() !== "";
      const hasDescription = proj.description && proj.description.trim() !== "";
      
      if (hasName && hasDescription) {
        // 完整项目加分
        score += SCORING_RULES.PROJECTS.perCompleteProject.add;
        // 描述质量检查
        if (proj.description.trim().length >= 20) {
          score += SCORING_RULES.PROJECTS.qualityBonus.add;
        } else {
          score -= SCORING_RULES.PROJECTS.qualityBonus.deduct;
          projectIssues.push(`第${index + 1}个项目描述过于简短（-3分，建议至少20字）`);
        }
      } else {
        // 不完整项目减分
        score -= SCORING_RULES.PROJECTS.perCompleteProject.deduct;
        if (!hasName) {
          projectIssues.push(`第${index + 1}个项目缺少项目名称`);
        }
        if (!hasDescription) {
          projectIssues.push(`第${index + 1}个项目缺少描述`);
        }
      }
    });
  } else {
    // 大模块缺失减分
    score -= SCORING_RULES.PROJECTS.moduleDeduct;
    projectIssues.push("缺少项目经验（-15分）");
  }
  
  if (projectIssues.length > 0) {
    issues.push({
      category: "项目经验",
      count: projectIssues.length,
      details: projectIssues,
    });
    totalIssues += projectIssues.length;
  }

  // 5. 技能评分和检查（大模块默认15分）
  const skillIssues: string[] = [];
  if (resume.skillContent && resume.skillContent.trim() !== "") {
    score += SCORING_RULES.SKILLS.hasSkills.add;
    // 技能内容质量检查（超过10字）
    if (resume.skillContent.trim().length >= 10) {
      score += SCORING_RULES.SKILLS.qualityBonus.add;
    } else {
      score -= SCORING_RULES.SKILLS.qualityBonus.deduct;
      skillIssues.push("专业技能描述过于简短（-2分，建议至少10字）");
    }
  } else {
    // 大模块缺失减分
    score -= SCORING_RULES.SKILLS.moduleDeduct;
    skillIssues.push("缺少专业技能（-15分）");
  }
  
  if (skillIssues.length > 0) {
    issues.push({
      category: "专业技能",
      count: skillIssues.length,
      details: skillIssues,
    });
    totalIssues += skillIssues.length;
  }

  // 6. 自定义模块评分和检查（大模块默认10分）
  const customModuleIssues: string[] = [];
  const customDataKeys = Object.keys(resume.customData || {});
  let customModuleCount = 0;
  let hasValidCustomModule = false;
  
  if (customDataKeys.length > 0) {
    // 遍历所有自定义模块
    for (const key of customDataKeys) {
      if (customModuleCount >= SCORING_RULES.CUSTOM_MODULE.maxModules) break;
      
      const moduleData = resume.customData[key];
      if (moduleData && moduleData.length > 0) {
        // 检查模块中的每个项目
        moduleData.forEach((item, index) => {
          if (customModuleCount >= SCORING_RULES.CUSTOM_MODULE.maxModules) return;
          
          const hasTitle = item.title && item.title.trim() !== "";
          const hasDescription = item.description && item.description.trim() !== "";
          
          if (hasTitle && hasDescription) {
            hasValidCustomModule = true;
            // 完整的自定义模块加分
            score += SCORING_RULES.CUSTOM_MODULE.perCompleteModule.add;
            customModuleCount++;
            
            // 描述质量检查（超过20字）
            if (item.description.trim().length >= 20) {
              score += SCORING_RULES.CUSTOM_MODULE.qualityBonus.add;
            } else {
              score -= SCORING_RULES.CUSTOM_MODULE.qualityBonus.deduct;
              customModuleIssues.push(`${key}模块第${index + 1}项描述过于简短（-3分，建议至少20字）`);
            }
          } else {
            // 不完整的自定义模块减分
            score -= SCORING_RULES.CUSTOM_MODULE.perCompleteModule.deduct;
            if (!hasTitle) {
              customModuleIssues.push(`${key}模块第${index + 1}项缺少标题`);
            }
            if (!hasDescription) {
              customModuleIssues.push(`${key}模块第${index + 1}项缺少描述`);
            }
          }
        });
      }
    }
  }
  
  // 如果没有任何有效的自定义模块，减去大模块分数
  if (!hasValidCustomModule && customDataKeys.length === 0) {
    score -= SCORING_RULES.CUSTOM_MODULE.moduleDeduct;
    customModuleIssues.push("缺少自定义模块（-10分）");
  }
  
  if (customModuleIssues.length > 0) {
    issues.push({
      category: "自定义模块",
      count: customModuleIssues.length,
      details: customModuleIssues,
    });
    totalIssues += customModuleIssues.length;
  }

  // 7. 其他加分项
  // 照片加分
  if (resume.basic.photo && resume.basic.photo.trim() !== "") {
    score += SCORING_RULES.BONUS.photo.add;
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
  // 直接从 store 获取 activeResume
  const activeResume = useResumeStore((state: { activeResume: ResumeData | null }) => state.activeResume);
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // 使用 useEffect 监听简历数据变化，实时计算分数
  useEffect(() => {
    if (!activeResume) {
      setDiagnosis(null);
      return;
    }
    
    // 计算诊断结果
    const result = analyzeResume(activeResume);
    console.log('简历诊断分数更新:', result.score, '问题数:', result.totalIssues);
    setDiagnosis(result);
  }, [
    // 监听所有可能影响分数的字段
    activeResume?.basic?.name,
    activeResume?.basic?.email,
    activeResume?.basic?.phone,
    activeResume?.basic?.title,
    activeResume?.basic?.photo,
    activeResume?.skillContent,
    // 使用 JSON.stringify 来检测数组/对象的深层变化
    JSON.stringify(activeResume?.basic?.customFields),
    JSON.stringify(activeResume?.experience),
    JSON.stringify(activeResume?.education),
    JSON.stringify(activeResume?.projects),
    JSON.stringify(activeResume?.customData),
  ]);

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


