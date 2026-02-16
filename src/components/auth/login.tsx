import { Form, Formik } from "formik";
import type { ILogin } from "../../types/type";
import { login } from "../../service/auth.service";
import { NavLink, useNavigate } from "react-router";
import { InputField } from "../helper/field-input";
import { addToken } from "../helper/tokens";
import { Button } from "../helper/button";
import * as Yup from "yup";

export function LoginComponent() {
  const navigate = useNavigate();
  let initialValues: ILogin = {
    remember: true,
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Введите email").email("Неверная почта"),
    password: Yup.string()
      .required("Введите пароль")
      .min(6, "Минимум 6 символов"),
  });

  const onSubmit = async (value: ILogin) => {
    const { remember, ...data } = value;
    const { token } = await login(data);

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
        <p className="text-gray-400">Войдите в свой аккаунт</p>
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
            <InputField
              name="remember"
              title="Запомнить меня"
              type="checkbox"
            />

            <Button variant="secondary" className="w-full" type="submit">
              Войти
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-8 text-center text-sm text-gray-400">
        Нет аккаунта?{" "}
        <NavLink
          to="/register"
          className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
        >
          Зарегистрироваться
        </NavLink>
      </p>
    </div>
  );
}
