import { Form, Formik } from "formik";
import type { IRegister } from "../../types/type";
import { NavLink, useNavigate } from "react-router";
import { InputField } from "../helper/field-input";
import { register } from "../../service/auth.service";
import { addToken } from "../helper/tokens";
import { Button } from "../helper/button";
import * as Yup from "yup";

export function RegisterComponent() {
  const navigate = useNavigate();
  let initialValues: IRegister = {
    remember: true,
    email: "",
    name: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Введите email").email("Неверная почта"),
    name: Yup.string().required("Введите имя"),
    password: Yup.string()
      .required("Введите пароль")
      .min(6, "Минимум 6 символов"),
  });

  const onSubmit = async (value: IRegister) => {
    const { remember, ...data } = value;
    const { token } = await register(data);

    if (token) {
      addToken(token, remember);
      navigate("/tasks");
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Добро пожаловать
        </h1>
        <p className="text-gray-400">Создайте свой аккаунт</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(value) => onSubmit(value)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <InputField name="email" title="Email" type="email" />
            {errors.email && touched.email && (
              <div className="text-red-500 text-sm mb-3">{errors.email}</div>
            )}
            <InputField name="password" title="Пароль" type="password" />
            {errors.password && touched.password && (
              <div className="text-red-500 text-sm mb-3">{errors.password}</div>
            )}
            <InputField name="name" title="Имя" type="text" />
            {errors.name && touched.name && (
              <div className="text-red-500 text-sm mb-3">{errors.name}</div>
            )}
            <InputField
              name="remember"
              title="Запомнить меня"
              type="checkbox"
            />

            <Button variant="secondary" className="w-full" type="submit">
              Зарегистрироваться
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-8 text-center text-sm text-gray-400">
        Уже зарегистрированы?{" "}
        <NavLink
          to="/login"
          className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
        >
          Вход
        </NavLink>
      </p>
    </div>
  );
}
