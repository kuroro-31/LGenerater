import "highlight.js/styles/atom-one-dark.css";

import hljs from "highlight.js";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Website } from "@/types/website";
import { WebsiteElement } from "@/types/websiteElement";

import DraggableComponent from "./DraggableComponent";
import DropArea from "./DropArea";

interface EditorProps {
  website: Website;
}

export default function Editor({ website }: EditorProps) {
  const [components, setComponents] = useState<WebsiteElement[]>([]);
  const [html, setHtml] = useState<string>(website.html);
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [code, setCode] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [highlightedCodeWithCursor, setHighlightedCodeWithCursor] = useState({
    __html: "",
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // HTMLを解析してWebsiteElement配列を生成する関数
  const parseHtmlToComponents = (htmlString: string): WebsiteElement[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return Array.from(doc.body.children).map((element) => ({
      type: element.tagName.toLowerCase(),
      content: element.innerHTML,
    }));
  };

  // WebsiteElement配列からHTML文字列を生成する関数
  const generateHtmlFromComponents = (elements: WebsiteElement[]): string => {
    return elements
      .map((component) => {
        if (component.type === "img") {
          return `<img src="/noimage.png" />`;
        } else {
          return `<${component.type}>${
            component.content || "ここにテキスト"
          }</${component.type}>`;
        }
      })
      .join("");
  };

  // 初期化処理
  useEffect(() => {
    if (website.html) {
      setComponents(parseHtmlToComponents(website.html));
    }
  }, [website.html]);

  // componentsが更新されたときにHTMLを生成
  useEffect(() => {
    if (components.length && mode === "visual") {
      setHtml(generateHtmlFromComponents(components));
    }
  }, [components, mode]);

  // HTMLが更新されたときにサーバーに送信
  useEffect(() => {
    if (html) {
      fetch(`/api/website/update/${website.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newHtml: html }),
      });
    }
  }, [html, website.id]);

  // コードモードの処理
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtml(newHtml);
    setCode(newHtml);
    setCursorPosition({
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setComponents(parseHtmlToComponents(newHtml));
    }, 3000);
  };

  // 行番号の更新
  useEffect(() => {
    setLineNumbers(html.split("\n").map((_, index) => (index + 1).toString()));
  }, [html]);

  // コードハイライトの適用
  useEffect(() => {
    hljs.highlightAll();
  }, [html]);

  // カーソル位置に基づいて行の背景色を設定
  useEffect(() => {
    setHighlightedCodeWithCursor(
      getHighlightedCodeWithCursor(code, cursorPosition)
    );
  }, [code, cursorPosition]);

  // カーソル位置に基づいてハイライトされたコードを生成
  const getHighlightedCodeWithCursor = (
    code: string,
    cursorPosition: { start: number; end: number }
  ) => {
    const beforeCursor = hljs.highlightAuto(
      code.slice(0, cursorPosition.start)
    ).value;
    const afterCursor = hljs.highlightAuto(
      code.slice(cursorPosition.end)
    ).value;
    const selectedText = hljs.highlightAuto(
      code.slice(cursorPosition.start, cursorPosition.end)
    ).value;
    const cursorHtml = `<span class="cursor-blink"></span>`;
    const selectedHtml = `<span class="hljs-selected">${selectedText}</span>`;
    return { __html: beforeCursor + selectedHtml + cursorHtml + afterCursor };
  };

  // モード切り替えハンドラー
  const toggleMode = () => {
    const newMode = mode === "visual" ? "code" : "visual";
    setMode(newMode);

    if (newMode === "code") {
      setHtml(generateHtmlFromComponents(components));
    } else {
      setComponents(parseHtmlToComponents(html));
    }
  };

  // ドロップハンドラー
  const handleDrop = (item: WebsiteElement) => {
    setComponents([...components, item]);
  };

  // エンターキー押下時の処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { start, end } = cursorPosition;
      const beforeCursor = code.slice(0, start);
      const afterCursor = code.slice(end);
      const newCode = beforeCursor + "\n" + afterCursor;
      setCode(newCode);
      const newCursorPosition = start + 1;
      setCursorPosition({ start: newCursorPosition, end: newCursorPosition });
      if (textAreaRef.current) {
        textAreaRef.current.selectionStart = newCursorPosition;
        textAreaRef.current.selectionEnd = newCursorPosition;
      }
    }
  };

  // 選択範囲の変更時の処理
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition({
      start: target.selectionStart,
      end: target.selectionEnd,
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor flex">
        <div className="draggable-components w-1/5 p-4 rounded">
          <DraggableComponent type="h1" />
          <DraggableComponent type="p" />
          <DraggableComponent type="img" />
        </div>
        <div className="canvas w-4/5 min-h-[500px] mt-8">
          <button onClick={toggleMode} className="mb-4">
            {mode === "visual"
              ? "コードモードに切り替え"
              : "ビジュアルモードに切り替え"}
          </button>
          {mode === "visual" ? (
            <DropArea onDrop={handleDrop}>
              {components.map((component, index) =>
                component.type === "img"
                  ? React.createElement(component.type, {
                      key: index,
                      src: "/noimage.png",
                    })
                  : React.createElement(
                      component.type,
                      { key: index },
                      component.content || "ここにテキスト"
                    )
              )}
            </DropArea>
          ) : (
            <div className="w-full h-full max-w-[870px]">
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
