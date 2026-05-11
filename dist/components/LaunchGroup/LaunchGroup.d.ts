import { FormField, TemplateGroupSave, LaunchGroupSave } from '../../types';
interface LaunchGroupProps {
    fetchTemplateGroups: () => Promise<TemplateGroupSave[]>;
    fetchCampaignFields: () => Promise<FormField[]>;
    fetchAdsetFields: () => Promise<FormField[]>;
    fetchAdFields: () => Promise<FormField[]>;
    onSave: (data: LaunchGroupSave[]) => Promise<void>;
}
export declare function LaunchGroup({ fetchTemplateGroups, fetchCampaignFields, fetchAdsetFields, fetchAdFields, onSave, }: LaunchGroupProps): import("react/jsx-runtime").JSX.Element;
export {};
