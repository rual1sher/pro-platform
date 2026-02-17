import { Columns3 } from "lucide-react";
import { useState } from "react";
import { Selector } from "../../helper/select";
import { update } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";
import { useOpenEditModal } from "../../../store/open-modal.store";
import { Button } from "../../helper/button";

interface IProps {
  id: number;
  order: string;
}

export function Update({ id, order }: IProps) {
  const { isOpen, onClose, onOpen } = useOpenEditModal();
  const [loader, setLoader] = useState(false);
  const [orderValue, setOrder] = useState(order);
  const { setTasks, tasks } = useTask();

  const handleUpdate = async () => {
    setLoader(true);
    const res = await update(id, { order: orderValue });

    if (res) {
      const newTasks = tasks.filter((t) => t.id !== id);
      setTasks([...newTasks, res]);

      setLoader(false);
      onOpen(id);
    }

    setLoader(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => onOpen(id)}
        className="px-3 py-2 border border-gray-700 rounded-lg hover:bg-gray-700/30 cursor-pointer disabled:bg-transparent disabled:cursor-no-drop"
      >
        <Columns3 color="rgb(150,150,150)" size={18} />
      </button>

      {isOpen === id && (
        <div className="bg-gray-800 p-3 rounded-lg absolute bottom right-0 grid gap-4 z-10">
          <label htmlFor="order" className="font-light text-sm">
            Выберите состояние задачи:
          </label>
          <Selector name="order" value={orderValue} setValue={setOrder}>
            <option value="0">Ожидает</option>
            <option value="1">В работе</option>
            <option value="2">Готово</option>
            <option value="3">Отклонено</option>
          </Selector>

          <div className="flex items-center gap-2 justify-end">
            <Button
              disabled={loader}
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              отменить
            </Button>
            <Button
              disabled={loader}
              variant="secondary"
              size="sm"
              onClick={handleUpdate}
            >
              обновить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
