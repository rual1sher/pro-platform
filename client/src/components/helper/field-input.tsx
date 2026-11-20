import { Field } from "formik";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import type { IInputField } from "../../types";

export type { IInputField };

export function InputField({ name, type, title }: IInputField) {
  const isCheckbox = type === "checkbox";
  const isTextarea = type === "textarea";

  return (
    <div
      className={
        isCheckbox ? "flex items-center justify-start gap-2 mb-2" : "mb-3 space-y-1.5"
      }
    >
      {!isCheckbox && <Label htmlFor={name}>{title}</Label>}

      <Field name={name}>
        {({ field }: { field: React.InputHTMLAttributes<HTMLInputElement> }) =>
          isTextarea ? (
            <Textarea
              id={name}
              {...(field as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              placeholder={`Введите ${title.toLowerCase()}...`}
              className="h-24"
            />
          ) : (
            <Input
              id={name}
              type={type}
              {...field}
              placeholder={isCheckbox ? undefined : `Введите ${title.toLowerCase()}...`}
              className={cn(
                isCheckbox && "w-4 h-4 rounded accent-[var(--brand-primary)] p-0",
              )}
            />
          )
        }
      </Field>

      {isCheckbox && (
        <Label
          htmlFor={name}
          className="normal-case tracking-normal text-xs font-semibold cursor-pointer"
        >
          {title}
        </Label>
      )}
    </div>
  );
}
