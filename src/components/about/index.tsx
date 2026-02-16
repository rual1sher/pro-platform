import { ArrowRight } from "lucide-react";
import { benefits, features, statuses } from "../../data/data";
import { useNavigate } from "react-router";
import { Button } from "../helper/button";

export function AboutComponent() {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative pt-32 pb-20">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-purple-300">
              🚀 Управление задачами нового поколения
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              ProPlatformu
            </span>
            <br />
            <span className="text-white">Управляй задачами</span>
            <br />
            <span className="bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              легко и быстро
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Современная платформа для управления задачами, которая экономит ваше
            время и упрощает работу команды. Забудьте о сложных системах — здесь
            только то, что действительно работает.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/tasks")}
              className="group px-8 py-4 bg-linear-to-r from-purple-600 to-cyan-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-102 flex items-center gap-2"
            >
              Попробовать бесплатно
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {statuses.map((status, index) => (
              <div
                key={status.name}
                className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-purple-500 transition-all hover:scale-102 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 ${status.color} rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto shadow-lg`}
                >
                  {status.emoji}
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  {status.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="features" className="py-20 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Возможности, которые{" "}
              <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                упрощают жизнь
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Всё, что нужно для эффективного управления задачами в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 hover:border-purple-500 transition-all hover:scale-102 hover:shadow-2xl hover:shadow-purple-500/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-flex w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="benefits" className="py-20 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Почему ProPlatformu — это просто{" "}
              <span className="bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                любовь
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 bg-linear-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-cyan-500 transition-all hover:scale-102"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 relative">
        <div className="container mx-auto">
          <div className="bg-linear-to-br from-purple-900/50 to-cyan-900/50 backdrop-blur-sm rounded-3xl border border-purple-500/50 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-8">
              Для кого создан{" "}
              <span className="text-cyan-400">ProPlatformu?</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">Бизнес</h3>
                <p className="text-slate-300">
                  Малый и средний бизнес в Ташкенте и по всему Узбекистану
                </p>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-bold mb-2">Фрилансеры</h3>
                <p className="text-slate-300">
                  Команды, уставшие от таблиц, Trello или сложных CRM
                </p>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">Быстрый старт</h3>
                <p className="text-slate-300">
                  Те, кому нужен контроль без гемора
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 relative">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Создайте свою первую задачу уже сегодня. Никаких кредитных карт,
            никаких обязательств.
          </p>
          <Button
            onClick={() => navigate("/tasks")}
            className="group px-10 py-5 bg-linear-to-r from-purple-600 to-cyan-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-102 flex items-center gap-3 mx-auto"
          >
            Начать бесплатно
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </>
  );
}
