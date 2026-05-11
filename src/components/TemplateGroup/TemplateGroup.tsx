import { useState, useCallback } from 'react';
import type { TemplateInfo, TemplateGroupSave, AdsetTemplateRef } from '../../types';
import './TemplateGroup.css';

interface TemplateGroupProps {
  fetchTemplates: () => Promise<{
    campaign_templates: TemplateInfo[];
    adset_templates: TemplateInfo[];
    ad_templates: TemplateInfo[];
  }>;
  onSave: (data: TemplateGroupSave) => Promise<void>;
}

interface AdsetNode {
  templateId: number | null;
  adTemplateIds: (number | null)[];
}

export function TemplateGroup({ fetchTemplates, onSave }: TemplateGroupProps) {
  const [templates, setTemplates] = useState<{
    campaign_templates: TemplateInfo[];
    adset_templates: TemplateInfo[];
    ad_templates: TemplateInfo[];
  } | null>(null);

  const [groupName, setGroupName] = useState('');
  const [campaignTemplateId, setCampaignTemplateId] = useState<number | null>(null);
  const [adsetNodes, setAdsetNodes] = useState<AdsetNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const handleInit = () => {
    if (!templates) loadTemplates();
  };

  const addAdset = () => {
    setAdsetNodes((prev) => [...prev, { templateId: null, adTemplateIds: [] }]);
  };

  const removeAdset = (index: number) => {
    setAdsetNodes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAdsetTemplate = (index: number, templateId: number) => {
    setAdsetNodes((prev) => prev.map((n, i) => (i === index ? { ...n, templateId } : n)));
  };

  const addAdToAdset = (adsetIndex: number) => {
    setAdsetNodes((prev) =>
      prev.map((n, i) =>
        i === adsetIndex ? { ...n, adTemplateIds: [...n.adTemplateIds, null] } : n,
      ),
    );
  };

  const removeAdFromAdset = (adsetIndex: number, adIndex: number) => {
    setAdsetNodes((prev) =>
      prev.map((n, i) =>
        i === adsetIndex
          ? { ...n, adTemplateIds: n.adTemplateIds.filter((_, j) => j !== adIndex) }
          : n,
      ),
    );
  };

  const updateAdTemplate = (adsetIndex: number, adIndex: number, templateId: number) => {
    setAdsetNodes((prev) =>
      prev.map((n, i) =>
        i === adsetIndex
          ? { ...n, adTemplateIds: n.adTemplateIds.map((id, j) => (j === adIndex ? templateId : id)) }
          : n,
      ),
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!groupName.trim()) newErrors.groupName = 'Group name is required';
    if (!campaignTemplateId) newErrors.campaign = 'Select a campaign template';
    if (adsetNodes.length === 0) newErrors.adsets = 'Add at least one Ad Set';
    adsetNodes.forEach((node, i) => {
      if (!node.templateId) newErrors[`adset_${i}`] = 'Select an adset template';
      if (node.adTemplateIds.length === 0) newErrors[`adset_${i}_ads`] = 'Add at least one ad';
      node.adTemplateIds.forEach((adId, j) => {
        if (!adId) newErrors[`adset_${i}_ad_${j}`] = 'Select an ad template';
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data: TemplateGroupSave = {
        templates_group_name: groupName,
        campaign_template_id: campaignTemplateId!,
        adset_templates: adsetNodes.map((node) => ({
          adset_template_id: node.templateId!,
          ad_templates: node.adTemplateIds.map((id) => ({ ad_template_id: id! })),
        })) as AdsetTemplateRef[],
      };
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const getTemplateName = (list: TemplateInfo[] | undefined, id: number | null) =>
    list?.find((t) => t.id === id)?.name ?? '—';

  if (!templates) {
    return (
      <div className="tg-container">
        <button className="tg-load-btn" onClick={handleInit} disabled={loading}>
          {loading ? 'Loading...' : 'Load Templates'}
        </button>
      </div>
    );
  }

  return (
    <div className="tg-container">
      <h3 className="tg-title">Template Group</h3>

      <div className="tg-controls">
        <div className="tg-field">
          <label className="tg-label">
            Group Name <span className="tg-required">*</span>
          </label>
          <input
            className="tg-input"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
          {errors.groupName && <span className="tg-error">{errors.groupName}</span>}
        </div>

        <div className="tg-field">
          <label className="tg-label">
            Campaign Template <span className="tg-required">*</span>
          </label>
          <select
            className="tg-select"
            value={campaignTemplateId ?? ''}
            onChange={(e) => setCampaignTemplateId(Number(e.target.value))}
          >
            <option value="">— Select Campaign —</option>
            {templates.campaign_templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.campaign && <span className="tg-error">{errors.campaign}</span>}
        </div>
      </div>

      {campaignTemplateId && (
        <div className="tg-graph-area">
          <div className="tg-graph">
            {/* Campaign column */}
            <div className="tg-column tg-col-campaign">
              <div className="tg-block tg-block-campaign">
                <div className="tg-block-label">Campaign</div>
                <div className="tg-block-name">{getTemplateName(templates.campaign_templates, campaignTemplateId)}</div>
              </div>
            </div>

            {/* Connector campaign → adsets */}
            <div className="tg-connectors">
              <svg className="tg-svg" preserveAspectRatio="none">
                {adsetNodes.map((_, adsetIdx) => (
                  <line
                    key={`c-as-${adsetIdx}`}
                    className="tg-connector-line"
                    x1="0" y1="50%"
                    x2="100%" y2={`${adsetNodes.length === 1 ? 50 : (adsetIdx / (adsetNodes.length - 1)) * 100}%`}
                  />
                ))}
              </svg>
            </div>

            {/* Adset column */}
            <div className="tg-column tg-col-adsets">
              {adsetNodes.map((adsetNode, adsetIdx) => (
                <div key={adsetIdx} className="tg-adset-row">
                  <div className="tg-block tg-block-adset">
                    <div className="tg-block-header">
                      <div className="tg-block-label">Adset</div>
                      <button className="tg-block-remove" onClick={() => removeAdset(adsetIdx)}>✕</button>
                    </div>
                    <select
                      className="tg-block-select"
                      value={adsetNode.templateId ?? ''}
                      onChange={(e) => updateAdsetTemplate(adsetIdx, Number(e.target.value))}
                    >
                      <option value="">— Select —</option>
                      {templates.adset_templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {errors[`adset_${adsetIdx}`] && <span className="tg-error">{errors[`adset_${adsetIdx}`]}</span>}
                  </div>
                </div>
              ))}
              <button className="tg-add-node-btn" onClick={addAdset}>+ Ad Set</button>
              {errors.adsets && <span className="tg-error">{errors.adsets}</span>}
            </div>

            {/* Connector adsets → ads */}
            <div className="tg-connectors tg-connectors-mid">
              <svg className="tg-svg" preserveAspectRatio="none">
                {(() => {
                  const lines: { adsetIdx: number; adIdx: number }[] = [];
                  adsetNodes.forEach((n, ai) => n.adTemplateIds.forEach((_, adi) => lines.push({ adsetIdx: ai, adIdx: adi })));
                  if (lines.length === 0) return null;

                  const totalAdsets = adsetNodes.length || 1;
                  let adGlobalIdx = 0;
                  const totalAds = lines.length;

                  return adsetNodes.map((adsetNode, adsetIdx) =>
                    adsetNode.adTemplateIds.map((_, adIdx) => {
                      const y1Pct = totalAdsets === 1 ? 50 : (adsetIdx / (totalAdsets - 1)) * 100;
                      const y2Pct = totalAds === 1 ? 50 : (adGlobalIdx++ / (totalAds - 1)) * 100;
                      return (
                        <line
                          key={`as-ad-${adsetIdx}-${adIdx}`}
                          className="tg-connector-line"
                          x1="0" y1={`${y1Pct}%`}
                          x2="100%" y2={`${y2Pct}%`}
                        />
                      );
                    })
                  );
                })()}
              </svg>
            </div>

            {/* Ad column */}
            <div className="tg-column tg-col-ads">
              {adsetNodes.map((adsetNode, adsetIdx) =>
                adsetNode.adTemplateIds.map((adId, adIdx) => (
                  <div key={`${adsetIdx}-${adIdx}`} className="tg-block tg-block-ad">
                    <div className="tg-block-header">
                      <div className="tg-block-label">Ad</div>
                      <button className="tg-block-remove" onClick={() => removeAdFromAdset(adsetIdx, adIdx)}>✕</button>
                    </div>
                    <select
                      className="tg-block-select"
                      value={adId ?? ''}
                      onChange={(e) => updateAdTemplate(adsetIdx, adIdx, Number(e.target.value))}
                    >
                      <option value="">— Select —</option>
                      {templates.ad_templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {errors[`adset_${adsetIdx}_ad_${adIdx}`] && (
                      <span className="tg-error">{errors[`adset_${adsetIdx}_ad_${adIdx}`]}</span>
                    )}
                  </div>
                ))
              )}
              {adsetNodes.length > 0 && (
                <div className="tg-add-ad-buttons">
                  {adsetNodes.map((_, adsetIdx) => (
                    <button
                      key={adsetIdx}
                      className="tg-add-node-btn tg-add-node-btn--small"
                      onClick={() => addAdToAdset(adsetIdx)}
                    >
                      + Ad (Set #{adsetIdx + 1})
                    </button>
                  ))}
                </div>
              )}
              {adsetNodes.some((_, i) => errors[`adset_${i}_ads`]) && (
                <span className="tg-error">Each Ad Set needs at least one Ad</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="tg-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Template Group'}
      </button>
    </div>
  );
}
