import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Filter,
  MessagesSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { benefits, benefitTags, faq, features, stats, statuses } from "../../data/data";
import { Button } from "../ui/button";

const HERO_CHECKS = [
  "Гибкая настройка",
  "Высокая производительность",
  "Надёжная защита данных",
];

// Small illustrative previews under each feature card — plain divs, no images/deps.
const FEATURE_PREVIEWS = [
  <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl px-3 py-2.5">
    <Plus size={13} className="text-[#BB86FC] shrink-0" />
    <span className="text-[11px] text-[#616161] font-medium">
      Что необходимо сделать?
    </span>
  </div>,
  <div className="flex items-center gap-1.5">
    {["Ожидает", "В работе", "Готово"].map((s, i) => (
      <span
        key={s}
        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
          i === 1
            ? "bg-[#2196F3]/15 text-[#2196F3] border-[#2196F3]/30"
            : "bg-[#1E1E1E] text-[#9E9E9E] border-[#2C2C2C]"
        }`}
      >
        {s}
      </span>
    ))}
  </div>,
  <div className="flex items-end gap-1.5 h-10">
    {[40, 70, 55, 90, 65].map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-t-md bg-gradient-to-t from-[#2196F3]/30 to-[#2196F3]"
        style={{ height: `${h}%` }}
      ></div>
    ))}
  </div>,
  <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl px-3 py-2">
    <Search size={12} className="text-[#03DAC6] shrink-0" />
    <span className="text-[11px] text-[#616161] font-medium flex-1">Поиск задач...</span>
    <Filter size={12} className="text-[#9E9E9E] shrink-0" />
  </div>,
  <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl px-3 py-2">
    <div className="w-5 h-5 rounded-full bg-[#BB86FC] shrink-0"></div>
    <span className="text-[11px] text-[#E3E3E3] font-medium flex-1 truncate">
      "Готово, отправил на ревью"
    </span>
    <MessagesSquare size={12} className="text-[#03DAC6] shrink-0" />
  </div>,
];

export function HeaderComponent() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToFaq = () => {
    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full text-[#E3E3E3]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-10 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(187,134,252,0.16),transparent_65%)]"></div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1E1E1E] rounded-full border border-[#2C2C2C]">
            <Sparkles size={13} className="text-[#03DAC6]" />
            <span className="text-xs font-bold text-[#03DAC6]">
              Новое: комментарии и общий чат команды
            </span>
          </div>

          <h1 className="font-black text-4xl sm:text-5xl md:text-6xl text-[#E3E3E3] leading-[1.1] tracking-tight">
            Управляйте каждой задачей
            <br />
            на пути к <span className="text-[#BB86FC]">результату команды</span>
          </h1>

          <p className="text-base md:text-lg text-[#9E9E9E] leading-relaxed font-normal max-w-xl mx-auto">
            Self-hosted task-менеджер для IT-команд: доска задач, роли, чат и прогресс
            организации — в одном лёгком инструменте.
          </p>

          {/* Checks row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {HERO_CHECKS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#E3E3E3]"
              >
                <BadgeCheck size={15} className="text-[#03DAC6]" />
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => navigate("/register")}
              className="!bg-[#BB86FC] !text-[#121212] hover:!bg-[#a370e0] font-bold"
            >
              Начать бесплатно
              <ArrowUpRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={scrollToFaq}
              className="!border-[#2C2C2C] !text-[#E3E3E3] hover:!bg-[#252525]"
            >
              Узнать больше
            </Button>
          </div>
        </div>

        {/* Floating stat card — left */}
        <div className="hidden lg:block absolute left-2 top-40 w-52 bg-[#1E1E1E] border border-[#2C2C2C] rounded-3xl p-4 shadow-2xl -rotate-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wide">
              За эту неделю
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-black text-[#4CAF50]">
              <TrendingUp size={11} />
              +18%
            </span>
          </div>
          <p className="text-xl font-black text-[#E3E3E3] mb-2">128 задач</p>
          <div className="flex items-end gap-1 h-8">
            {[35, 55, 40, 75, 60, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-[#BB86FC]/70"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Floating stat card — right */}
        <div className="hidden lg:block absolute right-2 top-24 w-52 bg-[#1E1E1E] border border-[#2C2C2C] rounded-3xl p-4 shadow-2xl rotate-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wide">
              Воркеров онлайн
            </span>
            <Users size={13} className="text-[#03DAC6]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#BB86FC", "#03DAC6", "#FFB74D"].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full ring-2 ring-[#1E1E1E] flex items-center justify-center text-[10px] font-black text-[#121212]"
                  style={{ backgroundColor: c }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-[#E3E3E3]">+9 сегодня</span>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 pt-8 border-t border-[#2C2C2C]">
          <p className="text-center text-[11px] font-bold text-[#616161] uppercase tracking-wider mb-5">
            Одна платформа для всей работы команды
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl p-3 text-center shadow-xs"
              >
                <p className="text-2xl font-black text-[#BB86FC]">{stat.number}</p>
                <p className="text-[11px] font-semibold text-[#9E9E9E]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goal / Mission */}
      <section className="py-14">
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[36px] p-8 md:p-12 shadow-xs grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-[#03DAC6]/15 border border-[#03DAC6]/30 text-[#03DAC6] flex items-center justify-center shrink-0">
            <Target size={26} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-[#E3E3E3]">Наша цель</h2>
            <p className="text-sm md:text-base text-[#9E9E9E] leading-relaxed font-normal max-w-3xl">
              Дать IT-командам и разработчикам самостоятельный, лёгкий в развёртывании
              task-менеджер — без переплаты за корпоративные SaaS-подписки и без лишней
              сложности. Ставьте платформу на свой сервер, работайте на слабом железе и
              держите весь рабочий процесс — задачи, команду, обсуждения — в одном месте.
            </p>
          </div>
        </div>
      </section>

      {/* Statuses strip */}
      <section className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statuses.map((status) => (
            <div
              key={status.name}
              className="p-5 bg-[#1E1E1E] rounded-3xl border border-[#2C2C2C] shadow-xs text-center hover:border-[#BB86FC]/40 transition-colors"
            >
              <div
                className={`w-12 h-12 ${status.color} rounded-2xl flex items-center justify-center text-2xl mb-2 mx-auto shadow-xs`}
              >
                {status.emoji}
              </div>
              <p className="text-sm font-bold text-[#E3E3E3]">{status.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#03DAC6]">
            Ценные возможности
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#E3E3E3] mt-2 mb-3">
            Гибкие решения под любую задачу
          </h2>
          <p className="text-sm md:text-base text-[#9E9E9E] font-medium max-w-xl mx-auto">
            Интуитивный интерфейс, продуманный до мелочей: от drag-and-drop до
            распределения ролей
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-3xl p-6 shadow-xs hover:border-[#BB86FC]/50 transition-all space-y-4 text-[#E3E3E3]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#252525] text-[#BB86FC] border border-[#2C2C2C] flex items-center justify-center shadow-xs">
                  {feature.icon}
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#E3E3E3]">{feature.title}</h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
              <div className="pt-1">{FEATURE_PREVIEWS[index]}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-5 md:max-w-3xl md:mx-auto">
          {features.slice(3, 5).map((feature, i) => {
            const index = i + 3;
            return (
              <div
                key={index}
                className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-3xl p-6 shadow-xs hover:border-[#BB86FC]/50 transition-all space-y-4 text-[#E3E3E3]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#252525] text-[#BB86FC] border border-[#2C2C2C] flex items-center justify-center shadow-xs">
                  {feature.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[#E3E3E3]">{feature.title}</h3>
                  <p className="text-xs text-[#9E9E9E] leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
                <div className="pt-1">{FEATURE_PREVIEWS[index]}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: heading + tags */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <span className="text-xs font-black uppercase tracking-widest text-[#BB86FC]">
              Преимущества
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#E3E3E3] leading-tight">
              Новый уровень порядка и продуктивности команды
            </h2>
            <p className="text-sm md:text-base text-[#9E9E9E] leading-relaxed font-normal max-w-md">
              Открываем платформу — и сразу понятно, что делать: без обучения, без лишних
              настроек, без потерянных задач.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {benefitTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#1E1E1E] border border-[#2C2C2C] text-[#E3E3E3]"
                >
                  <ShieldCheck size={12} className="text-[#03DAC6]" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: vertical benefit list */}
          <div className="space-y-1">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-4 border-l-2 border-[#2C2C2C] hover:border-[#BB86FC] pl-5 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center text-lg shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E3E3E3]">{benefit.title}</h3>
                  <p className="text-xs text-[#9E9E9E] font-normal leading-relaxed mt-0.5">
                    {benefit.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-[#E3E3E3]">
            Частые вопросы
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faq.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl overflow-hidden"
              >
                <Button
                  variant="ghost"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full justify-between gap-4 p-4 text-left h-auto font-normal rounded-none hover:bg-[#252525]"
                >
                  <span className="text-sm font-bold text-[#E3E3E3]">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#9E9E9E] shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isOpen && (
                  <p className="px-4 pb-4 text-xs text-[#9E9E9E] leading-relaxed font-normal">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16">
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] text-[#E3E3E3] rounded-[36px] p-10 md:p-14 shadow-2xl max-w-4xl mx-auto space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center mx-auto">
            <Zap size={22} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#E3E3E3]">
            Готовы начать работу?
          </h2>
          <p className="text-sm md:text-base text-[#03DAC6] max-w-xl mx-auto font-medium">
            Создайте команду и управляйте задачами эффективно прямо сейчас.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate("/register")}
              className="mx-auto !bg-[#BB86FC] !text-[#121212] hover:!bg-[#a370e0] font-bold"
            >
              Начать бесплатно
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
