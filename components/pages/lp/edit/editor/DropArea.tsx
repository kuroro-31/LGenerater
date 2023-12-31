import { useDrop } from "react-dnd";

import { WebsiteElement } from "@/types/websiteElement";

interface DropAreaProps {
  onDrop: (item: WebsiteElement) => void;
  children: React.ReactNode;
}

export default function DropArea({ onDrop, children }: DropAreaProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ["h1", "p", "img"], // 受け入れる要素のタイプを指定
    drop: onDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{ backgroundColor: isOver ? "lightgray" : "white" }}
      className="canvas-content w-full h-full max-w-[870px] shadow-lg rounded"
    >
      {children}
    </div>
  );
}
