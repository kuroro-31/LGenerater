import "highlight.js/styles/atom-one-dark.css";

import hljs from "highlight.js";
import { useEffect, useRef, useState } from "react";
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
  const [cursorPosition, setCursorPosition] = useState(0); // カーソル位置を数値で保存
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [highlightedCodeWithCursor, setHighlightedCodeWithCursor] = useState({
    __html: "",
  });
  const textAreaRef = useRef<HTMLDivElement>(null); // HTMLDivElementに変更
  const timerRef = useRef<number | null>(null);
  const [textAreaHeight, setTextAreaHeight] = useState<number>(0);
  const highlightPreviewRef = useRef<HTMLPreElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // 初期化処理
  useEffect(() => {
    if (website.html) {
      setComponents(parseHtmlToComponents(website.html));
    }
  }, [website.html]);

  // HTMLを解析してWebsiteElement配列を生成する関数
  const parseHtmlToComponents = (htmlString: string): WebsiteElement[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const elements: WebsiteElement[] = [];

    function decodeHtml(html: string): string {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }

    function parseElement(element: Element): WebsiteElement {
      return {
        type: element.tagName.toLowerCase(),
        props: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        content: decodeHtml(element.innerHTML), // HTMLエンティティをデコード
        children: Array.from(element.children).map(parseElement),
      };
    }

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push(parseElement(node as Element));
      }
    });

    return elements;
  };

  // WebsiteElement配列からHTML文字列を生成する関数
  const generateHtmlFromComponents = (elements: WebsiteElement[]): string => {
    return elements
      .map((component) => {
        if (component.type === "img") {
          return `<img src="${component.props.src || "/noimage.png"}" />`;
        } else {
          const props = Object.entries(component.props)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ");
          return `<${component.type} ${props}>${
            component.content || "ここにテキスト"
          }</${component.type}>`;
        }
      })
      .join("");
  };

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

  // 行番号の更新
  useEffect(() => {
    setLineNumbers(html.split("\n").map((_, index) => (index + 1).toString()));
  }, [html]);

  // モードの切り替え
  const toggleMode = () => {
    const newMode = mode === "visual" ? "code" : "visual";
    setMode(newMode);

    if (newMode === "code") {
      // ビジュアルモードからコードモードに切り替える際には、
      // componentsからHTMLを生成してcodeとhtmlの状態を更新する
      const newHtml =
        components.length > 0 ? generateHtmlFromComponents(components) : html;
      setHtml(newHtml);
      setCode(newHtml);
    } else {
      // コードモードからビジュアルモードに切り替える際には、
      // 現在のcodeからcomponentsを生成してcomponentsの状態を更新する
      const newComponents = parseHtmlToComponents(html);
      if (newComponents.length > 0) {
        setComponents(newComponents);
      } else {
        console.error("Failed to parse HTML into components");
      }
    }
  };

  // ドロップハンドラー
  const handleDrop = (item: WebsiteElement) => {
    setComponents([...components, item]);
  };

  // codeが変更されるたびにハイライトを適用
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [code]);

  // カーソル位置を復元
  useEffect(() => {
    if (
      textAreaRef.current &&
      textAreaRef.current.childNodes[0] && // 子ノードが存在することを確認
      cursorPosition !== undefined
    ) {
      const range = document.createRange();
      const sel = window.getSelection();
      const node = textAreaRef.current.childNodes[0];
      const position = Math.min(cursorPosition, node.length); // カーソル位置がノードの長さを超えないようにする
      range.setStart(node, position);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [html, cursorPosition]); // cursorPositionを依存配列に追加

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor flex h-full mt-8">
        <div className="draggable-components w-1/5 p-4 rounded">
          <DraggableComponent type="h1" />
          <DraggableComponent type="p" />
          <DraggableComponent type="img" />
        </div>
        <div className="canvas w-4/5  h-full min-h-[500px]">
          <button onClick={toggleMode} className="mb-4">
            {mode === "visual"
              ? "コードモードに切り替え"
              : "ビジュアルモードに切り替え"}
          </button>
          {mode === "visual" ? (
            <DropArea onDrop={handleDrop}>
              <div
                className="canvas-content w-full h-full max-w-[870px] shadow-lg rounded"
                style={{ backgroundColor: "white" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </DropArea>
          ) : (
            <div className="w-full h-full max-w-[870px] mb-8">
              <code className="html hljs w-full h-full flex shadow-lg rounded-lg">
                {/* 行番号 */}
                <pre className="py-4">
                  {lineNumbers.map((number, index) => (
                    <div key={index} className="text-right min-w-[1.5em]">
                      {number}
                    </div>
                  ))}
                </pre>

                {/* コードの編集 */}
                <pre className="w-full">
                  <code
                    contentEditable
                    className="html outline-none"
                    ref={textAreaRef}
                    onCompositionStart={(e) => {
                      setIsComposing(true);
                    }}
                    onCompositionEnd={(e) => {
                      setIsComposing(false);
                      // 行番号を更新
                      const newHtml = (e.target as HTMLElement).innerText;
                      setLineNumbers(
                        newHtml
                          .split("\n")
                          .map((_, index) => (index + 1).toString())
                      );
                    }}
                    onInput={(e) => {
                      if (!isComposing) {
                        const newHtml = (e.target as HTMLElement).innerText;
                        setHtml(newHtml);
                        setCode(newHtml);

                        const selection = document.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          if (range.startContainer === range.endContainer) {
                            const start =
                              range.startOffset +
                              newHtml.substr(
                                0,
                                newHtml.indexOf(
                                  range.startContainer.textContent
                                )
                              ).length;
                            setCursorPosition(start); // カーソル位置を保存
                          }
                        }

                        setLineNumbers(
                          newHtml
                            .split("\n")
                            .map((_, index) => (index + 1).toString())
                        );

                        // 既存のタイマーがあればクリア
                        if (timerRef.current) {
                          clearTimeout(timerRef.current);
                        }

                        // 新しいタイマーを設定
                        timerRef.current = setTimeout(() => {
                          try {
                            // HTMLを解析
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(
                              newHtml,
                              "text/html"
                            );

                            // HTML要素をWebsiteElementに変換
                            const elements = Array.from(doc.body.children).map(
                              (element) => {
                                return {
                                  type: element.tagName.toLowerCase(),
                                  // 実際の要素の内容を反映
                                  content: element.innerHTML,
                                };
                              }
                            );

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
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isComposing) {
                        e.preventDefault(); // エンターキーが押されたときのデフォルトの挙動を防ぐ

                        // 改行を挿入
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount) {
                          const range = selection.getRangeAt(0);
                          range.deleteContents();
                          const br = document.createElement("br");
                          range.insertNode(br);

                          // 空のテキストノードを挿入
                          const textNode = document.createTextNode("");
                          range.insertNode(textNode);

                          range.setStartAfter(br);
                          range.setEndAfter(br);
                          range.collapse(true);
                          selection.removeAllRanges();
                          selection.addRange(range);

                          // 行番号を更新
                          const newHtml = (e.target as HTMLElement).innerText;
                          setLineNumbers(
                            newHtml
                              .split("\n")
                              .map((_, index) => (index + 1).toString())
                          );
                          return false;
                        }
                      }
                    }}
                  >
                    {code}
                  </code>
                </pre>
              </code>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
