import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Website } from "@/types/website";
import { WebsiteElement } from "@/types/websiteElement";

// ドラッグ可能なコンポーネント
import DraggableComponent from "./DraggableComponent";
// ドロップ可能なエリア
import DropArea from "./DropArea";

interface EditorProps {
  website: Website;
}
interface Item {
  type: string;
  // 他のプロパティ...
}

export default function Editor({ website }: EditorProps) {
  // 各要素の状態を管理するステート
  const [components, setComponents] = useState<WebsiteElement[]>([]);

  // 要素がドロップされたときの処理
  const handleDrop = (item: Item) => {
    setComponents([...components, item]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor">
        {/* ドラッグ可能なコンポーネント */}
        <DraggableComponent type="h1" />
        <DraggableComponent type="p" />
        <DraggableComponent type="img" />

        {/* ドロップ可能なエリア */}
        <DropArea onDrop={handleDrop}>
          {/* ドロップされた要素を表示 */}
          {components.map((component, index) => (
            <div key={index}>{component.type}</div>
          ))}
        </DropArea>
      </div>
    </DndProvider>
  );
}
