import { FormField, TemplateSave } from '../../types';
interface DynamicFormProps {
    fields: FormField[];
    onSave: (data: TemplateSave) => Promise<void>;
    title?: string;
    /** All form values across all levels — used for depend_on filtering */
    parentValues?: Record<string, unknown>;
}
export declare function DynamicForm({ fields, onSave, title, parentValues }: DynamicFormProps): import("react/jsx-runtime").JSX.Element;
export {};
