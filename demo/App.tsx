import { useState } from 'react';
import { DynamicForm, TemplateGroup, LaunchGroup } from '../src';
import type { TemplateSave, TemplateGroupSave, LaunchGroupSave, FormField, TemplateInfo } from '../src';
import './App.css';

const API = '/api';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

type TabKey = 'level1-campaign' | 'level1-adset' | 'level1-ad' | 'level2' | 'level3';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'level1-campaign', label: 'L1: Campaign' },
  { key: 'level1-adset', label: 'L1: Ad Set' },
  { key: 'level1-ad', label: 'L1: Ad' },
  { key: 'level2', label: 'L2: Template Group' },
  { key: 'level3', label: 'L3: Launch Group' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('level1-campaign');
  const [campaignFields, setCampaignFields] = useState<FormField[] | null>(null);
  const [adsetFields, setAdsetFields] = useState<FormField[] | null>(null);
  const [adFieldsState, setAdFields] = useState<FormField[] | null>(null);

  const loadFields = async (level: string): Promise<FormField[]> => {
    return api<FormField[]>(`/fields/${level}`);
  };

  const ensureCampaignFields = async () => {
    if (campaignFields) return campaignFields;
    const f = await loadFields('campaign');
    setCampaignFields(f);
    return f;
  };
  const ensureAdsetFields = async () => {
    if (adsetFields) return adsetFields;
    const f = await loadFields('adset');
    setAdsetFields(f);
    return f;
  };
  const ensureAdFields = async () => {
    if (adFieldsState) return adFieldsState;
    const f = await loadFields('ad');
    setAdFields(f);
    return f;
  };

  const handleTemplateSave = (level: string) => async (data: TemplateSave) => {
    await api(`/templates/${level}`, { method: 'POST', body: JSON.stringify(data) });
    alert('Template saved!');
  };

  const handleGroupSave = async (data: TemplateGroupSave) => {
    await api('/template-groups', { method: 'POST', body: JSON.stringify(data) });
    alert('Template Group saved!');
  };

  const handleLaunchSave = async (data: LaunchGroupSave[]) => {
    await api('/launch-groups', { method: 'POST', body: JSON.stringify(data) });
    alert('Launch Groups saved!');
  };

  const fetchTemplates = async () => {
    return api<{ campaign_templates: TemplateInfo[]; adset_templates: TemplateInfo[]; ad_templates: TemplateInfo[] }>('/templates');
  };

  const fetchTemplateGroups = async () => {
    return api<TemplateGroupSave[]>('/template-groups');
  };

  const fetchCampaignLaunchFields = () => api<FormField[]>('/launch-groups/fields/campaign');
  const fetchAdsetLaunchFields = () => api<FormField[]>('/launch-groups/fields/adset');
  const fetchAdLaunchFields = () => api<FormField[]>('/launch-groups/fields/ad');

  const renderLevel1 = (level: string, ensureFn: () => Promise<FormField[]>, fields: FormField[] | null, title: string) => {
    if (!fields) {
      ensureFn();
      return <div className="app-loading">Loading fields...</div>;
    }
    return (
      <DynamicForm
        fields={fields}
        onSave={handleTemplateSave(level)}
        title={title}
      />
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">FB Auto Launch</h1>
        <p className="app-subtitle">Campaign template builder</p>
      </header>

      <nav className="app-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`app-tab ${activeTab === tab.key ? 'app-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-content">
        {activeTab === 'level1-campaign' && renderLevel1('campaign', ensureCampaignFields, campaignFields, 'Campaign Template')}
        {activeTab === 'level1-adset' && renderLevel1('adset', ensureAdsetFields, adsetFields, 'Ad Set Template')}
        {activeTab === 'level1-ad' && renderLevel1('ad', ensureAdFields, adFieldsState, 'Ad Template')}
        {activeTab === 'level2' && (
          <TemplateGroup fetchTemplates={fetchTemplates} onSave={handleGroupSave} />
        )}
        {activeTab === 'level3' && (
          <LaunchGroup
            fetchTemplateGroups={fetchTemplateGroups}
            fetchCampaignFields={fetchCampaignLaunchFields}
            fetchAdsetFields={fetchAdsetLaunchFields}
            fetchAdFields={fetchAdLaunchFields}
            onSave={handleLaunchSave}
          />
        )}
      </main>
    </div>
  );
}

export default App;
