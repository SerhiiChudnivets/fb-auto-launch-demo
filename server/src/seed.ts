import type Database from 'better-sqlite3';

export interface FieldOptionType {
  label: string;
  value: string | number | Record<string, unknown> | null;
}

export type PostgresValueType =
  | 'VARCHAR' | 'TEXT' | 'INTEGER' | 'BIGINT' | 'FLOAT'
  | 'DOUBLE PRECISION' | 'BOOLEAN' | 'DATETIME' | 'ARRAY';

export interface FormField {
  name: string;
  label: string;
  depend_on?: string;
  value_type: PostgresValueType;
  options?: FieldOptionType[] | null;
  is_required: boolean;
}

// ─── Level 1: Template field definitions ───

export const campaignFields: FormField[] = [
  { name: 'template_name', label: 'Template Name', value_type: 'VARCHAR', is_required: true },
  { name: 'campaign_status', label: 'Campaign Status', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Pause', value: 'PAUSED' }] },
  { name: 'campaign_bid_strategy', label: 'Bid Strategy', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'Lowest Cost (Auto)', value: 'LOWEST_COST_WITHOUT_CAP' },
      { label: 'Lowest Cost (Bid Cap)', value: 'LOWEST_COST_WITH_BID_CAP' },
      { label: 'Cost Cap', value: 'COST_CAP' },
      { label: 'Min ROAS', value: 'LOWEST_COST_WITH_MIN_ROAS' },
    ] },
  { name: 'campaign_daily_budget', label: 'Daily Budget', value_type: 'INTEGER', is_required: false },
  { name: 'campaign_objective', label: 'Campaign Objective', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'Sales', value: 'OUTCOME_SALES' }, { label: 'App Promotions', value: 'OUTCOME_APP_PROMOTION' }] },
];

export const adsetFields: FormField[] = [
  { name: 'adset_bid_amount', label: 'Bid Amount', value_type: 'INTEGER', is_required: false },
  { name: 'adset_destination_type', label: 'Destination Type', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'Website', value: 'WEBSITE' }, { label: 'App', value: 'APP' }] },
  { name: 'adset_attribution_spec_click_days', label: 'Attribution Click Days', value_type: 'INTEGER', is_required: false,
    options: [{ label: '7 days', value: 7 }, { label: '1 day', value: 1 }] },
  { name: 'adset_daily_budget', label: 'Daily Budget', value_type: 'INTEGER', is_required: false },
  { name: 'adset_status', label: 'Ad Set Status', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Paused', value: 'PAUSED' }] },
  { name: 'adset_user_os', label: 'User OS', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'iOS', value: 'iOS' }, { label: 'Android', value: 'Android' },
      { label: 'Android 4.2 and above', value: 'Android_ver_4.2_and_above' },
      { label: 'iOS 15.0 and above', value: 'iOS_ver_15.0_and_above' },
      { label: 'iOS + Android', value: 'iOS,Android' },
    ] },
  { name: 'adset_device_platforms', label: 'Device Platforms', value_type: 'ARRAY', is_required: false,
    options: [{ label: 'Mobile', value: 'mobile' }, { label: 'Desktop', value: 'desktop' }] },
  { name: 'adset_user_device', label: 'User Device', value_type: 'VARCHAR', is_required: false },
  { name: 'adset_countries', label: 'Target Countries', value_type: 'ARRAY', is_required: true,
    options: [
      { label: 'GB', value: 'GB' }, { label: 'NL', value: 'NL' }, { label: 'AU', value: 'AU' },
      { label: 'CA', value: 'CA' }, { label: 'FR', value: 'FR' }, { label: 'AR', value: 'AR' },
      { label: 'CL', value: 'CL' },
    ] },
  { name: 'adset_locales', label: 'Locales', value_type: 'VARCHAR', is_required: false },
  { name: 'adset_age_min', label: 'Minimum Age', value_type: 'INTEGER', is_required: true },
  { name: 'adset_age_max', label: 'Maximum Age', value_type: 'INTEGER', is_required: true },
  { name: 'adset_genders', label: 'Genders', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'All', value: null }, { label: 'Male', value: '[1]' }, { label: 'Female', value: '[2]' }] },
  { name: 'adset_benif_and_payor', label: 'Beneficiary & Payor', value_type: 'VARCHAR', is_required: false },
  { name: 'adset_publisher_platforms', label: 'Publisher Platforms', value_type: 'ARRAY', is_required: false,
    options: [
      { label: 'Facebook', value: 'facebook' }, { label: 'Instagram', value: 'instagram' },
      { label: 'Audience Network', value: 'audience_network' }, { label: 'Messenger', value: 'messenger' },
      { label: 'Threads', value: 'threads' },
    ] },
  { name: 'adset_is_flexiable', label: 'Is Flexible Schedule', value_type: 'BOOLEAN', is_required: true },
];

export const adFields: FormField[] = [
  { name: 'ad_status', label: 'Ad Status', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Paused', value: 'PAUSED' }] },
  { name: 'ad_button', label: 'Call To Action Button', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'Play Game', value: 'PLAY_GAME' }, { label: 'Learn More', value: 'LEARN_MORE' },
      { label: 'Sign Up', value: 'SIGN_UP' }, { label: 'Install App', value: 'INSTALL_APP' },
      { label: 'Shop Now', value: 'SHOP_NOW' }, { label: 'Get Offer', value: 'GET_OFFER' },
      { label: 'Contact Us', value: 'CONTACT_US' },
    ] },
];

// ─── Level 3: Launch field definitions ───

