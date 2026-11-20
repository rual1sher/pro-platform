import { useState } from "react";
import { Form, Formik } from "formik";
import type { ILogin } from "../../types";
import { login } from "../../service/auth.service";
import { NavLink, useNavigate } from "react-router";
import { InputField } from "../helper/field-input";
import { addToken } from "../helper/tokens";
import { Button } from "../ui/button";
import { useAuth } from "../../store/auth.store";
import * as Yup from "yup";
import { LogIn, Sparkles, UserCheck } from "lucide-react";

export function LoginComponent() {
  const navigate = useNavigate();
  const { setUser, setOrganizations } = useAuth();
  const [loading, setLoading] = useState(false);

  const initialValues: ILogin = {
    remember: true,
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Введите email").email("Неверная почта"),
    password: Yup.string().required("Введите пароль").min(6, "Минимум 6 символов"),
  });

  const onSubmit = async (value: ILogin) => {
    setLoading(true);
    const { remember, ...data } = value;
    const res = await login(data);

    if (res?.token) {
      addToken(res.token, remember ?? true);
      if (res.user) setUser(res.user);
      if (res.organizations) setOrganizations(res.organizations);
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    const res = await login({ email, password: "password123" });
    if (res?.token) {
      addToken(res.token, true);
      if (res.user) setUser(res.user);
      if (res.organizations) setOrganizations(res.organizations);
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] p-7 max-w-md w-full mx-auto text-[var(--text-primary)]">
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center mx-auto mb-3 shadow-sm">
          <LogIn size={20} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          Вход в платформу
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-normal">
          Войдите под своей учетной записью или выберите воркера
        </p>
      </div>

      {/* Quick Demo Login Buttons */}
      <div className="mb-6 p-3.5 rounded-xl bg-[var(--bg-overlay)]/70 border border-[var(--border-light)] space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
          <Sparkles size={12} />
          <span>Быстрый демо-вход</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => quickLogin("admin@pro.dev")}
            className="w-full justify-between px-3 py-2 rounded-xl text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-[var(--brand-primary)]" />
              <span className="text-xs font-semibold">Алексей Иванов (Владелец)</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              admin@pro.dev
            </span>
          </Button>

          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => quickLogin("maria@pro.dev")}
            className="w-full justify-between px-3 py-2 rounded-xl text-left font-normal hover:border-[var(--brand-secondary)]"
          >
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-[var(--brand-secondary)]" />
              <span className="text-xs font-semibold">Мария Смирнова (Frontend)</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              maria@pro.dev
            </span>
          </Button>

          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => quickLogin("dmitry@pro.dev")}
            className="w-full justify-between px-3 py-2 rounded-xl text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-[var(--brand-primary)]" />
              <span className="text-xs font-semibold">Дмитрий Сидоров (Backend)</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              dmitry@pro.dev
            </span>
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-light)]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--bg-surface)] px-3 font-semibold text-[var(--text-secondary)]">
            или обычный логин
          </span>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(value) => onSubmit(value)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
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
              className="w-full mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-6 text-center text-xs text-[var(--text-secondary)] font-semibold">
        Нет аккаунта?{" "}
        <NavLink
          to="/register"
          className="text-[var(--brand-primary)] hover:underline font-semibold transition-colors"
        >
          Зарегистрироваться
        </NavLink>
      </p>
    </div>
  );
}
