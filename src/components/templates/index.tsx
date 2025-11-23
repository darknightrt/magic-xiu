import React from "react";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import LeftRightTemplate from "./LeftRightTemplate";
import TimelineTemplate from "./TimelineTemplate";
import ClassicVerticalTemplate from "./ClassicVerticalTemplate";
import PopularColumnsTemplate from "./PopularColumnsTemplate";
import DemoThreeTemplate from "./DemoThreeTemplate";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";

interface TemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const ResumeTemplateComponent: React.FC<TemplateProps> = ({
 data,
 template
 }) => {
  const renderTemplate = () => {
    switch (template.layout) {
      case "modern":
        return <ModernTemplate data={data} template={template} />;
      case "left-right":
        return <LeftRightTemplate data={data} template={template} />;
      case "timeline":
        return <TimelineTemplate data={data} template={template} />;
      case "classic-vertical":
        return <ClassicVerticalTemplate data={data} template={template} />;
      case "popular-columns":
        return <PopularColumnsTemplate data={data} template={template} />;
      case "demo-three":
        return <DemoThreeTemplate data={data} template={template} />;
      default:
        return <ClassicTemplate data={data} template={template} />;
    }
  };

  return renderTemplate();
};

export default ResumeTemplateComponent;

