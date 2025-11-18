import React from "react";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import ProjectSection from "../preview/ProjectSection";
import CustomSection from "../preview/CustomSection";
import GithubContribution from "../shared/GithubContribution";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";

interface PopularColumnsTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * 热门经典分栏模板
 * 对应示例图 3.png：
 * - 顶部有颜色横条与标题区域
 * - 下方内容区域轻量分栏：左侧主要信息，右侧辅助模块
 */
const PopularColumnsTemplate: React.FC<PopularColumnsTemplateProps> = ({
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

  const leftColumnSections = otherSections.filter(
    (section) =>
      section.id === "experience" ||
      section.id === "projects" ||
      section.id === "education"
  );
  const rightColumnSections = otherSections.filter(
    (section) =>
      !leftColumnSections.find((s) => s.id === section.id)
  );

  return (
    <div
      className="flex flex-col w-full min-h-screen"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* 顶部横条与标题区域 */}
      <div className="w-full mb-4">
        <div
          className="h-3"
          style={{
            backgroundColor: data.globalSettings.themeColor,
          }}
        />
        <div className="flex items-center justify-between px-6 py-4">
          {basicSection && renderSection(basicSection.id)}
        </div>
      </div>

      {/* 下方分栏内容区域 */}
      <div className="flex flex-row gap-6 px-6 pb-6">
        <div className="flex-1 space-y-4">
          {leftColumnSections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-200 last:border-none pb-4"
            >
              {renderSection(section.id)}
            </div>
          ))}
        </div>

        <div className="w-1/3 space-y-4">
          {rightColumnSections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-200 last:border-none pb-4"
            >
              {renderSection(section.id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularColumnsTemplate;