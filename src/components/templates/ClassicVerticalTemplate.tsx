import React from "react";
import GithubContribution from "@/components/shared/GithubContribution";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import ProjectSection from "../preview/ProjectSection";
import CustomSection from "../preview/CustomSection";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";

interface ClassicVerticalTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * 经典上下结构模板
 * 对应示例图 1.png：
 * - 顶部整宽色块头部（包含头像与基础信息）
 * - 下方为单列内容区域，按顺序展示各模块
 */
const ClassicVerticalTemplate: React.FC<ClassicVerticalTemplateProps> = ({
  data,
  template,
}) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    const sectionTitle =
      data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;

    switch (sectionId) {
      case "basic":
        return (
          <>
            <BaseInfo
              basic={data.basic}
              globalSettings={data.globalSettings}
              template={template}
            />
            {data.basic.githubContributionsVisible && (
              <GithubContribution
                className="mt-2"
                githubKey={data.basic.githubKey}
                username={data.basic.githubUseName}
              />
            )}
          </>
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={data.globalSettings}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={data.globalSettings}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={data.globalSettings}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={data.globalSettings}
          />
        );
      default:
        if (sectionId in data.customData) {
          return (
            <CustomSection
              title={sectionTitle}
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={data.globalSettings}
            />
          );
        }
        return null;
    }
  };

  const basicSection = sortedSections.find((section) => section.id === "basic");
  const otherSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  return (
    <div
      className="flex flex-col w-full min-h-screen"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* 顶部整宽头部区域 */}
      <div
        className="w-full px-6 py-4 mb-4 flex items-center justify-between"
        style={{
          backgroundColor: data.globalSettings.themeColor,
          color: "#ffffff",
        }}
      >
        <div className="flex-1">
          {basicSection && (
            <BaseInfo
              basic={data.basic}
              globalSettings={data.globalSettings}
              template={template}
            />
          )}
        </div>
      </div>

      {/* 下方内容区域 */}
      <div className="px-6 pb-6">
        {otherSections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 last:border-none pb-4 mb-4">
            {renderSection(section.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassicVerticalTemplate;