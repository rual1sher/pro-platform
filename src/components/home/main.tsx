import { useNavigate } from "react-router";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Target,
  Users,
} from "lucide-react";
import { Container } from "../helper/container";
import { Button } from "../helper/button";
import { features, stats, statuses } from "../../data/data";

export function HeaderComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Container>
        <section className="relative pt-32 pb-20">
          <div className="grid xl:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/50 backdrop-blur-sm">
                <span className="text-sm font-semibold text-purple-300">
                  🚀 Управление задачами нового поколения
                </span>
              </div>

              <h1 className="font-black text-6xl md:text-7xl bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                PeakDay
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Платформа для совместного управления задачами
              </h2>

              <p className="text-xl text-gray-400 leading-relaxed">
                Представляем систему для современной разработки программного
                обеспечения. Оптимизируйте процессы, проекты и планы развития
                продукта. Работайте эффективно в команде и достигайте целей
                быстрее.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={() => navigate("/tasks")}>
                  Начать работу
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/about")}>
                  Узнать больше
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-black bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {stat.number}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl shadow-purple-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-2xl">
                        Мои проекты
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Активных задач: 24
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 transition-all flex items-center justify-center">
                        <Filter className="w-5 h-5 text-purple-300" />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 transition-all flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-300" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                              Редизайн главной страницы
                            </h4>
                            <p className="text-xs text-gray-500">
                              Дедлайн: 15 февраля
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                          В работе
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />3 дня
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />4 человека
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div
                            className="bg-linear-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 hover:border-green-500/50 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-600/30 flex items-center justify-center">
                            <Award className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                              Оптимизация API
                            </h4>
                            <p className="text-xs text-gray-500">
                              Завершено сегодня
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                          Готово
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          12/12 задач
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {statuses.map((status, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 hover:border-purple-500 transition-all hover:scale-102 cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 ${status.color} rounded-xl flex items-center justify-center text-xl mb-2 shadow-lg`}
                      >
                        {status.emoji}
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {status.count}
                      </p>
                      <p className="text-xs text-gray-500">{status.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Всё, что нужно для{" "}
              <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                эффективной работы
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Мощные инструменты для управления проектами и задачами в одном
              месте
            </p>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 hover:border-purple-500 transition-all hover:scale-102 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-600 to-cyan-600 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-102 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative">
          <div className="bg-linear-to-br from-purple-900/50 to-cyan-900/50 backdrop-blur-sm rounded-3xl border border-purple-500/50 py-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Готовы повысить продуктивность?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам команд, которые уже используют PeakDay
              для управления своими проектами
            </p>
            <Button
              variant="outline"
              className="mx-auto"
              onClick={() => navigate("/tasks")}
            >
              Попробовать бесплатно
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
