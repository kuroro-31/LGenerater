import { useDrag } from "react-dnd";

interface DraggableComponentProps {
  type: string;
}

export default function DraggableComponent({ type }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: { type: type }, // DraggableComponentが作成するitemオブジェクトがWebsiteElement型と一致させる
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  let displayText;
  switch (type) {
    case "h1":
      displayText = "H1";
      break;
    case "p":
      displayText = "P";
      break;
    case "img":
      displayText = "IMG";
      break;
    default:
      displayText = "UNKNOWN";
  }

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-pointer"
    >
      {displayText}
    </div>
  );
}
