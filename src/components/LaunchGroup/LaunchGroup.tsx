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
  campaignFields: FormField[],
  adsetFields: FormField[],
): NodeValues {
  const inherited: NodeValues = {};
  const campVals = state.campaignValues[path.groupIndex] ?? {};
  Object.assign(inherited, campVals);

  if ((path.level === 'adset' || path.level === 'ad') && path.adsetIndex !== undefined) {
    const adsetVals = state.adsetValues[path.groupIndex]?.[path.adsetIndex] ?? {};
    Object.assign(inherited, adsetVals);
  }

  void campaignFields;
  void adsetFields;

  return inherited;
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

      const campaignValues = groups.map(() => ({} as NodeValues));
      const adsetValues = groups.map((g) => g.adset_templates.map(() => ({} as NodeValues)));
      const adValues = groups.map((g) =>
        g.adset_templates.map((as) => as.ad_templates.map(() => ({} as NodeValues))),
      );
      setLaunchState({ groups, campaignValues, adsetValues, adValues });
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
      if (exists) {
        return prev.filter(
          (s) =>
            !(
              s.groupIndex === path.groupIndex &&
              s.adsetIndex === path.adsetIndex &&
              s.adIndex === path.adIndex &&
              s.level === path.level
            ),
        );
      }
      return [...prev, path];
    });
  }, []);

  const selectAllOfLevel = useCallback(
    (level: 'campaign' | 'adset' | 'ad') => {
      if (!launchState) return;
      const allPaths: NodePath[] = [];
      launchState.groups.forEach((group, gi) => {
        if (level === 'campaign') {
          allPaths.push({ groupIndex: gi, level: 'campaign' });
        }
        group.adset_templates.forEach((_, asi) => {
          if (level === 'adset') {
            allPaths.push({ groupIndex: gi, adsetIndex: asi, level: 'adset' });
          }
          if (level === 'ad') {
            group.adset_templates[asi].ad_templates.forEach((_, adi) => {
              allPaths.push({ groupIndex: gi, adsetIndex: asi, adIndex: adi, level: 'ad' });
            });
          }
        });
      });

      setSelectedNodes((prev) => {
        const allSelected = allPaths.every((p) =>
          prev.some(
            (s) =>
              s.groupIndex === p.groupIndex &&
              s.adsetIndex === p.adsetIndex &&
              s.adIndex === p.adIndex &&
              s.level === p.level,
          ),
        );
        if (allSelected) {
          return prev.filter((s) => s.level !== level);
        }
        const otherLevel = prev.filter((s) => s.level !== level);
        return [...otherLevel, ...allPaths];
      });
    },
    [launchState],
  );

  const updateValue = useCallback(
    (fieldName: string, value: unknown) => {
      if (!launchState) return;
      setLaunchState((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        const newCampaignValues = next.campaignValues.map((v) => ({ ...v }));
        const newAdsetValues = next.adsetValues.map((g) => g.map((v) => ({ ...v })));
        const newAdValues = next.adValues.map((g) => g.map((as) => as.map((v) => ({ ...v }))));

        for (const node of selectedNodes) {
          if (node.level === 'campaign') {
            newCampaignValues[node.groupIndex][fieldName] = value;
            const dependentCampaignFields = campaignFields.filter((f) => f.depend_on === fieldName);
            dependentCampaignFields.forEach((f) => {
              newCampaignValues[node.groupIndex][f.name] = '';
            });
            const dependentAdsetFields = adsetFields.filter((f) => f.depend_on === fieldName);
            dependentAdsetFields.forEach((f) => {
              newAdsetValues[node.groupIndex].forEach((v) => {
                v[f.name] = '';
              });
            });
            const dependentAdFields = adFields.filter((f) => f.depend_on === fieldName);
            dependentAdFields.forEach((f) => {
              newAdValues[node.groupIndex].forEach((as) => {
                as.forEach((v) => {
                  v[f.name] = '';
                });
              });
            });
          } else if (node.level === 'adset' && node.adsetIndex !== undefined) {
            newAdsetValues[node.groupIndex][node.adsetIndex][fieldName] = value;
            const dependentFields = [...adsetFields, ...adFields].filter((f) => f.depend_on === fieldName);
            dependentFields.forEach((f) => {
              if (adsetFields.includes(f)) {
                newAdsetValues[node.groupIndex][node.adsetIndex!][f.name] = '';
              }
            });
          } else if (node.level === 'ad' && node.adsetIndex !== undefined && node.adIndex !== undefined) {
            newAdValues[node.groupIndex][node.adsetIndex][node.adIndex][fieldName] = value;
          }
        }

        return {
          ...next,
          campaignValues: newCampaignValues,
          adsetValues: newAdsetValues,
          adValues: newAdValues,
        };
      });
    },
    [launchState, selectedNodes, campaignFields, adsetFields, adFields],
  );

  const activeLevel = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    const levels = new Set(selectedNodes.map((n) => n.level));
    if (levels.size === 1) return [...levels][0];
    return null;
  }, [selectedNodes]);

  const activeFields = useMemo(() => {
    if (activeLevel === 'campaign') return campaignFields;
    if (activeLevel === 'adset') return adsetFields;
    if (activeLevel === 'ad') return adFields;
    return [];
  }, [activeLevel, campaignFields, adsetFields, adFields]);

  const allFieldsForDependency = useMemo(
    () => [...campaignFields, ...adsetFields, ...adFields],
    [campaignFields, adsetFields, adFields],
  );

  const firstSelectedValues = useMemo(() => {
    if (!launchState || selectedNodes.length === 0) return {};
    const first = selectedNodes[0];
    if (first.level === 'campaign') return launchState.campaignValues[first.groupIndex] ?? {};
    if (first.level === 'adset' && first.adsetIndex !== undefined)
      return launchState.adsetValues[first.groupIndex]?.[first.adsetIndex] ?? {};
    if (first.level === 'ad' && first.adsetIndex !== undefined && first.adIndex !== undefined)
      return launchState.adValues[first.groupIndex]?.[first.adsetIndex]?.[first.adIndex] ?? {};
    return {};
  }, [launchState, selectedNodes]);

  const firstSelectedInherited = useMemo(() => {
    if (!launchState || selectedNodes.length === 0) return {};
    return getInheritedValues(launchState, selectedNodes[0], campaignFields, adsetFields);
  }, [launchState, selectedNodes, campaignFields, adsetFields]);

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

  return (
    <div className="lg-container">
      <div className="lg-header">
        <h3 className="lg-title">Launch Groups</h3>
        <div className="lg-select-all-bar">
          <button
            className={`lg-select-all-btn ${activeLevel === 'campaign' ? 'lg-select-all-btn--active' : ''}`}
            onClick={() => selectAllOfLevel('campaign')}
          >
            Select All Campaigns
          </button>
          <button
            className={`lg-select-all-btn ${activeLevel === 'adset' ? 'lg-select-all-btn--active' : ''}`}
            onClick={() => selectAllOfLevel('adset')}
          >
            Select All Ad Sets
          </button>
          <button
            className={`lg-select-all-btn ${activeLevel === 'ad' ? 'lg-select-all-btn--active' : ''}`}
            onClick={() => selectAllOfLevel('ad')}
          >
            Select All Ads
          </button>
          {selectedNodes.length > 0 && (
            <button className="lg-clear-btn" onClick={() => setSelectedNodes([])}>
              Clear ({selectedNodes.length})
            </button>
          )}
        </div>
      </div>

      <div className="lg-layout">
        <div className="lg-tree-panel">
          {launchState.groups.map((group, gi) => (
            <div key={gi} className="lg-group-block">
              <div className="lg-group-name">{group.templates_group_name}</div>

              <div
                className={`lg-node lg-node-campaign ${isNodeSelected({ groupIndex: gi, level: 'campaign' }) ? 'lg-node--selected' : ''}`}
                onClick={() => toggleNodeSelection({ groupIndex: gi, level: 'campaign' })}
              >
                <span className="lg-badge lg-badge-campaign">Campaign</span>
                <span className="lg-node-id">Template #{group.campaign_template_id}</span>
                {Object.keys(launchState.campaignValues[gi] || {}).filter(
                  (k) => launchState.campaignValues[gi][k] !== '' && launchState.campaignValues[gi][k] !== undefined,
                ).length > 0 && <span className="lg-filled-indicator" />}
              </div>

              <div className="lg-adsets-list">
                {group.adset_templates.map((adset, asi) => (
                  <div key={asi} className="lg-adset-block">
                    <div
                      className={`lg-node lg-node-adset ${isNodeSelected({ groupIndex: gi, adsetIndex: asi, level: 'adset' }) ? 'lg-node--selected' : ''}`}
                      onClick={() =>
                        toggleNodeSelection({ groupIndex: gi, adsetIndex: asi, level: 'adset' })
                      }
                    >
                      <span className="lg-badge lg-badge-adset">Ad Set</span>
                      <span className="lg-node-id">Template #{adset.adset_template_id}</span>
                      {Object.keys(launchState.adsetValues[gi]?.[asi] || {}).filter(
                        (k) =>
                          launchState.adsetValues[gi][asi][k] !== '' &&
                          launchState.adsetValues[gi][asi][k] !== undefined,
                      ).length > 0 && <span className="lg-filled-indicator" />}
                    </div>

                    <div className="lg-ads-list">
                      {adset.ad_templates.map((ad, adi) => (
                        <div
                          key={adi}
                          className={`lg-node lg-node-ad ${isNodeSelected({ groupIndex: gi, adsetIndex: asi, adIndex: adi, level: 'ad' }) ? 'lg-node--selected' : ''}`}
                          onClick={() =>
                            toggleNodeSelection({
                              groupIndex: gi,
                              adsetIndex: asi,
                              adIndex: adi,
                              level: 'ad',
                            })
                          }
                        >
                          <span className="lg-badge lg-badge-ad">Ad</span>
                          <span className="lg-node-id">Template #{ad.ad_template_id}</span>
                          {Object.keys(launchState.adValues[gi]?.[asi]?.[adi] || {}).filter(
                            (k) =>
                              launchState.adValues[gi][asi][adi][k] !== '' &&
                              launchState.adValues[gi][asi][adi][k] !== undefined,
                          ).length > 0 && <span className="lg-filled-indicator" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg-form-panel">
          {selectedNodes.length === 0 && (
            <div className="lg-placeholder">
              Select one or more nodes to edit their parameters
            </div>
          )}

          {selectedNodes.length > 0 && !activeLevel && (
            <div className="lg-placeholder">
              Select nodes of the same level to bulk edit
            </div>
          )}

          {activeLevel && activeFields.length > 0 && (
            <div className="lg-form">
              <div className="lg-form-header">
                Editing {selectedNodes.length} {activeLevel}(s)
              </div>
              <div className="lg-form-fields">
                {activeFields.map((field) => {
                  const value = firstSelectedValues[field.name] ?? '';
                  const filteredOptions = filterOptionsByDependency(
                    field,
                    allFieldsForDependency,
                    firstSelectedValues,
                    firstSelectedInherited,
                  );

                  return (
                    <div key={field.name} className="lg-field">
                      <label className="lg-label">
                        {field.label}
                        {field.is_required && <span className="lg-required">*</span>}
                        {field.depend_on && (
                          <span className="lg-depend-tag">depends on: {field.depend_on}</span>
                        )}
                      </label>

                      {field.value_type === 'BOOLEAN' ? (
                        <label className="lg-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => updateValue(field.name, e.target.checked)}
                          />
                          <span>{field.label}</span>
                        </label>
                      ) : field.value_type === 'DATETIME' ? (
                        <input
                          type="datetime-local"
                          className="lg-input"
                          value={String(value || '')}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                        />
                      ) : field.value_type === 'ARRAY' && filteredOptions.length > 0 ? (
                        <div className="lg-chips">
                          {filteredOptions.map((opt) => {
                            const optVal =
                              typeof opt.value === 'object'
                                ? String(resolveOptionId(opt.value))
                                : String(opt.value);
                            const arr = Array.isArray(value) ? (value as (string | number)[]) : [];
                            const isSelected = arr.map(String).includes(optVal);
                            return (
                              <button
                                key={optVal}
                                type="button"
                                className={`lg-chip ${isSelected ? 'lg-chip--selected' : ''}`}
                                onClick={() => {
                                  const newArr = isSelected
                                    ? arr.filter((v) => String(v) !== optVal)
                                    : [...arr, opt.value as string | number];
                                  updateValue(field.name, newArr);
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : filteredOptions.length > 0 ? (
                        <select
                          className="lg-select"
                          value={String(value ?? '')}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                        >
                          <option value="">— Select —</option>
                          {filteredOptions.map((opt) => {
                            const optVal =
                              typeof opt.value === 'object'
                                ? String(resolveOptionId(opt.value))
                                : String(opt.value ?? '');
                            return (
                              <option key={optVal} value={optVal}>
                                {opt.label}
                              </option>
                            );
                          })}
                        </select>
                      ) : field.options && field.depend_on ? (
                        <select className="lg-select" disabled>
                          <option>— Select parent first —</option>
                        </select>
                      ) : (
                        <input
                          type={
                            ['INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE PRECISION'].includes(field.value_type)
                              ? 'number'
                              : 'text'
                          }
                          className="lg-input"
                          value={String(value ?? '')}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                          placeholder={field.label}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="lg-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save All Launch Groups'}
      </button>
    </div>
  );
}
