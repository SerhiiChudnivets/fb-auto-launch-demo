import { useState, useCallback, useMemo } from 'react';
import type {
  FormField,
  TemplateGroupSave,
  LaunchGroupSave,
  NodePath,
  FieldOptionType,
} from '../../types';
import './LaunchGroup.css';

interface LaunchGroupProps {
  fetchTemplateGroups: () => Promise<TemplateGroupSave[]>;
  fetchCampaignFields: () => Promise<FormField[]>;
  fetchAdsetFields: () => Promise<FormField[]>;
  fetchAdFields: () => Promise<FormField[]>;
  onSave: (data: LaunchGroupSave[]) => Promise<void>;
}

type NodeValues = Record<string, unknown>;

interface LaunchState {
  groups: TemplateGroupSave[];
  campaignValues: NodeValues[];
  adsetValues: NodeValues[][];
  adValues: NodeValues[][][];
}

function resolveOptionId(val: FieldOptionType['value']): unknown {
  if (val && typeof val === 'object' && 'id' in val) return (val as Record<string, unknown>).id;
  return val;
}

function filterOptionsByDependency(
  field: FormField,
  allFields: FormField[],
  currentValues: NodeValues,
  inheritedValues: NodeValues,
): FieldOptionType[] {
  if (!field.options) return [];
  if (!field.depend_on) return field.options;

  const allValues = { ...inheritedValues, ...currentValues };
  const parentVal = allValues[field.depend_on];
  if (parentVal === undefined || parentVal === '' || parentVal === null) return [];

  const parentField = [...allFields].find((f) => f.name === field.depend_on);
  let parentId: unknown = parentVal;
  if (parentField?.options) {
    const parentOpt = parentField.options.find(
      (opt) => String(resolveOptionId(opt.value)) === String(parentVal),
    );
    if (parentOpt) parentId = resolveOptionId(parentOpt.value);
  }

  return field.options.filter((opt) => {
    if (!opt.value || typeof opt.value !== 'object') return true;
    const val = opt.value as Record<string, unknown>;
    for (const key of Object.keys(val)) {
      if (key === 'id') continue;
      if (key.endsWith('_ids') && Array.isArray(val[key])) {
        return (val[key] as unknown[]).map(String).includes(String(parentId));
      }
      if (key.endsWith('_id')) {
        return String(val[key]) === String(parentId);
      }
    }
    return true;
  });
}

function getInheritedValues(
  state: LaunchState,
  path: NodePath,
): NodeValues {
  const inherited: NodeValues = {};
  Object.assign(inherited, state.campaignValues[path.groupIndex] ?? {});
  if ((path.level === 'adset' || path.level === 'ad') && path.adsetIndex !== undefined) {
    Object.assign(inherited, state.adsetValues[path.groupIndex]?.[path.adsetIndex] ?? {});
  }
  return inherited;
}

function hasFilled(vals: NodeValues): boolean {
  return Object.values(vals).some((v) => v !== '' && v !== undefined && v !== null);
}

function getNodeY(index: number, total: number): number {
  if (total <= 1) return 50;
  const pad = 10;
  return pad + (index / (total - 1)) * (100 - 2 * pad);
}

