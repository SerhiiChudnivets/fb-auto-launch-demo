import { useState, useCallback } from 'react';
import type { FormField, TemplateSave, FieldOptionType } from '../../types';
import './DynamicForm.css';

interface DynamicFormProps {
  fields: FormField[];
  onSave: (data: TemplateSave) => Promise<void>;
  title?: string;
  /** All form values across all levels — used for depend_on filtering */
  parentValues?: Record<string, unknown>;
}

function getDefaultValue(field: FormField): unknown {
  if (field.value_type === 'BOOLEAN') return false;
  if (field.value_type === 'ARRAY') return [];
  if (field.value_type === 'INTEGER' || field.value_type === 'BIGINT' || field.value_type === 'FLOAT' || field.value_type === 'DOUBLE PRECISION') return '';
  return '';
}

function resolveOptionId(val: FieldOptionType['value']): unknown {
  if (val && typeof val === 'object' && 'id' in val) return (val as Record<string, unknown>).id;
  return val;
}

function filterOptionsByDependency(
  field: FormField,
  allFields: FormField[],
  formValues: Record<string, unknown>,
  parentValues?: Record<string, unknown>,
): FieldOptionType[] | null {
  if (!field.options) return null;
  if (!field.depend_on) return field.options;

  const parentField = allFields.find((f) => f.name === field.depend_on);
  if (!parentField) return field.options;

  const parentRawValue = formValues[field.depend_on] ?? parentValues?.[field.depend_on];
  if (parentRawValue === undefined || parentRawValue === '' || parentRawValue === null) return [];

  const parentSelectedOption = parentField.options?.find((opt) => {
    const optId = resolveOptionId(opt.value);
    return String(optId) === String(parentRawValue);
  });
  if (!parentSelectedOption) return [];

  const parentId = resolveOptionId(parentSelectedOption.value);

  return field.options.filter((opt) => {
    if (!opt.value || typeof opt.value !== 'object') return true;
    const val = opt.value as Record<string, unknown>;

    const depKey = `${field.depend_on}_id`;
    if (depKey in val) {
      return String(val[depKey]) === String(parentId);
    }
    for (const key of Object.keys(val)) {
      if (key.endsWith('_ids') && Array.isArray(val[key])) {
        return (val[key] as unknown[]).map(String).includes(String(parentId));
      }
      if (key.endsWith('_id') && key !== 'id') {
        return String(val[key]) === String(parentId);
      }
    }
    return true;
  });
}

export function DynamicForm({ fields, onSave, title, parentValues }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      initial[f.name] = getDefaultValue(f);
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (fieldName: string, value: unknown) => {
      setFormValues((prev) => {
        const next = { ...prev, [fieldName]: value };
        // Reset dependent fields when parent changes
        fields.forEach((f) => {
          if (f.depend_on === fieldName) {
            next[f.name] = getDefaultValue(f);
          }
        });
        return next;
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    },
    [fields],
  );

  const handleArrayToggle = useCallback((fieldName: string, optValue: string | number) => {
    setFormValues((prev) => {
      const current = (prev[fieldName] as (string | number)[]) || [];
      const strVal = String(optValue);
      const exists = current.map(String).includes(strVal);
      return {
        ...prev,
        [fieldName]: exists ? current.filter((v) => String(v) !== strVal) : [...current, optValue],
      };
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (!f.is_required) return;
      const val = formValues[f.name];
      if (val === '' || val === undefined || val === null) {
        newErrors[f.name] = 'Required field';
      }
      if (f.value_type === 'ARRAY' && Array.isArray(val) && val.length === 0) {
        newErrors[f.name] = 'Select at least one option';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const values = fields.map((f) => ({
        name: f.name,
        value: formValues[f.name] as string | number | boolean | string[] | number[],
      }));
      await onSave({ values });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.name];
    const filteredOptions = filterOptionsByDependency(field, fields, formValues, parentValues);

    if (field.value_type === 'BOOLEAN') {
      return (
        <label className="df-checkbox-label">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
          />
          <span className="df-checkbox-text">{field.label}</span>
        </label>
      );
    }

    if (field.value_type === 'DATETIME') {
      return (
        <input
          type="datetime-local"
          className="df-input"
          value={String(value || '')}
          onChange={(e) => handleChange(field.name, e.target.value)}
        />
      );
    }

    if (field.value_type === 'ARRAY' && filteredOptions) {
      const selected = (value as (string | number)[]) || [];
      return (
        <div className="df-chips-container">
          {filteredOptions.map((opt) => {
            const optVal = typeof opt.value === 'object' ? String(resolveOptionId(opt.value)) : opt.value;
            const isSelected = selected.map(String).includes(String(optVal));
            return (
              <button
                key={String(optVal)}
                type="button"
                className={`df-chip ${isSelected ? 'df-chip--selected' : ''}`}
                onClick={() => handleArrayToggle(field.name, optVal as string | number)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    if (filteredOptions && filteredOptions.length > 0) {
      return (
        <select
          className="df-select"
          value={String(value ?? '')}
          onChange={(e) => handleChange(field.name, e.target.value)}
        >
          <option value="">— Select —</option>
          {filteredOptions.map((opt) => {
            const optVal = typeof opt.value === 'object' ? String(resolveOptionId(opt.value)) : String(opt.value ?? '');
            return (
              <option key={optVal} value={optVal}>
                {opt.label}
              </option>
            );
          })}
        </select>
      );
    }

    if (field.options && field.depend_on && filteredOptions && filteredOptions.length === 0) {
      return (
        <select className="df-select" disabled>
          <option>— Select parent first —</option>
        </select>
      );
    }

    const isNumeric = ['INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE PRECISION'].includes(field.value_type);

    return (
      <input
        type={isNumeric ? 'number' : 'text'}
        className="df-input"
        value={String(value ?? '')}
        onChange={(e) => handleChange(field.name, isNumeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        placeholder={field.label}
      />
    );
  };

  return (
    <div className="df-container">
      {title && <h3 className="df-title">{title}</h3>}
      <div className="df-fields">
        {fields.map((field) => (
          <div key={field.name} className="df-field">
            {field.value_type !== 'BOOLEAN' && (
              <label className="df-label">
                {field.label}
                {field.is_required && <span className="df-required">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.name] && <span className="df-error">{errors[field.name]}</span>}
          </div>
        ))}
      </div>
      <button className="df-save-btn" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
