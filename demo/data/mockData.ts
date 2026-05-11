import type { FormField, TemplateInfo, TemplateGroupSave } from '../../src';

export const campaignFieldData: FormField[] = [
  {
    name: 'template_name',
    label: 'Template Name',
    value_type: 'VARCHAR',
    is_required: true,
  },
  {
    name: 'campaign_status',
    label: 'Campaign Status',
    value_type: 'VARCHAR',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Pause', value: 'PAUSED' },
    ],
    is_required: true,
  },
  {
    name: 'campaign_bid_strategy',
    label: 'Bid Strategy',
    value_type: 'VARCHAR',
    options: [
      { label: 'Lowest Cost (Auto)', value: 'LOWEST_COST_WITHOUT_CAP' },
      { label: 'Lowest Cost (Bid Cap)', value: 'LOWEST_COST_WITH_BID_CAP' },
      { label: 'Cost Cap', value: 'COST_CAP' },
      { label: 'Min ROAS', value: 'LOWEST_COST_WITH_MIN_ROAS' },
    ],
    is_required: true,
  },
  {
    name: 'campaign_daily_budget',
    label: 'Daily Budget',
    value_type: 'INTEGER',
    is_required: false,
  },
  {
    name: 'campaign_objective',
    label: 'Campaign Objective',
    value_type: 'VARCHAR',
    options: [
      { label: 'Sales', value: 'OUTCOME_SALES' },
      { label: 'App Promotions', value: 'OUTCOME_APP_PROMOTION' },
    ],
    is_required: true,
  },
];

export const adsetFieldData: FormField[] = [
  {
    name: 'adset_bid_amount',
    label: 'Bid Amount',
    value_type: 'INTEGER',
    is_required: false,
  },
  {
    name: 'adset_destination_type',
    label: 'Destination Type',
    value_type: 'VARCHAR',
    options: [
      { label: 'Website', value: 'WEBSITE' },
      { label: 'App', value: 'APP' },
    ],
    is_required: true,
  },
  {
    name: 'adset_attribution_spec_click_days',
    label: 'Attribution Click Days',
    value_type: 'INTEGER',
    options: [
      { label: '7 days', value: 7 },
      { label: '1 day', value: 1 },
    ],
    is_required: false,
  },
  {
    name: 'adset_daily_budget',
    label: 'Daily Budget',
    value_type: 'INTEGER',
    is_required: false,
  },
  {
    name: 'adset_status',
    label: 'Ad Set Status',
    value_type: 'VARCHAR',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Paused', value: 'PAUSED' },
    ],
    is_required: true,
  },
  {
    name: 'adset_user_os',
    label: 'User OS',
    value_type: 'VARCHAR',
    options: [
      { label: 'iOS', value: 'iOS' },
      { label: 'Android', value: 'Android' },
      { label: 'Android 4.2 and above', value: 'Android_ver_4.2_and_above' },
      { label: 'iOS 15.0 and above', value: 'iOS_ver_15.0_and_above' },
      { label: 'iOS + Android', value: 'iOS,Android' },
    ],
    is_required: true,
  },
  {
    name: 'adset_device_platforms',
    label: 'Device Platforms',
    value_type: 'ARRAY',
    options: [
      { label: 'Mobile', value: 'mobile' },
      { label: 'Desktop', value: 'desktop' },
    ],
    is_required: false,
  },
  {
    name: 'adset_user_device',
    label: 'User Device',
    value_type: 'VARCHAR',
    is_required: false,
  },
  {
    name: 'adset_countries',
    label: 'Target Countries',
    value_type: 'ARRAY',
    options: [
      { label: 'GB', value: 'GB' },
      { label: 'NL', value: 'NL' },
      { label: 'AU', value: 'AU' },
      { label: 'CA', value: 'CA' },
      { label: 'FR', value: 'FR' },
      { label: 'AR', value: 'AR' },
      { label: 'CL', value: 'CL' },
    ],
    is_required: true,
  },
  {
    name: 'adset_locales',
    label: 'Locales',
    value_type: 'VARCHAR',
    is_required: false,
  },
  {
    name: 'adset_age_min',
    label: 'Minimum Age',
    value_type: 'INTEGER',
    is_required: true,
  },
  {
    name: 'adset_age_max',
    label: 'Maximum Age',
    value_type: 'INTEGER',
    is_required: true,
  },
  {
    name: 'adset_genders',
    label: 'Genders',
    value_type: 'VARCHAR',
    options: [
      { label: 'All', value: null },
      { label: 'Male', value: '[1]' },
      { label: 'Female', value: '[2]' },
    ],
    is_required: true,
  },
  {
    name: 'adset_benif_and_payor',
    label: 'Beneficiary & Payor',
    value_type: 'VARCHAR',
    is_required: false,
  },
  {
    name: 'adset_publisher_platforms',
    label: 'Publisher Platforms',
    value_type: 'ARRAY',
    options: [
      { label: 'Facebook', value: 'facebook' },
      { label: 'Instagram', value: 'instagram' },
      { label: 'Audience Network', value: 'audience_network' },
      { label: 'Messenger', value: 'messenger' },
      { label: 'Threads', value: 'threads' },
    ],
    is_required: false,
  },
  {
    name: 'adset_is_flexiable',
    label: 'Is Flexible Schedule',
    value_type: 'BOOLEAN',
    is_required: true,
  },
];

