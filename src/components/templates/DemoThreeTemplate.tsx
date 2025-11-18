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
  const secondaryColor = template.colorScheme.secondary;
  const pagePadding =
    data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const sectionSpacing =
    data.globalSettings?.sectionSpacing ?? template.spacing.sectionGap;
  const paragraphSpacing =
    data.globalSettings?.paragraphSpacing ?? template.spacing.itemGap;
  const headerFontSize = (data.globalSettings?.headerSize ?? 28) + 2;
  const subheaderFontSize = data.globalSettings?.subheaderSize ?? 18;

  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);
  const nonBasicSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  const mainSectionIds = ["experience", "projects", "education"];
  const primarySections: MenuSection[] = [];
  const secondarySections: MenuSection[] = [];

  nonBasicSections.forEach((section) => {
    if (mainSectionIds.includes(section.id)) {
      primarySections.push(section);
    } else {
      secondarySections.push(section);
    }
  });

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
        month: "short",
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const collectBasicFields = (basic: BasicInfo) => {
    const fallbackFields = [
      { key: "email", label: "Email", value: basic.email },
      { key: "phone", label: "Phone", value: basic.phone },
      { key: "location", label: "Location", value: basic.location },
    ];

    const orderedFields = basic.fieldOrder
      ? basic.fieldOrder
          .filter(
            (field) =>
              field.visible !== false &&
              field.key !== "name" &&
              field.key !== "title"
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

  const SectionBlock = ({ section }: { section: MenuSection }) => {
    const sectionTitle =
      data.menuSections.find((item) => item.id === section.id)?.title ||
      section.id;

    return (
      <div
        key={section.id}
        className="space-y-4 pb-6"
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          marginBottom: `${sectionSpacing}px`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <h3
            className="font-semibold tracking-wide"
            style={{
              fontSize: `${subheaderFontSize}px`,
              color: template.colorScheme.text,
            }}
          >
            {sectionTitle}
          </h3>
        </div>
        <div className="pl-4">{renderSectionContent(section.id)}</div>
      </div>
    );
  };

  const renderHeader = () => {
    const photoVisible = data.basic.photo && data.basic.photoConfig?.visible;

    return (
      <div className="relative">
        <div
          className="h-2 w-full"
          style={{
            backgroundColor: accentColor,
          }}
        />
        <div
          className="flex flex-col gap-6 px-10 py-8 text-white lg:flex-row lg:items-center"
          style={{
            background: `linear-gradient(120deg, ${accentColor}, ${secondaryColor})`,
          }}
        >
          <div className="flex-1 space-y-4">
            {data.basic.employementStatus && (
              <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                {data.basic.employementStatus}
              </span>
            )}
            <div className="space-y-1">
              <h1
                className="font-bold leading-tight"
                style={{
                  fontSize: `${headerFontSize}px`,
                }}
              >
                {data.basic.name || "您的姓名"}
              </h1>
              {data.basic.title && (
                <p
                  className="text-white/80 font-medium"
                  style={{
                    fontSize: `${subheaderFontSize}px`,
                  }}
                >
                  {data.basic.title}
                </p>
              )}
            </div>

            {contactFields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {contactFields.map((field) => (
                  <div key={field.key} className="text-sm leading-snug">
                    <span className="block text-white/60">{field.label}</span>
                    <span className="font-medium text-white">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {photoVisible && (
            <div className="shrink-0 self-start rounded-2xl border-4 border-white/40 bg-white/10 p-2">
              <div
                style={{
                  width: data.basic.photoConfig?.width || 100,
                  height: data.basic.photoConfig?.height || 120,
                  borderRadius: getBorderRadiusValue(data.basic.photoConfig),
                  overflow: "hidden",
                  boxShadow: "0 15px 45px rgba(0,0,0,0.25)",
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
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: template.colorScheme.background,
        color: template.colorScheme.text,
      }}
    >
      <div
        className="mx-auto max-w-full"
        style={{
          padding: `${pagePadding}px`,
        }}
      >
        <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-2xl">
          {renderHeader()}

          <div className="px-10 py-10">
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div>
                {primarySections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}
              </div>

              <div className="border-t border-gray-100 pt-8 lg:border-t-0 lg:border-l lg:pl-8">
                {secondarySections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}

                {data.basic.githubContributionsVisible && (
                  <div
                    className="space-y-4 pb-6"
                    style={{
                      marginTop: `${sectionSpacing}px`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-6 w-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <h3
                        className="font-semibold tracking-wide"
                        style={{
                          fontSize: `${subheaderFontSize}px`,
                        }}
                      >
                        GitHub
                      </h3>
                    </div>
                    <GithubContribution
                      githubKey={data.basic.githubKey}
                      username={data.basic.githubUseName}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoThreeTemplate;

