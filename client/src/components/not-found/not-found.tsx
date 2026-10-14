import { useNavigate } from "react-router";
import { Button } from "../helper/button";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-linear-to-br from-gray-700 to-gray-900 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-linear-to-r from-blue-500 to-purple-500" />
        </div>

        {/* Message */}
        <div className="mt-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100">
            Страница не найдена
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            К сожалению, страница которую вы ищете не существует или была
            перемещена.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/")}>Вернуться на главную</Button>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    </div>
  );
}
