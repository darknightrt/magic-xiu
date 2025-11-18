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

interface GraySplitTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * 灰色左右分栏模板
 * 对应示例图 2.png：
 * - 左侧为深灰背景侧栏，显示个人信息
 * - 右侧为白色内容区，展示经历 / 教育 / 技能等
 */
const GraySplitTemplate: React.FC<GraySplitTemplateProps> = ({
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
      className="grid grid-cols-3 w-full min-h-screen"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* 左侧灰色侧栏 */}
      <div
        className="col-span-1 p-6 flex flex-col gap-4"
        style={{
          backgroundColor: "#f3f4f6",
          borderRight: "4px solid #e5e7eb",
        }}
      >
        {basicSection && renderSection(basicSection.id)}
      </div>

      {/* 右侧内容区 */}
      <div className="col-span-2 px-6 py-4">
        {otherSections.map((section, index) => (
          <div
            key={section.id}
            className={index !== otherSections.length - 1 ? "pb-4 mb-4 border-b border-gray-200" : ""}
          >
            {renderSection(section.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraySplitTemplate;
