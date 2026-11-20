import { useState } from "react";
import { Form, Formik } from "formik";
import type { IRegister } from "../../types";
import { register } from "../../service/auth.service";
import { NavLink, useNavigate } from "react-router";
import { InputField } from "../helper/field-input";
import { addToken } from "../helper/tokens";
import { Button } from "../ui/button";
import { useAuth } from "../../store/auth.store";
import * as Yup from "yup";
import { UserPlus } from "lucide-react";

export function RegisterComponent() {
  const navigate = useNavigate();
  const { setUser, setOrganizations } = useAuth();
  const [loading, setLoading] = useState(false);

  const initialValues: IRegister = {
    remember: true,
    email: "",
    name: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Введите email").email("Неверная почта"),
    name: Yup.string().required("Введите имя").min(2, "Минимум 2 символа"),
    password: Yup.string().required("Введите пароль").min(6, "Минимум 6 символов"),
  });

  const onSubmit = async (value: IRegister) => {
    setLoading(true);
    const { remember, ...data } = value;
    const res = await register(data);

    if (res?.token) {
      addToken(res.token, remember ?? true);
      if (res.user) setUser(res.user);
      if (res.organizations) setOrganizations(res.organizations);
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[32px] shadow-2xl p-8 max-w-md w-full mx-auto text-[var(--text-primary)]">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center mx-auto mb-3 shadow-md">
          <UserPlus size={22} />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-1">
          Регистрация
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Создайте аккаунт и рабочее пространство организации
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(value) => onSubmit(value)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <InputField name="name" title="Ваше имя" type="text" />
            {errors.name && touched.name && (
              <div className="text-[var(--status-error)] text-xs mt-1 font-semibold">
                {errors.name}
              </div>
            )}

            <InputField name="email" title="Email" type="email" />
            {errors.email && touched.email && (
              <div className="text-[var(--status-error)] text-xs mt-1 font-semibold">
                {errors.email}
              </div>
            )}

            <InputField name="password" title="Пароль" type="password" />
            {errors.password && touched.password && (
              <div className="text-[var(--status-error)] text-xs mt-1 font-semibold">
                {errors.password}
              </div>
            )}

            <InputField name="remember" title="Запомнить меня" type="checkbox" />

            <Button
              variant="primary"
              className="w-full mt-2 !bg-[var(--brand-primary)] !text-[var(--bg-main)] hover:!bg-[var(--brand-primary-hover)] font-bold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-6 text-center text-xs text-[var(--text-secondary)] font-medium">
        Уже есть аккаунт?{" "}
        <NavLink
          to="/login"
          className="text-[var(--brand-primary)] underline hover:text-[var(--brand-secondary)] font-bold transition-colors"
        >
          Войти
        </NavLink>
      </p>
    </div>
  );
}
