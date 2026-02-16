import { CheckSquare } from "lucide-react";
import { Container } from "../helper/container";
import { Logout } from "./functions/logout";
import { useLocation, useNavigate } from "react-router";

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-lg fixed top-0 left-0 right-0 z-10">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-linear-to-br from-lime-400 to-green-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-white">Про Платформу</h1>
          </div>

          {pathname === "/tasks" && <Logout />}
        </div>
      </Container>
    </header>
  );
}
