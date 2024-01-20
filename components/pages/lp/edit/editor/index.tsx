import 'highlight.js/styles/atom-one-dark.css';

import hljs from 'highlight.js';
import { XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Language, LocalizedHtml, Website } from '@/types/website';
import { WebsiteElement } from '@/types/websiteElement';

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
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    Language.JP
  );

  // 初期化処理
  useEffect(() => {
    let localizedHtml = website.localizedHtml.find(
      (html) => html.language === selectedLanguage
    );
    if (!localizedHtml) {
      localizedHtml = {
        language: selectedLanguage,
        content: "<p>ここにテキスト</p>",
      };
      website.localizedHtml.push(localizedHtml);
    }
    setComponents(parseHtmlToComponents(localizedHtml.content));
  }, [website.localizedHtml, selectedLanguage]);

  // HTMLを解析してWebsiteElement配列を生成する関数
  const parseHtmlToComponents = (
    localizedHtml: LocalizedHtml
  ): WebsiteElement[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(localizedHtml.content, "text/html");
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

  // 選択可能な言語のリスト
  const languages = Object.values(Language);
  // htmlとcodeの状態をLocalizedHtmlの配列に変更
  const [localizedHtmls, setLocalizedHtmls] = useState<LocalizedHtml[]>(
    website.localizedHtml || []
  );
  // 選択された言語のLocalizedHtmlを取得
  const selectedLocalizedHtml = localizedHtmls.find(
    (localizedHtml) => localizedHtml.language === selectedLanguage
  );
  // 選択された言語のHTMLを取得
  const selectedHtml = selectedLocalizedHtml
    ? selectedLocalizedHtml.content
    : "";
  // 選択された言語のHTMLを更新
  const updateHtml = (newHtml: string) => {
    setLocalizedHtmls(
      localizedHtmls.map((html) =>
        html.language === selectedLanguage
          ? { ...html, content: newHtml }
          : html
      )
    );
  };
  // 選択された言語のHTMLをサーバーに送信
  useEffect(() => {
    if (selectedHtml) {
      fetch(`/api/website/update/${website.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          content: selectedHtml,
        }),
      });
    }
  }, [selectedHtml, website.id, selectedLanguage]);

  // 行番号の更新
  useEffect(() => {
    if (selectedLocalizedHtml && selectedLocalizedHtml.content) {
      setLineNumbers(
        selectedLocalizedHtml.content
          .split("\n")
          .map((_, index) => (index + 1).toString())
      );
    }
  }, [selectedLocalizedHtml]);

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
      const localizedHtml = website.localizedHtml.find(
        (html) => html.language === selectedLanguage
      );
      if (localizedHtml) {
        const newComponents = parseHtmlToComponents(localizedHtml);
        if (newComponents.length > 0) {
          setComponents(newComponents);
        } else {
          console.error("Failed to parse HTML into components");
        }
      }
    }
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

  const [selectedElement, setSelectedElement] = useState<WebsiteElement | null>(
    null
  );
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault(); // デフォルトの挙動をキャンセル
    const element = e.target as HTMLElement;

    setSelectedElement({
      type: element.tagName.toLowerCase(),
      props: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {}),
      content: element.innerHTML,
    });
  };

  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // すべての要素からhoverスタイルを削除
    document.querySelectorAll(".hover-style").forEach((el) => {
      el.classList.remove("hover-style");
    });

    const element = e.target as HTMLElement;

    // 直接hoverされた要素にhoverスタイルを適用
    element.classList.add("hover-style");
  };

  const updateElement = (newProps: { [key: string]: any }) => {
    if (selectedElement) {
      setSelectedElement({
        ...selectedElement,
        props: { ...selectedElement.props, ...newProps },
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="editor flex w-full h-full mt-[50px]"
        onClick={() => setSelectedElement(null)} // canvas-content以外要素クリックでクイック編集閉
      >
        {/* LP情報設定 */}
        {/* <div
          className={`properties-panel fixed top-[50px] left-0 w-[288px] h-screen overflow-auto transition-all duration-400 ease-in-out transform ${
            selectedElement
              ? "translate-x-0 opacity-100 visible"
              : "-translate-x-full opacity-0 invisible"
          }`}
          onClick={(e) => e.stopPropagation()} // クイック編集以外の要素クリックでクイック編集閉
        >
          <div className="bg-white shadow-lg rounded-lg p-4 h-full">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="font-normal">クイック編集</h2>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-gray-500"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <h3 className="font-bold mb-2">{selectedElement?.type}</h3>
            <input
              className="w-full p-2 border border-primary rounded mb-4"
              value={selectedElement?.content || ""}
              onChange={(e) =>
                setSelectedElement({
                  ...selectedElement,
                  content: e.target.value,
                })
              }
            />
            {Object.entries(selectedElement?.props || {}).map(
              ([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block font-bold mb-1">{key}</label>
                  <input
                    className="w-full p-2 border border-primary rounded"
                    value={value}
                    onChange={(e) => updateElement({ [key]: e.target.value })}
                  />
                </div>
              )
            )}
          </div>
        </div> */}

        <div className="canvas relative w-full flex flex-col items-center min-h-[500px] pt-8">
          <div>
            <div className="flex justify-between mb-4">
              {/* 言語切り替えトグル */}
              <div>
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => setSelectedLanguage(language)}
                    className={
                      selectedLanguage === language
                        ? "border border-primary text-primary mr-2 px-4 py-1 rounded-full"
                        : "border mr-2 px-4 py-1 rounded-full"
                    }
                  >
                    {language}
                  </button>
                ))}
              </div>

              {/* モード切り替え */}
              <button onClick={toggleMode} className="mb-4">
                {mode === "visual"
                  ? "コードモードに切り替え"
                  : "ビジュアルモードに切り替え"}
              </button>
            </div>

            {mode === "visual" ? (
              <>
                <div
                  className="canvas-content w-full h-full min-w-[870px] max-w-[870px] min-h-[400px] shadow-lg rounded"
                  style={{ backgroundColor: "white" }}
                  dangerouslySetInnerHTML={{ __html: html }}
                  onClick={(e) => {
                    e.stopPropagation(); // canvas-content以外要素クリックでクイック編集閉
                    handleClick(e);
                  }}
                  onMouseOver={handleHover}
                />
                <style>
                  {`
                  .hover-style {
                    background-color: rgba(111, 86, 249, 0.15);
                    border: 1px solid rgba(111, 86, 249, 1);
                    cursor: pointer;
                    border-radius: 2px;
                  }
              `}
                </style>
              </>
            ) : (
              <div className="w-full h-full min-w-[870px] max-w-[870px] mb-8">
                <code className="html hljs w-full h-full flex shadow-lg rounded-lg overflow-auto">
                  {/* 行番号 */}
                  <pre className="py-4 flex flex-col items-center">
                    {lineNumbers.map((number, index) => (
                      <div key={index} className="text-right min-w-[1.5em]">
                        {number}
                      </div>
                    ))}
                  </pre>

                  {/* コードの編集 */}
                  <pre className="w-full p-4">
                    <div
                      contentEditable
                      className="html outline-none w-full h-full"
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
                          let newHtml = (e.target as HTMLElement).innerText;

                          // 選択された言語のHTMLを更新
                          const localizedHtml = website.localizedHtml.find(
                            (html) => html.language === selectedLanguage
                          );
                          if (localizedHtml) {
                            localizedHtml.content = newHtml;
                          }

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
                              const elements = Array.from(
                                doc.body.children
                              ).map((element) => {
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
                    </div>
                  </pre>
                </code>
              </div>
            )}

            {/* クイック編集 */}
            <div
              className={`properties-panel fixed top-[50px] right-0 w-[288px] h-screen overflow-auto transition-all duration-400 ease-in-out transform ${
                selectedElement
                  ? "translate-x-0 opacity-100 visible"
                  : "translate-x-full opacity-0 invisible"
              }`}
              onClick={(e) => e.stopPropagation()} // クイック編集以外の要素クリックでクイック編集閉
            >
              <div className="bg-white shadow-lg rounded-lg p-4 h-full">
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <h2 className="font-normal">クイック編集</h2>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-gray-500"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                <h3 className="font-bold mb-2">{selectedElement?.type}</h3>
                <input
                  className="w-full p-2 border border-primary rounded mb-4"
                  value={selectedElement?.content || ""}
                  onChange={(e) =>
                    setSelectedElement({
                      ...selectedElement,
                      content: e.target.value,
                    })
                  }
                />
                {Object.entries(selectedElement?.props || {}).map(
                  ([key, value]) => (
                    <div key={key} className="mb-2">
                      <label className="block font-bold mb-1">{key}</label>
                      <input
                        className="w-full p-2 border border-primary rounded"
                        value={value}
                        onChange={(e) =>
                          updateElement({ [key]: e.target.value })
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
