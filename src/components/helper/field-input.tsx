import { Field } from "formik";

interface IInput {
  name: string;
  type: string;
  title: string;
}

export function InputField(data: IInput) {
  return (
    <div
      className={
        data.type === "checkbox"
          ? "flex items-center justify-start gap-2 mb-3"
          : "mb-3"
      }
    >
      <label
        htmlFor={data.name}
        className={"block text-sm font-medium text-gray-300 mb-1"}
      >
        {data.title}
      </label>
      <Field
        as={data.type === "textarea" ? "textarea" : "input"}
        id={data.name}
        name={data.name}
        type={data.type}
        placeholder={`ведите..`}
        className={`px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-100 placeholder-gray-500 ${data.type === "textarea" ? "h-50" : ""} ${data.type === "checkbox" ? "w-auto" : "w-full"}`}
      />
    </div>
  );
}
