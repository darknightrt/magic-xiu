import React from "react";
import {
  BasicInfo,
  CustomFieldType,
  getBorderRadiusValue,
  ResumeData,
} from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import ExperienceSection from "@/components/preview/ExperienceSection";
import EducationSection from "@/components/preview/EducationSection";
import ProjectSection from "@/components/preview/ProjectSection";
import SkillSection from "@/components/preview/SkillPanel";
import CustomSection from "@/components/preview/CustomSection";
import GithubContribution from "@/components/shared/GithubContribution";
import { Mail, Phone, Globe } from "lucide-react";

interface DemoThreeTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * DemoThree 模板 - 现代简约风格中文个人简历
 * 参考 demo3.png 设计
 * - 顶部蓝色/金色装饰条
 * - 左侧主内容区，右侧照片
 * - 深蓝色模块标签
 * - 紧凑有序的信息排版
 */
const DemoThreeTemplate: React.FC<DemoThreeTemplateProps> = ({
  data,
  template,
}) => {
  const accentColor =
    data.globalSettings?.themeColor || template.colorScheme.primary;
  const secondaryColor = template.colorScheme.secondary || "#d4af37";
  const pagePadding =
    data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const sectionSpacing =
    data.globalSettings?.sectionSpacing ?? template.spacing.sectionGap;
  const paragraphSpacing =
    data.globalSettings?.paragraphSpacing ?? template.spacing.itemGap;
  const baseTextColor = template.colorScheme.text || "#1f2937";
  const headerFontSize = data.globalSettings?.headerSize ?? 28;
  const subheaderFontSize = data.globalSettings?.subheaderSize ?? 16;

  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);
  const nonBasicSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  const photoVisible =
    data.basic.photo && data.basic.photoConfig?.visible !== false;

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

  // 收集基本信息字段
  const collectBasicFields = (basic: BasicInfo) => {
    const fallbackFields = [
      { key: "email", label: "邮箱", value: basic.email, icon: Mail },
      { key: "phone", label: "电话", value: basic.phone, icon: Phone },
      { key: "location", label: "居住地", value: basic.location, icon: Globe },
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

            let icon = Globe;
            if (field.key === "email") icon = Mail;
            if (field.key === "phone") icon = Phone;

            return {
              key: field.key,
              label: field.label,
              value: rawValue,
              icon,
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
        icon: Globe,
      })),
    ].filter((field) => field.value);
  };

  const contactFields = collectBasicFields(data.basic);

  // 渲染模块标题
  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="inline-block px-4 py-1.5 text-white text-sm font-medium"
        style={{
          backgroundColor: accentColor,
          clipPath: "polygon(0 0, 100% 0, 95% 100%, 0% 100%)",
        }}
      >
        {title}
      </div>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: "#d1d5db" }}
      />
    </div>
  );

  // 渲染各个模块内容
  const renderSectionContent = (sectionId: string) => {
    const sharedSettings = {
      ...data.globalSettings,
      paragraphSpacing,
      sectionSpacing: 0,
    };

    switch (sectionId) {
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={sharedSettings}
            showTitle={false}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={sharedSettings}
            showTitle={false}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={sharedSettings}
            showTitle={false}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={sharedSettings}
            showTitle={false}
          />
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle =
            data.menuSections.find((s) => s.id === sectionId)?.title ||
            sectionId;
          return (
            <CustomSection
              title=""
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={sharedSettings}
              showTitle={false}
            />
          );
        }
        return null;
    }
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "#f5f5f5",
        padding: `${pagePadding}px`,
      }}
    >
      <div
        className="max-w-[210mm] mx-auto bg-white"
        style={{
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* 顶部标题栏 */}
        <div className="relative">
          {/* 装饰图标 - 右上角 */}
          <div className="absolute top-4 right-6 flex gap-3 z-10">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <Globe className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* 个人简历标题 */}
          <div className="pt-6 pl-8">
            <h1
              className="text-4xl font-bold"
              style={{
                color: accentColor,
                fontSize: `${headerFontSize + 8}px`,
              }}
            >
              个人简历
            </h1>
          </div>

          {/* 顶部装饰条 */}
          <div className="mt-4 flex">
            <div
              className="h-2 flex-[2]"
              style={{ backgroundColor: accentColor }}
            />
            <div
              className="h-2 w-32"
              style={{ backgroundColor: secondaryColor }}
            />
            <div
              className="h-2 flex-1"
              style={{ backgroundColor: "#10b981" }}
            />
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex gap-6 p-8">
          {/* 左侧主要内容 */}
          <div className="flex-1">
            {/* 基本信息模块 */}
            <div style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionTitle title="基本信息" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex">
                  <span className="w-16 text-gray-600">姓名：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.name || "姓名"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">求职意向：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.title || "工作职位"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-600">年龄：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.employementStatus || "汉"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">出生年月：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.birthDate
                      ? formatDate(data.basic.birthDate)
                      : ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-600">居住地：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.location || "北京"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">毕业院校：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.education && data.education.length > 0
                      ? data.education[0].school
                      : "北京 XX 大学"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-600">电话：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.phone || ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">学历：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.education && data.education.length > 0
                      ? data.education[0].degree
                      : "本科"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-600">邮箱：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                    {data.basic.email || ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">政治面貌：</span>
                  <span
                    className="font-medium"
                    style={{ color: baseTextColor }}
                  >
                  </span>
                </div>
              </div>
            </div>

            {/* 其他模块 */}
            {nonBasicSections.map((section) => {
              if (section.id === "basic") return null;
              return (
                <div
                  key={section.id}
                  style={{ marginBottom: `${sectionSpacing}px` }}
                >
                  <SectionTitle title={section.title} />
                  <div className="text-sm">
                    {renderSectionContent(section.id)}
                  </div>
                </div>
              );
            })}

            {/* GitHub 贡献图 */}
            {data.basic.githubContributionsVisible && (
              <div style={{ marginBottom: `${sectionSpacing}px` }}>
                <SectionTitle title="GitHub" />
                <GithubContribution
                  githubKey={data.basic.githubKey}
                  username={data.basic.githubUseName}
                />
              </div>
            )}
          </div>

          {/* 右侧照片 */}
          {photoVisible && (
            <div className="shrink-0 mt-12">
              <div
                className="border-2 overflow-hidden"
                style={{
                  width: data.basic.photoConfig?.width || 120,
                  height: data.basic.photoConfig?.height || 160,
                  borderRadius: getBorderRadiusValue(data.basic.photoConfig),
                  borderColor: "#e5e7eb",
                }}
              >
                <img
                  src={data.basic.photo}
                  alt={`${data.basic.name || "avatar"} photo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoThreeTemplate;