export const adFieldData: FormField[] = [
  {
    name: 'ad_status',
    label: 'Ad Status',
    value_type: 'VARCHAR',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Paused', value: 'PAUSED' },
    ],
    is_required: true,
  },
  {
    name: 'ad_button',
    label: 'Call To Action Button',
    value_type: 'VARCHAR',
    options: [
      { label: 'Play Game', value: 'PLAY_GAME' },
      { label: 'Learn More', value: 'LEARN_MORE' },
      { label: 'Sign Up', value: 'SIGN_UP' },
      { label: 'Install App', value: 'INSTALL_APP' },
      { label: 'Shop Now', value: 'SHOP_NOW' },
      { label: 'Get Offer', value: 'GET_OFFER' },
      { label: 'Contact Us', value: 'CONTACT_US' },
    ],
    is_required: true,
  },
];

export const campaignLaunchFields: FormField[] = [
  {
    name: 'soc_account',
    label: 'Soc Account',
    value_type: 'VARCHAR',
    options: [
      { label: 'SOC1', value: { id: 1 } },
      { label: 'SOC2', value: { id: 2 } },
    ],
    is_required: true,
  },
  {
    name: 'ad_account',
    label: 'Account Id',
    depend_on: 'soc_account',
    value_type: 'VARCHAR',
    options: [
      { label: 'SOC1 - AD_ACCOUNT_1', value: { id: 1, soc_account_id: 1 } },
      { label: 'SOC2 - AD_ACCOUNT_2', value: { id: 2, soc_account_id: 2 } },
    ],
    is_required: true,
  },
];

export const adsetLaunchFields: FormField[] = [
  {
    name: 'pixel',
    label: 'Pixel',
    depend_on: 'ad_account',
    value_type: 'VARCHAR',
    options: [
      { label: 'Pixel 1 - 21421124211', value: { id: 1, ad_account_ids: [1, 2, 3] } },
      { label: 'Pixel 2 - 4214433331111', value: { id: 2, ad_account_ids: [1, 2] } },
    ],
    is_required: true,
  },
  {
    name: 'launch_datetime',
    label: 'Launch Datetime (by Account Timezone)',
    value_type: 'DATETIME',
    is_required: true,
  },
];

export const adLaunchFields: FormField[] = [
  {
    name: 'fp',
    label: 'Fun Page',
    depend_on: 'soc_account',
    value_type: 'VARCHAR',
    options: [
      { label: 'FP1 - 321211321', value: { id: 1, soc_account_id: 1 } },
      { label: 'FP2 - 42142124', value: { id: 2, soc_account_id: 2 } },
    ],
    is_required: true,
  },
  {
    name: 'creative_url',
    label: 'Creative URL',
    value_type: 'VARCHAR',
    is_required: true,
  },
  {
    name: 'thumbnail_url',
    label: 'Thumbnail URL',
    value_type: 'VARCHAR',
    is_required: true,
  },
];

export const mockCampaignTemplates: TemplateInfo[] = [
  { id: 1, name: 'Campaign Alpha', description: 'Sales campaign with lowest cost' },
  { id: 2, name: 'Campaign Beta', description: 'App promo campaign with bid cap' },
];

export const mockAdsetTemplates: TemplateInfo[] = [
  { id: 1, name: 'Adset US Mobile', description: 'US targeting, mobile only' },
  { id: 2, name: 'Adset EU Desktop', description: 'EU targeting, desktop' },
  { id: 3, name: 'Adset Global', description: 'Global targeting, all devices' },
];

export const mockAdTemplates: TemplateInfo[] = [
  { id: 1, name: 'Ad Play Game', description: 'Play Game CTA, active' },
  { id: 2, name: 'Ad Learn More', description: 'Learn More CTA, active' },
  { id: 3, name: 'Ad Install App', description: 'Install App CTA, paused' },
];

export const mockTemplateGroups: TemplateGroupSave[] = [
  {
    templates_group_name: 'Group Alpha',
    campaign_template_id: 1,
    adset_templates: [
      {
        adset_template_id: 1,
        ad_templates: [{ ad_template_id: 1 }, { ad_template_id: 2 }],
      },
      {
        adset_template_id: 2,
        ad_templates: [{ ad_template_id: 1 }],
      },
    ],
  },
  {
    templates_group_name: 'Group Beta',
    campaign_template_id: 2,
    adset_templates: [
      {
        adset_template_id: 1,
        ad_templates: [{ ad_template_id: 1 }, { ad_template_id: 2 }],
      },
    ],
  },
];
