export interface FieldOptionType {
    label: string;
    value: string | number | Record<string, unknown> | null;
}
export type PostgresValueType = 'VARCHAR' | 'TEXT' | 'INTEGER' | 'BIGINT' | 'FLOAT' | 'DOUBLE PRECISION' | 'BOOLEAN' | 'DATETIME' | 'ARRAY';
export interface FormField {
    name: string;
    label: string;
    depend_on?: string;
    value_type: PostgresValueType;
    options?: FieldOptionType[] | null;
    is_required: boolean;
}
export interface FormValue {
    name: string;
    value: string | number | boolean | string[] | number[];
}
export interface TemplateSave {
    values: FormValue[];
}
export interface TemplateInfo {
    id: number;
    name: string;
    description: string;
}
export interface TemplateData {
    campaign_templates: TemplateInfo[];
    adset_templates: TemplateInfo[];
    ad_templates: TemplateInfo[];
}
export interface AdTemplateRef {
    ad_template_id: number;
}
export interface AdsetTemplateRef {
    adset_template_id: number;
    ad_templates: AdTemplateRef[];
}
export interface TemplateGroupSave {
    templates_group_name: string;
    campaign_template_id: number;
    adset_templates: AdsetTemplateRef[];
}
export interface AdLaunchData {
    ad_template_id: number;
    [key: string]: unknown;
}
export interface AdsetLaunchData {
    adset_template_id: number;
    ad_templates: AdLaunchData[];
    [key: string]: unknown;
}
export interface LaunchGroupSave {
    templates_group_name: string;
    campaign_template_id: number;
    adset_templates: AdsetLaunchData[];
    [key: string]: unknown;
}
export type NodePath = {
    groupIndex: number;
    adsetIndex?: number;
    adIndex?: number;
    level: 'campaign' | 'adset' | 'ad';
};
