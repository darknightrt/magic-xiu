import React from "react";
import {
  BasicInfo,
  CustomFieldType,
  getBorderRadiusValue,
  GlobalSettings,
  MenuSection,
  ResumeData,
} from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import ExperienceSection from "@/components/preview/ExperienceSection";
import EducationSection from "@/components/preview/EducationSection";
import ProjectSection from "@/components/preview/ProjectSection";
import SkillSection from "@/components/preview/SkillPanel";
import CustomSection from "@/components/preview/CustomSection";
import GithubContribution from "@/components/shared/GithubContribution";

interface DemoThreeTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const DemoThreeTemplate: React.FC<DemoThreeTemplateProps> = ({
  data,
  template,
}) => {
  const accentColor =
    data.globalSettings?.themeColor || template.colorScheme.primary;
  const goldColor = "#d4af37"; // 金色装饰条
  const darkBlueColor = "#1e3a8a"; // 深蓝色标签
  const pagePadding =
    data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const sectionSpacing =
    data.globalSettings?.sectionSpacing ?? template.spacing.sectionGap;
  const paragraphSpacing =
    data.globalSettings?.paragraphSpacing ?? template.spacing.itemGap;
  const headerFontSize = data.globalSettings?.headerSize ?? 28;
  const subheaderFontSize = data.globalSettings?.subheaderSize ?? 16;

  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

  const sharedSectionSettings: GlobalSettings = {
    ...data.globalSettings,
    paragraphSpacing,
    sectionSpacing: 0,
  };

  const locale =
    typeof window !== "undefined" && window.navigator?.language
      ? window.navigator.language
      : "zh-CN";

  const formatDate = (value?: string) => {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const collectBasicFields = (basic: BasicInfo) => {
    const fallbackFields = [
      { key: "email", label: "邮箱", value: basic.email },
      { key: "phone", label: "电话", value: basic.phone },
      { key: "location", label: "所在地", value: basic.location },
    ];

    const orderedFields = basic.fieldOrder
      ? basic.fieldOrder
          .filter(
            (field) =>
              field.visible !== false &&
              field.key !== "name" &&
              field.key !== "title" &&
              field.key !== "employementStatus"
          )
          .map((field) => {
            const rawValue =
              field.key === "birthDate"
                ? formatDate(basic[field.key] as string)
                : ((basic as BasicInfo)[field.key] as string);

            return {
              key: field.key,
              label: field.label,
              value: rawValue,
            };
          })
          .filter((field) => field.value)
      : fallbackFields.filter((field) => field.value);

    const customFields: CustomFieldType[] =
      basic.customFields?.filter((field) => field.visible !== false) || [];

    return [
      ...orderedFields,
      ...customFields.map((field) => ({
        key: field.id,
        label: field.label,
        value: field.value,
      })),
    ].filter((field) => field.value);
  };

  const contactFields = collectBasicFields(data.basic);

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle =
            data.menuSections.find((section) => section.id === sectionId)
              ?.title || sectionId;
          return (
            <CustomSection
              sectionId={sectionId}
              title={sectionTitle}
              items={data.customData[sectionId]}
              globalSettings={sharedSectionSettings}
              showTitle={false}
            />
          );
        }
        return null;
    }
  };

  const renderBasicInfo = () => {
    const photoVisible = data.basic.photo && data.basic.photoConfig?.visible;

    return (
      <div className="space-y-3">
        {photoVisible && (
          <div className="flex justify-center mb-3">
            <div
              style={{
                width: data.basic.photoConfig?.width || 100,
                height: data.basic.photoConfig?.height || 120,
                borderRadius: getBorderRadiusValue(data.basic.photoConfig),
                overflow: "hidden",
                border: "2px solid #e5e7eb",
              }}
            >
              <img
                src={data.basic.photo}
                alt={`${data.basic.name || "avatar"} photo`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {data.basic.name && (
          <div className="text-center mb-3">
            <h2
              className="font-bold"
              style={{
                fontSize: `${headerFontSize - 4}px`,
                color: "#111827",
              }}
            >
              {data.basic.name}
            </h2>
          </div>
        )}

        {contactFields.length > 0 && (
          <div className="space-y-2.5">
            {contactFields.map((field) => (
              <div
                key={field.key}
                className="text-sm leading-relaxed"
                style={{ color: "#4b5563" }}
              >
                <span className="font-medium text-gray-700">{field.label}：</span>
                <span className="text-gray-600">{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getSectionTitle = (sectionId: string) => {
    const section = data.menuSections.find((s) => s.id === sectionId);
    return section?.title || sectionId;
  };

  const renderLeftNav = () => {
    const navSections = sortedSections.filter(
      (section) => section.id !== "basic"
    );

    return (
      <div className="space-y-2">
        {navSections.map((section) => {
          const sectionTitle = getSectionTitle(section.id);
          return (
            <div
              key={section.id}
              className="px-4 py-3 rounded"
              style={{
                backgroundColor: darkBlueColor,
                color: "#ffffff",
              }}
            >
              <div
                className="font-semibold text-center"
                style={{
                  fontSize: `${subheaderFontSize}px`,
                }}
              >
                {sectionTitle}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRightContent = () => {
    const contentSections = sortedSections.filter(
      (section) => section.id !== "basic"
    );

    return (
      <div className="space-y-8">
        {contentSections.map((section) => {
          const sectionTitle = getSectionTitle(section.id);
          return (
            <div key={section.id} className="space-y-4">
              <div
                className="flex items-center gap-2"
                style={{
                  borderBottom: `2px solid ${darkBlueColor}`,
                  paddingBottom: "8px",
                  marginBottom: "12px",
                }}
              >
                <h3
                  className="font-bold"
                  style={{
                    fontSize: `${subheaderFontSize + 2}px`,
                    color: darkBlueColor,
                  }}
                >
                  {sectionTitle}
                </h3>
              </div>
              <div className="pl-2" style={{ lineHeight: 1.8 }}>
                {renderSectionContent(section.id)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "#f5f6fb",
        color: "#111827",
      }}
    >
      <div
        className="mx-auto max-w-full"
        style={{
          padding: `${pagePadding}px`,
        }}
      >
        <div className="overflow-hidden bg-white shadow-lg">
          {/* 顶部金色装饰条 */}
          <div
            className="h-1 w-full"
            style={{
              backgroundColor: goldColor,
            }}
          />

          {/* 标题区域 */}
          <div className="py-8 text-center border-b border-gray-200">
            <h1
              className="font-bold"
              style={{
                fontSize: `${headerFontSize + 10}px`,
                color: "#111827",
                letterSpacing: "2px",
              }}
            >
              个人简历
            </h1>
          </div>

          {/* 主要内容区域 */}
          <div className="flex">
            {/* 左侧导航栏 */}
            <div
              className="w-52 shrink-0 p-6"
              style={{
                backgroundColor: "#f9fafb",
                borderRight: "1px solid #e5e7eb",
              }}
            >
              {/* 基本信息 */}
              <div className="mb-8">
                <div
                  className="px-4 py-3 mb-4 rounded"
                  style={{
                    backgroundColor: darkBlueColor,
                    color: "#ffffff",
                  }}
                >
                  <div
                    className="font-semibold text-center"
                    style={{
                      fontSize: `${subheaderFontSize}px`,
                    }}
                  >
                    基本信息
                  </div>
                </div>
                {renderBasicInfo()}
              </div>

              {/* 其他导航项 */}
              {renderLeftNav()}
            </div>

            {/* 右侧内容区 */}
            <div className="flex-1 p-8" style={{ backgroundColor: "#ffffff" }}>
              {renderRightContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoThreeTemplate;

