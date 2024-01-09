import React, { useEffect, useRef, useState } from "react";
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

export default function Editor({ website }: EditorProps) {
  // 各要素の状態を管理するステート
  const [components, setComponents] = useState<WebsiteElement[]>([]);
  const [html, setHtml] = useState<string>(website.html); // website.htmlを使用して初期化
  const [mode, setMode] = useState<"visual" | "code">("visual");

  // 要素がドロップされたときの処理
  const handleDrop = (item: WebsiteElement) => {
    // console.log("ドロップされたアイテム：" + item); // ドロップされたアイテムをログに出力
    setComponents([...components, item]);
  };

  // ページがロードされたとき、またはwebsite.htmlが更新されたときにHTMLを解析してcomponentsステートを初期化
  useEffect(() => {
    const initializeComponents = async () => {
      const html = website.html;

      // HTMLを解析
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // HTML要素をWebsiteElementに変換
      const elements = Array.from(doc.body.children).map((element) => {
        return {
          type: element.tagName.toLowerCase(),
          // ここでは簡単のため、全ての要素の内容を"ここにテキスト"とします
          content: "ここにテキスト",
        };
      });

      // componentsステートを初期化
      setComponents(elements);
    };

    if (!website.html) return;

    initializeComponents();
  }, [website.html]);

  // componentsが更新されたときにHTMLを生成し、サーバーに送信する
  useEffect(() => {
    if (!components || mode === "code") return;

    const newHtml = components
      .map((component, index) => {
        // typeに基づいて適切なHTMLを生成
        if (component.type === "img") {
          return `<img src="/noimage.png" />`;
        } else {
          return `<${component.type}>ここにテキスト</${component.type}>`;
        }
      })
      .join("");

    // htmlステートを更新
    setHtml(newHtml);
  }, [components, mode]);

  // newHtmlが更新されたときにサーバーに送信する
  useEffect(() => {
    // htmlが空でない場合のみ送信
    if (html) {
      fetch(`/api/website/update/${website.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newHtml: html }),
      });
    }
  }, [html, website.id]);

  // ビジュアルモードの処理
  useEffect(() => {
    // 無限ループを防ぐため、modeが"visual"のときのみ処理を実行
    if (!components || mode !== "visual") return;
    if (mode === "visual") {
      // ビジュアルモードに切り替えたとき、htmlステートをcomponentsステートから生成
      const newHtml = components
        .map((component) => {
          if (component.type === "img") {
            return `<img src="/noimage.png" />`;
          } else {
            return `<${component.type}>ここにテキスト</${component.type}>`;
          }
        })
        .join("");
      setHtml(newHtml);
    } else {
      // コードモードに切り替えたとき、componentsステートをhtmlステートから生成
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const elements = Array.from(doc.body.children).map((element) => {
          return {
            type: element.tagName.toLowerCase(),
            // 実際の要素の内容を反映
            content: element.innerHTML,
          };
        });
        setComponents(elements);
      } catch (error) {
        console.error("Failed to parse HTML:", error);
      }
    }
  }, [components, html, mode]); // 依存配列を[mode]に修正

  // コードモードのときの処理
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;

    // htmlステートを更新
    setHtml(newHtml);

    // 既存のタイマーがあればクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 新しいタイマーを設定
    timerRef.current = setTimeout(() => {
      try {
        // HTMLを解析
        const parser = new DOMParser();
        const doc = parser.parseFromString(newHtml, "text/html");

        // HTML要素をWebsiteElementに変換
        const elements = Array.from(doc.body.children).map((element) => {
          return {
            type: element.tagName.toLowerCase(),
            // 実際の要素の内容を反映
            content: element.innerHTML,
          };
        });

        // componentsステートを更新
        setComponents(elements);

        // 生成したHTMLをサーバーに送信
        // htmlが空でない場合のみ送信
        if (newHtml) {
          fetch(`/api/website/update/${website.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ html: newHtml }),
          });
        }
      } catch (error) {
        console.error("Failed to parse HTML:", error);
      }
    }, 3000); // 3秒後に実行
  };

  // 行番号を管理するステートを追加
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  // htmlが更新されたときに行番号を更新する
  useEffect(() => {
    // 改行ごとに分割して行数を計算
    const lines = html.split("\n");
    // 行番号の配列を生成
    const newLineNumbers = lines.map((_, index) => (index + 1).toString());
    // 行番号のステートを更新
    setLineNumbers(newLineNumbers);
  }, [html]);

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
        <div className="canvas w-4/5 min-h-[500px] mt-8">
          {/* モード切り替えボタン */}
          <button
            // モード切り替えボタンのonClickハンドラー
            onClick={() => {
              if (mode === "visual") {
                // ビジュアルモードからコードモードに切り替えるとき
                // htmlステートをcomponentsステートから生成
                const newHtml = components
                  .map((component) => {
                    if (component.type === "img") {
                      return `<img src="/noimage.png" />`;
                    } else {
                      return `<${component.type}>${component.content}</${component.type}>`;
                    }
                  })
                  .join("");
                setHtml(newHtml);
              } else {
                // コードモードからビジュアルモードに切り替えるとき
                // componentsステートをhtmlステートから生成
                try {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, "text/html");
                  const elements = Array.from(doc.body.children).map(
                    (element) => {
                      return {
                        type: element.tagName.toLowerCase(),
                        // 実際の要素の内容を反映
                        content: element.innerHTML,
                      };
                    }
                  );
                  setComponents(elements);
                } catch (error) {
                  console.error("Failed to parse HTML:", error);
                }
              }
              // モードを切り替え
              setMode(mode === "visual" ? "code" : "visual");
            }}
            className="mb-4"
          >
            {mode === "visual"
              ? "コードモードに切り替え"
              : "ビジュアルモードに切り替え"}
          </button>

          {mode === "visual" ? (
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
          ) : (
            <div className="w-full h-full max-w-[870px] shadow-lg flex bg-black text-white p-4 rounded-lg">
              {/* 行番号 */}
              <pre style={{ userSelect: "none", marginRight: "1em" }}>
                {lineNumbers.map((number, index) => (
                  <div key={index} className="text-right min-w-[1.5em]">
                    {number}
                  </div>
                ))}
              </pre>

              <textarea
                value={html}
                className="w-full bg-transparent outline-none"
                onChange={handleCodeChange}
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
