"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/store/useResumeStore";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { cn } from "@/lib/utils";
import type { Experience, Education, Project } from "@/types/resume";

// 标点符号优化
const optimizePunctuation = (text: string): string => {
  // 替换常见错误标点
  return text
    .replace(/\s+([，。！？；：])/g, "$1") // 移除标点前的空格
    .replace(/([，。！？；：])\s+/g, "$1") // 移除标点后的空格
    .replace(/([，。！？；：])([^，。！？；：\s])/g, "$1 $2") // 标点后添加空格（如果需要）
    .replace(/\s+/g, " ") // 多个空格合并为一个
    .trim();
};

// 经历排序（按时间倒序）
const sortExperiences = (experiences: Experience[]): Experience[] => {
  return [...experiences].sort((a, b) => {
    const dateA = extractDate(a.date);
    const dateB = extractDate(b.date);
    return dateB - dateA; // 倒序
  });
};

const sortEducations = (educations: Education[]): Education[] => {
  return [...educations].sort((a, b) => {
    const dateA = extractDate(a.endDate || a.startDate);
    const dateB = extractDate(b.endDate || b.startDate);
    return dateB - dateA; // 倒序
  });
};

const sortProjects = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    const dateA = extractDate(a.date);
    const dateB = extractDate(b.date);
    return dateB - dateA; // 倒序
  });
};

// 提取日期（支持多种格式）
const extractDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  
  // 尝试解析 YYYY-MM 格式
  const match = dateStr.match(/(\d{4})-(\d{2})/);
  if (match) {
    return new Date(`${match[1]}-${match[2]}-01`).getTime();
  }
  
  // 尝试解析 YYYY 格式
  const yearMatch = dateStr.match(/(\d{4})/);
  if (yearMatch) {
    return new Date(`${yearMatch[1]}-01-01`).getTime();
  }
  
  return 0;
};

// AI优化文本内容
const optimizeTextWithAI = async (
  text: string,
  apiKey: string,
  model: string,
  modelType: string,
  apiEndpoint?: string
): Promise<string> => {
  const modelConfig = AI_MODEL_CONFIGS[modelType as keyof typeof AI_MODEL_CONFIGS];
  if (!modelConfig) {
    throw new Error("Invalid model type");
  }

  const response = await fetch("/api/polish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      apiKey,
      apiEndpoint,
      model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
      modelType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to optimize text");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let optimizedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    optimizedText += chunk;
  }

  return optimizedText;
};

interface AutoOptimizeButtonProps {
  className?: string;
}

const AutoOptimizeButton: React.FC<AutoOptimizeButtonProps> = ({ className }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { activeResume, updateResume, updateBasicInfo, updateExperienceBatch, updateEducationBatch, updateProjectsBatch } = useResumeStore();
  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
  } = useAIConfigStore();

  const handleOptimize = async () => {
    if (!activeResume) {
      toast.error("没有可优化的简历");
      return;
    }

    const config = AI_MODEL_CONFIGS[selectedModel];
    const isConfigured =
      selectedModel === "doubao"
        ? doubaoApiKey && doubaoModelId
        : selectedModel === "openai"
        ? openaiApiKey && openaiModelId && openaiApiEndpoint
        : config.requiresModelId
        ? deepseekApiKey && deepseekModelId
        : deepseekApiKey;

    if (!isConfigured) {
      toast.error("请先配置AI模型");
      return;
    }

    setIsOptimizing(true);

    try {
      const apiKey =
        selectedModel === "doubao"
          ? doubaoApiKey
          : selectedModel === "openai"
          ? openaiApiKey
          : deepseekApiKey;
      const model =
        selectedModel === "doubao"
          ? doubaoModelId
          : selectedModel === "openai"
          ? openaiModelId
          : config.requiresModelId
          ? deepseekModelId
          : deepseekApiKey;

      // 1. 标点符号优化
      const optimizedBasic = { ...activeResume.basic };
      if (optimizedBasic.title) {
        optimizedBasic.title = optimizePunctuation(optimizedBasic.title);
      }
      if (optimizedBasic.name) {
        optimizedBasic.name = optimizePunctuation(optimizedBasic.name);
      }

      // 2. 经历排序
      const sortedExperiences = sortExperiences(activeResume.experience);
      const sortedEducations = sortEducations(activeResume.education);
      const sortedProjects = sortProjects(activeResume.projects);

      // 3. 专业词语优化（使用AI）
      // 优化工作经历描述
      const optimizedExperiences = await Promise.all(
        sortedExperiences.map(async (exp) => {
          if (exp.details) {
            try {
              const optimizedDetails = await optimizeTextWithAI(
                exp.details,
                apiKey,
                model,
                selectedModel,
                selectedModel === "openai" ? openaiApiEndpoint : undefined
              );
              return { ...exp, details: optimizedDetails };
            } catch (error) {
              console.error("Failed to optimize experience:", error);
              return exp;
            }
          }
          return exp;
        })
      );

      // 优化项目描述
      const optimizedProjects = await Promise.all(
        sortedProjects.map(async (proj) => {
          if (proj.description) {
            try {
              const optimizedDescription = await optimizeTextWithAI(
                proj.description,
                apiKey,
                model,
                selectedModel,
                selectedModel === "openai" ? openaiApiEndpoint : undefined
              );
              return { ...proj, description: optimizedDescription };
            } catch (error) {
              console.error("Failed to optimize project:", error);
              return proj;
            }
          }
          return proj;
        })
      );

      // 优化教育经历描述
      const optimizedEducations = await Promise.all(
        sortedEducations.map(async (edu) => {
          if (edu.description) {
            try {
              const optimizedDescription = await optimizeTextWithAI(
                edu.description,
                apiKey,
                model,
                selectedModel,
                selectedModel === "openai" ? openaiApiEndpoint : undefined
              );
              return { ...edu, description: optimizedDescription };
            } catch (error) {
              console.error("Failed to optimize education:", error);
              return edu;
            }
          }
          return edu;
        })
      );

      // 优化技能内容
      let optimizedSkillContent = activeResume.skillContent;
      if (optimizedSkillContent) {
        try {
          optimizedSkillContent = await optimizeTextWithAI(
            optimizedSkillContent,
            apiKey,
            model,
            selectedModel,
            selectedModel === "openai" ? openaiApiEndpoint : undefined
          );
        } catch (error) {
          console.error("Failed to optimize skills:", error);
        }
      }

      // 应用所有优化
      updateBasicInfo(optimizedBasic);
      updateExperienceBatch(optimizedExperiences);
      updateEducationBatch(optimizedEducations);
      updateProjectsBatch(optimizedProjects);
      if (optimizedSkillContent !== activeResume.skillContent && activeResume.id) {
        updateResume(activeResume.id, { skillContent: optimizedSkillContent });
      }

      toast.success("一键优化完成！");
    } catch (error) {
      console.error("Optimization error:", error);
      toast.error("优化过程中出现错误");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2 w-full", className)}>
      <Button
        onClick={handleOptimize}
        disabled={isOptimizing}
        className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white rounded-lg",
          "px-6 py-3 h-auto w-full",
          "font-medium text-base",
          "transition-all duration-200",
          "shadow-md hover:shadow-lg",
          "flex items-center justify-center",
          isOptimizing && "opacity-70 cursor-not-allowed"
        )}
      >
        {isOptimizing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>优化中...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            <span>一键优化</span>
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed px-2">
        (标点符号、经历排序、专业词语一键优化，快人一步)
      </p>
    </div>
  );
};

export default AutoOptimizeButton;

