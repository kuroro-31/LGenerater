import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Website } from '@/types/website';
import { WebsiteElement } from '@/types/websiteElement';

// ドラッグ可能なコンポーネント
import DraggableComponent from './DraggableComponent';
// ドロップ可能なエリア
import DropArea from './DropArea';

interface EditorProps {
  website: Website;
}

export default function Editor({ website }: EditorProps) {
  // 各要素の状態を管理するステート
  const [components, setComponents] = useState<WebsiteElement[]>([]);

  // 要素がドロップされたときの処理
  const handleDrop = (item: WebsiteElement) => {
    console.log(item); // ドロップされたアイテムをログに出力
    setComponents([...components, item]);
  };

  // componentsが更新されたときにHTMLを生成し、サーバーに送信する
  useEffect(() => {
    const html = components
      .map((component, index) => {
        // typeに基づいて適切なHTMLを生成
        if (component.type === "img") {
          return `<img src="/noimage.png" />`;
        } else {
          return `<${component.type}>ここにテキスト</${component.type}>`;
        }
      })
      .join("");

    // 生成したHTMLをサーバーに送信
    fetch(`/api/website/update/${website.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });
  }, [components, website.id]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor flex">
        {/* ドラッグコンポーネント */}
        <div className="draggable-components w-1/5 p-4 rounded">
          <DraggableComponent type="h1" />
          <DraggableComponent type="p" />
          <DraggableComponent type="img" />
        </div>

        {/* キャンバス（ドロップ可能エリア） */}
        <div className="canvas w-4/5 min-h-[500px] bg-white">
          <DropArea onDrop={handleDrop}>
            {/* ドロップ要素を表示 */}
            {components.map((component, index) => {
              // typeに基づいて適切な要素を作成
              let Element;
              if (component.type === "img") {
                Element = React.createElement(component.type, {
                  key: index,
                  src: "/noimage.png",
                });
              } else {
                Element = React.createElement(
                  component.type,
                  { key: index },
                  "ここにテキスト"
                );
              }
              return Element;
            })}
          </DropArea>
        </div>
      </div>
    </DndProvider>
  );
}
