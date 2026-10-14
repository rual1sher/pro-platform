import { Field } from "formik";

interface IInput {
  name: string;
  type: string;
  title: string;
}

export function InputField(data: IInput) {
  const isCheckbox = data.type === "checkbox";

  return (
    <div
      className={
        isCheckbox
          ? "flex items-center justify-start gap-2 mb-2"
          : "mb-3"
      }
    >
      {!isCheckbox && (
        <label
          htmlFor={data.name}
          className="block text-xs font-bold text-[#E3E3E3] mb-1.5 uppercase tracking-wider"
        >
          {data.title}
        </label>
      )}

      <Field
        as={data.type === "textarea" ? "textarea" : "input"}
        id={data.name}
        name={data.name}
        type={data.type}
        placeholder={`Введите ${data.title.toLowerCase()}...`}
        className={`px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC] outline-none transition-all duration-200 text-[#E3E3E3] placeholder-[#616161] text-xs font-medium ${
          data.type === "textarea" ? "h-24 resize-none" : ""
        } ${isCheckbox ? "w-4 h-4 rounded accent-[#BB86FC]" : "w-full"}`}
      />

      {isCheckbox && (
        <label
          htmlFor={data.name}
          className="text-xs font-semibold text-[#E3E3E3] cursor-pointer"
        >
          {data.title}
        </label>
      )}
    </div>
  );
}