export function LaunchGroup({
  fetchTemplateGroups,
  fetchCampaignFields,
  fetchAdsetFields,
  fetchAdFields,
  onSave,
}: LaunchGroupProps) {
  const [launchState, setLaunchState] = useState<LaunchState | null>(null);
  const [campaignFields, setCampaignFields] = useState<FormField[]>([]);
  const [adsetFields, setAdsetFields] = useState<FormField[]>([]);
  const [adFields, setAdFields] = useState<FormField[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<NodePath[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [groups, cFields, asFields, aFields] = await Promise.all([
        fetchTemplateGroups(),
        fetchCampaignFields(),
        fetchAdsetFields(),
        fetchAdFields(),
      ]);
      setCampaignFields(cFields);
      setAdsetFields(asFields);
      setAdFields(aFields);
      setLaunchState({
        groups,
        campaignValues: groups.map(() => ({})),
        adsetValues: groups.map((g) => g.adset_templates.map(() => ({}))),
        adValues: groups.map((g) =>
          g.adset_templates.map((as) => as.ad_templates.map(() => ({}))),
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [fetchTemplateGroups, fetchCampaignFields, fetchAdsetFields, fetchAdFields]);

  const isNodeSelected = useCallback(
    (path: NodePath) =>
      selectedNodes.some(
        (s) =>
          s.groupIndex === path.groupIndex &&
          s.adsetIndex === path.adsetIndex &&
          s.adIndex === path.adIndex &&
          s.level === path.level,
      ),
    [selectedNodes],
  );

  const toggleNodeSelection = useCallback((path: NodePath) => {
    setSelectedNodes((prev) => {
      const exists = prev.some(
        (s) =>
          s.groupIndex === path.groupIndex &&
          s.adsetIndex === path.adsetIndex &&
          s.adIndex === path.adIndex &&
          s.level === path.level,
      );
      if (exists) return prev.filter(
        (s) => !(s.groupIndex === path.groupIndex && s.adsetIndex === path.adsetIndex && s.adIndex === path.adIndex && s.level === path.level),
      );
      return [...prev, path];
    });
  }, []);

  const selectAllOfLevel = useCallback(
    (level: 'campaign' | 'adset' | 'ad') => {
      if (!launchState) return;
      const allPaths: NodePath[] = [];
      launchState.groups.forEach((group, gi) => {
        if (level === 'campaign') allPaths.push({ groupIndex: gi, level: 'campaign' });
        group.adset_templates.forEach((_, asi) => {
          if (level === 'adset') allPaths.push({ groupIndex: gi, adsetIndex: asi, level: 'adset' });
          if (level === 'ad') {
            group.adset_templates[asi].ad_templates.forEach((_, adi) => {
              allPaths.push({ groupIndex: gi, adsetIndex: asi, adIndex: adi, level: 'ad' });
            });
          }
        });
      });
      setSelectedNodes((prev) => {
        const allSelected = allPaths.every((p) =>
          prev.some((s) => s.groupIndex === p.groupIndex && s.adsetIndex === p.adsetIndex && s.adIndex === p.adIndex && s.level === p.level),
        );
        if (allSelected) return prev.filter((s) => s.level !== level);
        return [...prev.filter((s) => s.level !== level), ...allPaths];
      });
    },
    [launchState],
  );

  const updateValue = useCallback(
    (fieldName: string, value: unknown) => {
      if (!launchState) return;
      setLaunchState((prev) => {
        if (!prev) return prev;
        const newCV = prev.campaignValues.map((v) => ({ ...v }));
        const newAV = prev.adsetValues.map((g) => g.map((v) => ({ ...v })));
        const newAdV = prev.adValues.map((g) => g.map((as) => as.map((v) => ({ ...v }))));

        for (const node of selectedNodes) {
          if (node.level === 'campaign') {
            newCV[node.groupIndex][fieldName] = value;
            campaignFields.filter((f) => f.depend_on === fieldName).forEach((f) => { newCV[node.groupIndex][f.name] = ''; });
            adsetFields.filter((f) => f.depend_on === fieldName).forEach((f) => { newAV[node.groupIndex].forEach((v) => { v[f.name] = ''; }); });
            adFields.filter((f) => f.depend_on === fieldName).forEach((f) => { newAdV[node.groupIndex].forEach((as) => { as.forEach((v) => { v[f.name] = ''; }); }); });
          } else if (node.level === 'adset' && node.adsetIndex !== undefined) {
            newAV[node.groupIndex][node.adsetIndex][fieldName] = value;
            adsetFields.filter((f) => f.depend_on === fieldName).forEach((f) => { newAV[node.groupIndex][node.adsetIndex!][f.name] = ''; });
          } else if (node.level === 'ad' && node.adsetIndex !== undefined && node.adIndex !== undefined) {
            newAdV[node.groupIndex][node.adsetIndex][node.adIndex][fieldName] = value;
          }
        }
        return { ...prev, campaignValues: newCV, adsetValues: newAV, adValues: newAdV };
      });
    },
    [launchState, selectedNodes, campaignFields, adsetFields, adFields],
  );

  const activeLevel = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    const levels = new Set(selectedNodes.map((n) => n.level));
    return levels.size === 1 ? [...levels][0] : null;
  }, [selectedNodes]);

  const activeFields = useMemo(() => {
    if (activeLevel === 'campaign') return campaignFields;
    if (activeLevel === 'adset') return adsetFields;
    if (activeLevel === 'ad') return adFields;
    return [];
  }, [activeLevel, campaignFields, adsetFields, adFields]);

  const allFieldsForDep = useMemo(
    () => [...campaignFields, ...adsetFields, ...adFields],
    [campaignFields, adsetFields, adFields],
  );

  const firstSelectedValues = useMemo(() => {
    if (!launchState || selectedNodes.length === 0) return {};
    const f = selectedNodes[0];
    if (f.level === 'campaign') return launchState.campaignValues[f.groupIndex] ?? {};
    if (f.level === 'adset' && f.adsetIndex !== undefined) return launchState.adsetValues[f.groupIndex]?.[f.adsetIndex] ?? {};
    if (f.level === 'ad' && f.adsetIndex !== undefined && f.adIndex !== undefined) return launchState.adValues[f.groupIndex]?.[f.adsetIndex]?.[f.adIndex] ?? {};
    return {};
  }, [launchState, selectedNodes]);

  const firstSelectedInherited = useMemo(() => {
    if (!launchState || selectedNodes.length === 0) return {};
    return getInheritedValues(launchState, selectedNodes[0]);
  }, [launchState, selectedNodes]);

  const handleSave = async () => {
    if (!launchState) return;
    setSaving(true);
    try {
      const result: LaunchGroupSave[] = launchState.groups.map((group, gi) => ({
        templates_group_name: group.templates_group_name,
        campaign_template_id: group.campaign_template_id,
        ...launchState.campaignValues[gi],
        adset_templates: group.adset_templates.map((adset, asi) => ({
          adset_template_id: adset.adset_template_id,
          ...launchState.adsetValues[gi][asi],
          ad_templates: adset.ad_templates.map((ad, adi) => ({
            ad_template_id: ad.ad_template_id,
            ...launchState.adValues[gi][asi][adi],
          })),
        })),
      }));
      await onSave(result);
    } finally {
      setSaving(false);
    }
  };

  if (!launchState) {
    return (
      <div className="lg-container">
        <button className="lg-load-btn" onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Launch Data'}
        </button>
      </div>
    );
  }

  const renderForm = () => {
    if (selectedNodes.length === 0) return (
      <div className="lg-form-panel lg-form-panel--empty">
        <span className="lg-placeholder">Select one or more nodes to edit their parameters</span>
      </div>
    );
    if (!activeLevel) return (
      <div className="lg-form-panel lg-form-panel--empty">
        <span className="lg-placeholder">Select nodes of the same level to bulk edit</span>
      </div>
    );
    return (
      <div className="lg-form-panel">
        <div className="lg-form-header">
          Editing {selectedNodes.length} {activeLevel}(s)
        </div>
        <div className="lg-form-fields">
          {activeFields.map((field) => {
            const value = firstSelectedValues[field.name] ?? '';
            const filtered = filterOptionsByDependency(field, allFieldsForDep, firstSelectedValues, firstSelectedInherited);
            return (
              <div key={field.name} className="lg-field">
                <label className="lg-label">
                  {field.label}
                  {field.is_required && <span className="lg-required">*</span>}
                  {field.depend_on && <span className="lg-depend-tag">depends on: {field.depend_on}</span>}
                </label>
                {field.value_type === 'BOOLEAN' ? (
                  <label className="lg-checkbox-label">
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => updateValue(field.name, e.target.checked)} />
                    <span>{field.label}</span>
                  </label>
                ) : field.value_type === 'DATETIME' ? (
                  <input type="datetime-local" className="lg-input" value={String(value || '')} onChange={(e) => updateValue(field.name, e.target.value)} />
                ) : field.value_type === 'ARRAY' && filtered.length > 0 ? (
                  <div className="lg-chips">
                    {filtered.map((opt) => {
                      const ov = typeof opt.value === 'object' ? String(resolveOptionId(opt.value)) : String(opt.value);
                      const arr = Array.isArray(value) ? (value as (string | number)[]) : [];
                      const sel = arr.map(String).includes(ov);
                      return (
                        <button key={ov} type="button" className={`lg-chip ${sel ? 'lg-chip--selected' : ''}`}
                          onClick={() => updateValue(field.name, sel ? arr.filter((v) => String(v) !== ov) : [...arr, opt.value as string | number])}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                ) : filtered.length > 0 ? (
                  <select className="lg-select" value={String(value ?? '')} onChange={(e) => updateValue(field.name, e.target.value)}>
                    <option value="">— Select —</option>
                    {filtered.map((opt) => {
                      const ov = typeof opt.value === 'object' ? String(resolveOptionId(opt.value)) : String(opt.value ?? '');
                      return <option key={ov} value={ov}>{opt.label}</option>;
                    })}
                  </select>
                ) : field.options && field.depend_on ? (
                  <select className="lg-select" disabled><option>— Select parent first —</option></select>
                ) : (
                  <input
                    type={['INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE PRECISION'].includes(field.value_type) ? 'number' : 'text'}
                    className="lg-input" value={String(value ?? '')} onChange={(e) => updateValue(field.name, e.target.value)} placeholder={field.label}
                  />
                )}
              </div>
            );
          })}
        </div>
        <button className="lg-form-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    );
  };

  return (
    <div className="lg-container">
      <div className="lg-header">
        <h3 className="lg-title">Launch Groups</h3>
        <div className="lg-select-all-bar">
          <button className={`lg-select-all-btn ${activeLevel === 'campaign' ? 'lg-select-all-btn--active' : ''}`} onClick={() => selectAllOfLevel('campaign')}>
            Select All Campaigns
          </button>
          <button className={`lg-select-all-btn ${activeLevel === 'adset' ? 'lg-select-all-btn--active' : ''}`} onClick={() => selectAllOfLevel('adset')}>
            Select All Ad Sets
          </button>
          <button className={`lg-select-all-btn ${activeLevel === 'ad' ? 'lg-select-all-btn--active' : ''}`} onClick={() => selectAllOfLevel('ad')}>
            Select All Ads
          </button>
          {selectedNodes.length > 0 && (
            <button className="lg-clear-btn" onClick={() => setSelectedNodes([])}>Clear ({selectedNodes.length})</button>
          )}
        </div>
      </div>

      {renderForm()}

      <div className="lg-groups-list">
        {launchState.groups.map((group, gi) => {
          const adsetCount = group.adset_templates.length;
          const totalAds = group.adset_templates.reduce((sum, as) => sum + as.ad_templates.length, 0);
          const maxItems = Math.max(1, adsetCount, totalAds);
          const graphMinHeight = maxItems * 56;

          let adGlobalBlock = 0;
          let adGlobalLine = 0;

          return (
            <div key={gi} className="lg-group-block">
              <div className="lg-group-label">{group.templates_group_name}</div>
              <div className="lg-graph" style={{ minHeight: graphMinHeight }}>
                {/* Campaign */}
                <div className="lg-col-abs">
                  <div
                    className={`lg-block lg-block-campaign ${isNodeSelected({ groupIndex: gi, level: 'campaign' }) ? 'lg-block--selected' : ''}`}
                    style={{ top: '50%' }}
                    onClick={() => toggleNodeSelection({ groupIndex: gi, level: 'campaign' })}
                  >
                    <span className="lg-block-type">Campaign</span>
                    <span className="lg-block-id">#{group.campaign_template_id}</span>
                    {hasFilled(launchState.campaignValues[gi]) && <span className="lg-filled-dot" />}
                  </div>
                </div>

                {/* Connector C → AS */}
                <div className="lg-conn">
                  <svg className="lg-conn-svg" preserveAspectRatio="none">
                    {group.adset_templates.map((_, asi) => (
                      <line key={asi} className="lg-conn-line"
                        x1="0" y1="50%"
                        x2="100%" y2={`${getNodeY(asi, adsetCount)}%`}
                      />
                    ))}
                  </svg>
                </div>

                {/* Adsets */}
                <div className="lg-col-abs">
                  {group.adset_templates.map((adset, asi) => (
                    <div
                      key={asi}
                      className={`lg-block lg-block-adset ${isNodeSelected({ groupIndex: gi, adsetIndex: asi, level: 'adset' }) ? 'lg-block--selected' : ''}`}
                      style={{ top: `${getNodeY(asi, adsetCount)}%` }}
                      onClick={() => toggleNodeSelection({ groupIndex: gi, adsetIndex: asi, level: 'adset' })}
                    >
                      <span className="lg-block-type">Adset</span>
                      <span className="lg-block-id">#{adset.adset_template_id}</span>
                      {hasFilled(launchState.adsetValues[gi]?.[asi] ?? {}) && <span className="lg-filled-dot" />}
                    </div>
                  ))}
                </div>

                {/* Connector AS → AD */}
                <div className="lg-conn">
                  <svg className="lg-conn-svg" preserveAspectRatio="none">
                    {group.adset_templates.map((adset, asi) =>
                      adset.ad_templates.map((_, adi) => {
                        const asY = getNodeY(asi, adsetCount);
                        const adY = getNodeY(adGlobalLine, totalAds);
                        adGlobalLine++;
                        return <line key={`${asi}-${adi}`} className="lg-conn-line" x1="0" y1={`${asY}%`} x2="100%" y2={`${adY}%`} />;
                      })
                    )}
                  </svg>
                </div>

                {/* Ads */}
                <div className="lg-col-abs">
                  {group.adset_templates.map((adset, asi) =>
                    adset.ad_templates.map((ad, adi) => {
                      const y = getNodeY(adGlobalBlock, totalAds);
                      adGlobalBlock++;
                      return (
                        <div
                          key={`${asi}-${adi}`}
                          className={`lg-block lg-block-ad ${isNodeSelected({ groupIndex: gi, adsetIndex: asi, adIndex: adi, level: 'ad' }) ? 'lg-block--selected' : ''}`}
                          style={{ top: `${y}%` }}
                          onClick={() => toggleNodeSelection({ groupIndex: gi, adsetIndex: asi, adIndex: adi, level: 'ad' })}
                        >
                          <span className="lg-block-type">Ad</span>
                          <span className="lg-block-id">#{ad.ad_template_id}</span>
                          {hasFilled(launchState.adValues[gi]?.[asi]?.[adi] ?? {}) && <span className="lg-filled-dot" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
