import { useState } from 'react';
import { DynamicForm, TemplateGroup, LaunchGroup } from '../src';
import type { TemplateSave, TemplateGroupSave, LaunchGroupSave } from '../src';
import {
  campaignFieldData,
  adsetFieldData,
  adFieldData,
  mockCampaignTemplates,
  mockAdsetTemplates,
  mockAdTemplates,
  mockTemplateGroups,
  campaignLaunchFields,
  adsetLaunchFields,
  adLaunchFields,
} from './data/mockData';
import './App.css';

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

  const handleTemplateSave = async (data: TemplateSave) => {
    console.log('Template saved:', JSON.stringify(data, null, 2));
    alert('Template saved! Check console for data.');
  };

  const handleGroupSave = async (data: TemplateGroupSave) => {
    console.log('Template Group saved:', JSON.stringify(data, null, 2));
    alert('Template Group saved! Check console for data.');
  };

  const handleLaunchSave = async (data: LaunchGroupSave[]) => {
    console.log('Launch Groups saved:', JSON.stringify(data, null, 2));
    alert('Launch Groups saved! Check console for data.');
  };

  const fetchTemplates = async () => ({
    campaign_templates: mockCampaignTemplates,
    adset_templates: mockAdsetTemplates,
    ad_templates: mockAdTemplates,
  });

  const fetchTemplateGroups = async () => mockTemplateGroups;
  const fetchCampaignFields = async () => campaignLaunchFields;
  const fetchAdsetFields = async () => adsetLaunchFields;
  const fetchAdFields = async () => adLaunchFields;

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
        {activeTab === 'level1-campaign' && (
          <DynamicForm
            fields={campaignFieldData}
            onSave={handleTemplateSave}
            title="Campaign Template"
          />
        )}
        {activeTab === 'level1-adset' && (
          <DynamicForm
            fields={adsetFieldData}
            onSave={handleTemplateSave}
            title="Ad Set Template"
          />
        )}
        {activeTab === 'level1-ad' && (
          <DynamicForm
            fields={adFieldData}
            onSave={handleTemplateSave}
            title="Ad Template"
          />
        )}
        {activeTab === 'level2' && (
          <TemplateGroup fetchTemplates={fetchTemplates} onSave={handleGroupSave} />
        )}
        {activeTab === 'level3' && (
          <LaunchGroup
            fetchTemplateGroups={fetchTemplateGroups}
            fetchCampaignFields={fetchCampaignFields}
            fetchAdsetFields={fetchAdsetFields}
            fetchAdFields={fetchAdFields}
            onSave={handleLaunchSave}
          />
        )}
      </main>
    </div>
  );
}

export default App;
