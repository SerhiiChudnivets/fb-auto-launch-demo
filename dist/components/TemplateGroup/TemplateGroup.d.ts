import { TemplateInfo, TemplateGroupSave } from '../../types';
interface TemplateGroupProps {
    fetchTemplates: () => Promise<{
        campaign_templates: TemplateInfo[];
        adset_templates: TemplateInfo[];
        ad_templates: TemplateInfo[];
    }>;
    onSave: (data: TemplateGroupSave) => Promise<void>;
}
export declare function TemplateGroup({ fetchTemplates, onSave }: TemplateGroupProps): import("react/jsx-runtime").JSX.Element;
export {};
