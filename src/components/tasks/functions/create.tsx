import { Field, Form, Formik } from "formik";
import { useState } from "react";
import type { ITaskRequest } from "../../../types/type";
import { Plus, X } from "lucide-react";
import { InputField } from "../../helper/field-input";
import { create } from "../../../service/task.service";
import { useAuth } from "../../../store/auth.store";
import { useTask } from "../../../store/task.store";
import * as Yup from "yup";
import { Button } from "../../helper/button";

export function CreateTask() {
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const { user } = useAuth();
  const { setTask } = useTask();

  const validate = Yup.object().shape({
    title: Yup.string()
      .required("Обязательное поле")
      .min(5, "Минимум 5 символа")
      .max(50, "Максимум 50 символов"),

    description: Yup.string().optional().max(500, "Максимум 500 символов"),
  });

  const initialValues: ITaskRequest = {
    title: "",
    description: "",
    preority: "0",
    order: "0",
    date: new Date().toLocaleDateString(),
    user_id: user?.id,
  };

  const onSubmit = async (data: ITaskRequest, { resetForm }: any) => {
    const res = await create(data);

    if (res) {
      resetForm();
      setOpen(false);
      setTask(res);
    }

    setLoader(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-gray-100">Мои задачи:</h1>
        <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Новая задача
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-gray-100">Новая задача</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validate}
              onSubmit={onSubmit}
            >
              {({ errors, touched }) => (
                <Form className="p-6 space-y-5">
                  <InputField name="title" type="text" title="Заголовок" />
                  {touched.title && errors.title && (
                    <div className="text-sm text-red-500">{errors.title}</div>
                  )}

                  <InputField
                    name="description"
                    type="textarea"
                    title="Описание"
                  />
                  {touched.description && errors.description && (
                    <div className="text-sm text-red-500">
                      {errors.description}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="preority"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Приоритет
                    </label>
                    <Field
                      as="select"
                      id="preority"
                      name="preority"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-100"
                    >
                      <option value={0}>Низкий</option>
                      <option value={1}>Средний</option>
                      <option value={2}>Высокий</option>
                    </Field>
                  </div>

                  <div>
                    <label
                      htmlFor="order"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Статус
                    </label>
                    <Field
                      as="select"
                      id="order"
                      name="order"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-100"
                    >
                      <option value={0}>Ожидает</option>
                      <option value={1}>В работе</option>
                      <option value={2}>Готово</option>
                      <option value={3}>Отклонено</option>
                    </Field>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full!"
                      disabled={loader}
                      onClick={() => setOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      className="w-full!"
                      disabled={loader}
                    >
                      Создать
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
}