export const campaignLaunchFields: FormField[] = [
  { name: 'soc_account', label: 'Soc Account', value_type: 'VARCHAR', is_required: true,
    options: [{ label: 'SOC1', value: { id: 1 } }, { label: 'SOC2', value: { id: 2 } }] },
  { name: 'ad_account', label: 'Account Id', depend_on: 'soc_account', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'SOC1 - AD_ACCOUNT_1', value: { id: 1, soc_account_id: 1 } },
      { label: 'SOC2 - AD_ACCOUNT_2', value: { id: 2, soc_account_id: 2 } },
    ] },
];

export const adsetLaunchFields: FormField[] = [
  { name: 'pixel', label: 'Pixel', depend_on: 'ad_account', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'Pixel 1 - 21421124211', value: { id: 1, ad_account_ids: [1, 2, 3] } },
      { label: 'Pixel 2 - 4214433331111', value: { id: 2, ad_account_ids: [1, 2] } },
    ] },
  { name: 'launch_datetime', label: 'Launch Datetime (by Account Timezone)', value_type: 'DATETIME', is_required: true },
];

export const adLaunchFields: FormField[] = [
  { name: 'fp', label: 'Fun Page', depend_on: 'soc_account', value_type: 'VARCHAR', is_required: true,
    options: [
      { label: 'FP1 - 321211321', value: { id: 1, soc_account_id: 1 } },
      { label: 'FP2 - 42142124', value: { id: 2, soc_account_id: 2 } },
    ] },
  { name: 'creative_url', label: 'Creative URL', value_type: 'VARCHAR', is_required: true },
  { name: 'thumbnail_url', label: 'Thumbnail URL', value_type: 'VARCHAR', is_required: true },
];

// ─── Seed function ───

export function seedDatabase(db: Database.Database) {
  const insertTemplate = db.prepare(
    'INSERT INTO templates (level, name, description, values_json) VALUES (?, ?, ?, ?)',
  );

  const insertGroup = db.prepare(
    'INSERT INTO template_groups (name, data_json) VALUES (?, ?)',
  );

  const seedTx = db.transaction(() => {
    insertTemplate.run('campaign', 'Campaign Alpha', 'Sales campaign with lowest cost', JSON.stringify([
      { name: 'template_name', value: 'Campaign Alpha' },
      { name: 'campaign_status', value: 'ACTIVE' },
      { name: 'campaign_bid_strategy', value: 'LOWEST_COST_WITHOUT_CAP' },
      { name: 'campaign_objective', value: 'OUTCOME_SALES' },
    ]));
    insertTemplate.run('campaign', 'Campaign Beta', 'App promo campaign with bid cap', JSON.stringify([
      { name: 'template_name', value: 'Campaign Beta' },
      { name: 'campaign_status', value: 'ACTIVE' },
      { name: 'campaign_bid_strategy', value: 'LOWEST_COST_WITH_BID_CAP' },
      { name: 'campaign_objective', value: 'OUTCOME_APP_PROMOTION' },
    ]));

    insertTemplate.run('adset', 'Adset US Mobile', 'US targeting, mobile only', JSON.stringify([
      { name: 'adset_destination_type', value: 'APP' },
      { name: 'adset_status', value: 'ACTIVE' },
      { name: 'adset_user_os', value: 'iOS' },
      { name: 'adset_countries', value: ['US'] },
    ]));
    insertTemplate.run('adset', 'Adset EU Desktop', 'EU targeting, desktop', JSON.stringify([
      { name: 'adset_destination_type', value: 'WEBSITE' },
      { name: 'adset_status', value: 'ACTIVE' },
      { name: 'adset_user_os', value: 'Android' },
      { name: 'adset_countries', value: ['GB', 'FR', 'NL'] },
    ]));
    insertTemplate.run('adset', 'Adset Global', 'Global targeting, all devices', JSON.stringify([
      { name: 'adset_destination_type', value: 'WEBSITE' },
      { name: 'adset_status', value: 'ACTIVE' },
      { name: 'adset_user_os', value: 'iOS,Android' },
    ]));

    insertTemplate.run('ad', 'Ad Play Game', 'Play Game CTA, active', JSON.stringify([
      { name: 'ad_status', value: 'ACTIVE' },
      { name: 'ad_button', value: 'PLAY_GAME' },
    ]));
    insertTemplate.run('ad', 'Ad Learn More', 'Learn More CTA, active', JSON.stringify([
      { name: 'ad_status', value: 'ACTIVE' },
      { name: 'ad_button', value: 'LEARN_MORE' },
    ]));
    insertTemplate.run('ad', 'Ad Install App', 'Install App CTA, paused', JSON.stringify([
      { name: 'ad_status', value: 'PAUSED' },
      { name: 'ad_button', value: 'INSTALL_APP' },
    ]));

    insertGroup.run('Group Alpha', JSON.stringify({
      templates_group_name: 'Group Alpha',
      campaign_template_id: 1,
      adset_templates: [
        { adset_template_id: 1, ad_templates: [{ ad_template_id: 1 }, { ad_template_id: 2 }] },
        { adset_template_id: 2, ad_templates: [{ ad_template_id: 1 }] },
      ],
    }));
    insertGroup.run('Group Beta', JSON.stringify({
      templates_group_name: 'Group Beta',
      campaign_template_id: 2,
      adset_templates: [
        { adset_template_id: 1, ad_templates: [{ ad_template_id: 1 }, { ad_template_id: 2 }] },
      ],
    }));
  });

  seedTx();
}
