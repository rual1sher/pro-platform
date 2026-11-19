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
    <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[32px] shadow-2xl p-8 max-w-md w-full mx-auto text-[#E3E3E3]">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center mx-auto mb-3 shadow-md">
          <LogIn size={22} />
        </div>
        <h1 className="text-2xl font-black text-[#E3E3E3] tracking-tight mb-1">
          Вход в платформу
        </h1>
        <p className="text-xs text-[#9E9E9E] font-semibold">
          Войдите под своей учетной записью или выберите воркера
        </p>
      </div>

      {/* Quick Demo Login Buttons */}
      <div className="mb-6 p-4 rounded-2xl bg-[#252525] border border-[#2C2C2C] space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#BB86FC] uppercase tracking-wider">
          <Sparkles size={13} />
          <span>Быстрый демо-вход (1 клик)</span>
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
              <UserCheck size={14} className="text-[#BB86FC]" />
              <span className="text-xs font-semibold">Алексей Иванов (Владелец)</span>
            </div>
            <span className="text-[10px] text-[#9E9E9E]">admin@pro.dev</span>
          </Button>

          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => quickLogin("maria@pro.dev")}
            className="w-full justify-between px-3 py-2 rounded-xl text-left font-normal hover:border-[#03DAC6]"
          >
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-[#03DAC6]" />
              <span className="text-xs font-semibold">Мария Смирнова (Frontend)</span>
            </div>
            <span className="text-[10px] text-[#9E9E9E]">maria@pro.dev</span>
          </Button>

          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => quickLogin("dmitry@pro.dev")}
            className="w-full justify-between px-3 py-2 rounded-xl text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-[#BB86FC]" />
              <span className="text-xs font-semibold">Дмитрий Сидоров (Backend)</span>
            </div>
            <span className="text-[10px] text-[#9E9E9E]">dmitry@pro.dev</span>
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2C2C2C]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#1E1E1E] px-3 font-semibold text-[#9E9E9E]">
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
              <div className="text-[#CF6679] text-xs mt-1 font-semibold">
                {errors.email}
              </div>
            )}
            <InputField name="password" title="Пароль" type="password" />
            {errors.password && touched.password && (
              <div className="text-[#CF6679] text-xs mt-1 font-semibold">
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

      <p className="mt-6 text-center text-xs text-[#9E9E9E] font-semibold">
        Нет аккаунта?{" "}
        <NavLink
          to="/register"
          className="text-[#BB86FC] hover:underline font-black transition-colors"
        >
          Зарегистрироваться
        </NavLink>
      </p>
    </div>
  );
}
