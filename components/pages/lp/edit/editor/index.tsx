import "highlight.js/styles/atom-one-dark.css";

import hljs from "highlight.js";
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
      if (!website.html) return;
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
    setCode(newHtml);

    // カーソル位置を更新
    setCursorPosition({
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    });

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
    if (!html) return;
    // 改行ごとに分割して行数を計算
    const lines = html.split("\n");
    // 行番号の配列を生成
    const newLineNumbers = lines.map((_, index) => (index + 1).toString());
    // 行番号のステートを更新
    setLineNumbers(newLineNumbers);
  }, [html]);

  useEffect(() => {
    // コードハイライトを適用
    hljs.highlightAll();
  }, [html]);

  const [code, setCode] = useState("");

  // ハイライトされたコードを生成
  const highlightedCode = hljs.highlightAuto(code).value;

  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const handleSelect = (e) => {
    setCursorPosition({
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    });
  };
  // カーソル位置に基づいて行の背景色を設定する関数
  const getHighlightedCodeWithCursor = (code, cursorPosition) => {
    const beforeCursor = hljs.highlightAuto(
      code.slice(0, cursorPosition.start)
    ).value;
    const afterCursor = hljs.highlightAuto(
      code.slice(cursorPosition.end)
    ).value;

    // カーソル位置を示す空のspanタグを挿入
    const cursorHtml = `<span class="cursor-blink"></span>`;

    // 選択されたテキストをオレンジ色の背景でラップする
    const selectedText = hljs.highlightAuto(
      code.slice(cursorPosition.start, cursorPosition.end)
    ).value;
    const selectedHtml = `<span class="hljs-selected">${selectedText}</span>`;

    return {
      __html: beforeCursor + selectedHtml + cursorHtml + afterCursor,
    };
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // デフォルトの改行挿入を防ぐ

      const { start, end } = cursorPosition;
      const beforeCursor = code.slice(0, start);
      const afterCursor = code.slice(end);

      // 改行を挿入してコードを更新
      const newCode = beforeCursor + "\n" + afterCursor;
      setCode(newCode);

      // カーソル位置を更新（改行後の次の位置に設定）
      const newCursorPosition = start + 1;
      setCursorPosition({ start: newCursorPosition, end: newCursorPosition });

      // ハイライトされたコードを更新
      // この行は削除: const highlightedCodeWithCursor = getHighlightedCodeWithCursor(newCode, ...

      // textareaのカーソル位置を更新
      if (textAreaRef.current) {
        textAreaRef.current.selectionStart = newCursorPosition;
        textAreaRef.current.selectionEnd = newCursorPosition;
      }
    }
  };

  const [highlightedCodeWithCursor, setHighlightedCodeWithCursor] = useState({
    __html: "",
  });
  useEffect(() => {
    const newHighlightedCodeWithCursor = getHighlightedCodeWithCursor(
      code,
      cursorPosition
    );
    setHighlightedCodeWithCursor(newHighlightedCodeWithCursor);
  }, [code, cursorPosition]);

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
            <div className="w-full h-full max-w-[870px]">
              {/* 行番号 */}
              <code className="html hljs w-full h-full flex shadow-lg rounded-lg">
                <pre
                  style={{ userSelect: "none", marginRight: "1em" }}
                  className="my-4"
                >
                  {lineNumbers.map((number, index) => (
                    <div key={index} className="text-right min-w-[1.5em]">
                      {number}
                    </div>
                  ))}
                </pre>

                <div className="relative w-full">
                  <pre className="absolute top-0 left-0 w-full h-full overflow-auto pointer-events-none pr-4">
                    <code
                      className="hljs"
                      dangerouslySetInnerHTML={highlightedCodeWithCursor}
                    />
                  </pre>
                  <textarea
                    ref={textAreaRef}
                    className="w-full h-full bg-transparent resize-none outline-none"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    onSelect={handleSelect}
                    onKeyUp={handleSelect}
                    onClick={handleSelect}
                  />
                </div>
              </code>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
