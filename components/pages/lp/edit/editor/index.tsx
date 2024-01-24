import "highlight.js/styles/atom-one-dark.css";

import hljs from "highlight.js";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

import { Language, LocalizedHtml, Website } from "@/types/website";
import { WebsiteElement } from "@/types/websiteElement";

interface EditorProps {
  website: Website;
}

export default function Editor({ website }: EditorProps) {
  const [components, setComponents] = useState<WebsiteElement[]>([]);
  const [html, setHtml] = useState<string>(website.html);
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [code, setCode] = useState("");
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    Language.JP
  );
  const [localizedHtmls, setLocalizedHtmls] = useState<LocalizedHtml[]>(
    website.localizedHtml || []
  ); // htmlとcodeの状態をLocalizedHtmlの配列に変更
  const languages = Object.values(Language); // 選択可能な言語のリスト
  const selectedLocalizedHtml = localizedHtmls.find(
    (localizedHtml) => localizedHtml.language === selectedLanguage
  ); // 選択された言語のLocalizedHtmlを取得
  const selectedHtml = selectedLocalizedHtml
    ? selectedLocalizedHtml.content
    : ""; // 選択された言語のHTMLを取得
  const [selectedElement, setSelectedElement] = useState<WebsiteElement | null>(
    null
  );
  // 保存の状態を管理するステート
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /*
  |--------------------------------------------------------------------------
  |共通処理
  --------------------------------------------------------------------------
  */
  // 初期化処理
  useEffect(() => {
    // 選択された言語のLocalizedHtmlが存在するか確認し、存在しなければ初期化
    const existingLocalizedHtml = localizedHtmls.find(
      (html) => html.language === selectedLanguage
    );

    if (!existingLocalizedHtml) {
      // 対応する言語のエントリが存在しない場合、デフォルトのコンテンツを持つ新しいエントリを追加
      const newLocalizedHtml = {
        language: selectedLanguage,
        content: "",
      };
      setLocalizedHtmls([...localizedHtmls, newLocalizedHtml]);
    } else {
      // 既存のLocalizedHtmlがある場合、ビジュアルモードで表示するHTMLを設定
      setHtml(existingLocalizedHtml.content);
    }
  }, [selectedLanguage, localizedHtmls]);

  // 言語切り替え
  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    // 選択された言語に対応するHTMLコンテンツを取得してログ出力
    const localizedHtml = website.localizedHtml.find(
      (html) => html.language === language
    );
    if (localizedHtml) {
      setCode(localizedHtml.content);
    }
  };

  // モードの切り替え
  const toggleMode = () => {
    const newMode = mode === "visual" ? "code" : "visual";
    setMode(newMode);

    if (newMode === "code") {
      // コードモードへの切り替えロジック
      const currentLocalizedHtml = localizedHtmls.find(
        (html) => html.language === selectedLanguage
      );
      if (currentLocalizedHtml) {
        setCode(currentLocalizedHtml.content);
        // ハイライトを適用するために、コードを更新
        setTimeout(() => {
          document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightBlock(block as HTMLElement);
          });
        }, 0);
      }
    } else {
      // ビジュアルモードへの切り替えロジック
      // コードモードでの変更をlocalizedHtmlsに反映
      const updatedLocalizedHtmls = localizedHtmls.map((localizedHtml) => {
        if (localizedHtml.language === selectedLanguage) {
          return { ...localizedHtml, content: code };
        }
        return localizedHtml;
      });
      setLocalizedHtmls(updatedLocalizedHtmls);

      // 更新されたlocalizedHtmlsを使用してビジュアルモードのHTMLを設定
      const updatedLocalizedHtml = updatedLocalizedHtmls.find(
        (html) => html.language === selectedLanguage
      );
      if (updatedLocalizedHtml) {
        setHtml(updatedLocalizedHtml.content);
      }
    }
  };

  // サーバーに更新を送信する関数
  const sendUpdateToServer = useCallback(
    (html: string): Promise<void> => {
      return fetch(`/api/website/update/${website.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          content: html,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            // エラーレスポンスの場合、エラー内容をログに出力
            console.error(`Server responded with status: ${response.status}`);
            return response.text().then((text) => {
              throw new Error(`Server response: ${text}`);
            });
          }
          return response.json();
        })
        .catch((error) => {
          // エラーをキャッチして適切に処理
          console.error("Failed to send update to server:", error);
          // ここでユーザーにエラーを通知するためのUIの更新を行う
        });
    },
    [selectedLanguage, website.id]
  );

  /*
  |--------------------------------------------------------------------------
  |ビジュアルモード
  --------------------------------------------------------------------------
  */
  // モードがビジュアルの場合、選択された言語のHTMLをビジュアル表示用に設定
  useEffect(() => {
    if (mode === "visual" && selectedLocalizedHtml) {
      setHtml(selectedLocalizedHtml.content);
    }
  }, [mode, selectedLanguage, localizedHtmls, selectedLocalizedHtml]);

  // componentsが更新されたときにHTMLを生成
  useEffect(() => {
    if (components.length && mode === "visual") {
      setHtml(generateHtmlFromComponents(components));
    }
  }, [components, mode]);

  // ローカライズされたHTMLを更新
  useEffect(() => {
    setLocalizedHtmls(website.localizedHtml || []);
  }, [website.localizedHtml]);

  // WebsiteElement配列からHTML文字列を生成する関数
  const generateHtmlFromComponents = (elements: WebsiteElement[]): string => {
    return elements
      .map((component) => {
        if (component.type === "img") {
          return `<img src="${component.props.src || "/noimage.png"}" />`;
        } else {
          const props = component.props
            ? Object.entries(component.props)
                .map(([key, value]) => `${key}="${value}"`)
                .join(" ")
            : "";
          return `<${component.type} ${props}>${component.content || ""}</${
            component.type
          }>`;
        }
      })
      .join("");
  };

  // ビジュアルモードで要素をクリックしたときにクイック編集を開始
  const openQuickEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault(); // デフォルトの挙動をキャンセル
    const element = e.target as HTMLElement;

    // hover-style クラスを削除
    element.classList.remove("hover-style");

    setSelectedElement({
      type: element.tagName.toLowerCase(),
      props: Array.from(element.attributes).reduce((acc, attr) => {
        if (attr.name === "class") {
          acc[attr.name] = attr.value;
        }
        return acc;
      }, {}),
      content: element.innerHTML,
    });
  };

  // ビジュアルモードで要素にhoverしたときにhoverスタイルを適用
  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // すべての要素からhoverスタイルを削除
    document.querySelectorAll(".hover-style").forEach((el) => {
      el.classList.remove("hover-style");
    });

    const element = e.target as HTMLElement;

    // 直接hoverされた要素にhoverスタイルを適用
    // div要素はhoverスタイルの対象外とする
    if (!element.classList.contains("canvas-content")) {
      element.classList.add("hover-style");
    }
  };

  // クイック編集でプロパティを更新する関数
  const updateElement = (
    newProps: { [key: string]: any },
    newContent?: string
  ) => {
    if (selectedElement && "id" in selectedElement) {
      // selectedElementにidが含まれていることを確認
      // 新しいプロパティとコンテンツでselectedElementを更新
      const updatedElement = {
        ...selectedElement,
        props: { ...selectedElement.props, ...newProps },
        content:
          newContent !== undefined ? newContent : selectedElement.content,
      };

      // components 配列を更新
      const updatedComponents = components.map((component) => {
        if ("id" in component && component.id === selectedElement.id) {
          // 各componentにidが含まれていることを確認
          return { ...component, ...updatedElement }; // 更新された要素で置き換え
        }
        return component;
      });

      if (updatedComponents.length === 0) {
        console.error(
          "updateElement: No components were updated. Check the ids."
        );
        return;
      }

      // 更新されたselectedElementとcomponents配列をstateに設定する
      setSelectedElement(updatedElement);
      setComponents(updatedComponents);
      // その他のステート更新処理...
    } else {
      console.error("updateElement: selectedElement does not have an id.");
    }
  };

  // 主要プロパティのinputのonChangeハンドラー
  const updateMainProperty = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedContent = e.target.value;

    if (!selectedElement) {
      console.error("updateMainProperty: No selected element to update");
      return;
    }

    // selectedElementにidがなければ新しいidを生成
    const elementId = selectedElement.id || uuidv4();

    // selectedElementにidを追加する例
    const newSelectedElement = {
      ...selectedElement,
      id: elementId,
      content: updatedContent,
    };

    // components 配列も新しい selectedElement で更新する
    let updatedComponents = components.map((component) =>
      component.id === elementId
        ? { ...component, content: updatedContent }
        : component
    );

    if (updatedComponents.length === 0) {
      updatedComponents = [newSelectedElement]; // 新しい要素を配列に追加
    }

    // 更新されたselectedElementとcomponents配列をstateに設定する
    setSelectedElement(newSelectedElement);
    setComponents(updatedComponents);

    const updatedHtml = generateHtmlFromComponents(updatedComponents);
    setHtml(updatedHtml); // ビジュアルモードのHTMLを更新

    // localizedHtmls と html ステートを更新する
    const updatedLocalizedHtmls = localizedHtmls.map((localizedHtml) => {
      if (localizedHtml.language === selectedLanguage) {
        return {
          ...localizedHtml,
          content: generateHtmlFromComponents(updatedComponents),
        };
      }
      return localizedHtml;
    });

    setLocalizedHtmls(updatedLocalizedHtmls);
    setSaving(true); // 保存を開始

    // 以前のタイマーをクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 2秒後にデータベースに保存
    timerRef.current = window.setTimeout(() => {
      sendUpdateToServer(updatedHtml)
        .then(() => {
          setSaving(false); // 保存を終了
          setSaved(true); // 保存完了状態を設定
        })
        .catch((error) => {
          console.error("Failed to send update to server:", error);
        });
    }, 2000);
  };

  /*
  |--------------------------------------------------------------------------
  |コードモード
  --------------------------------------------------------------------------
  */
  // ローカライズされたHTMLをcodeステートに設定
  useEffect(() => {
    if (mode === "code") {
      // 選択された言語のHTMLコンテンツをcodeステートに設定
      const currentLocalizedHtml = localizedHtmls.find(
        (html) => html.language === selectedLanguage
      );
      if (currentLocalizedHtml) {
        setCode(currentLocalizedHtml.content);
      } else {
        setCode(""); // 選択された言語のHTMLコンテンツがない場合は空にする
      }
    }
  }, [mode, selectedLanguage, localizedHtmls]);

  // コードモードで入力データを更新する
  const handleCodeInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing) {
      const target = e.target as HTMLElement;
      const newHtml = target.textContent || "";

      // 選択された言語のHTMLを更新
      const localizedHtml = website.localizedHtml.find(
        (html) => html.language === selectedLanguage
      );
      if (localizedHtml) {
        localizedHtml.content = newHtml;
      }

      // 新しいHTMLコンテンツを設定
      setHtml(newHtml);
      setSaving(true); // 保存を開始

      // 以前のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 3秒後にコードステートを更新
      timerRef.current = window.setTimeout(() => {
        setCode(newHtml); // DOMの更新をトリガー
        setSaving(false); // 保存を終了
      }, 2000);

      // 行番号を更新
      setLineNumbers(
        newHtml.split("\n").map((_, index) => (index + 1).toString())
      );
    }
  };

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

  // 変更されるたびにハイライトを適用
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block as HTMLElement);
    });
  }, [code]);

  // codeステートが更新された場合にハイライトを適用
  useEffect(() => {
    if (mode === "code") {
      // 次のフレームでハイライト処理を実行する
      requestAnimationFrame(() => {
        document.querySelectorAll("pre code").forEach((block) => {
          // ハイライトが既に適用されている場合はリセットする
          block.removeAttribute("data-highlighted");
          hljs.highlightBlock(block as HTMLElement);
        });
      });
    }
  }, [code, mode]);

  // 選択された言語のHTMLをサーバーに送信
  useEffect(() => {
    if (selectedHtml && selectedLanguage) {
      sendUpdateToServer(selectedHtml);
    }
  }, [selectedHtml, selectedLanguage, sendUpdateToServer]);

  /*
  |--------------------------------------------------------------------------
  |HTML
  --------------------------------------------------------------------------
  */
  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="editor flex w-full h-full mt-[50px]"
        onClick={() => setSelectedElement(null)} // canvas-content以外要素クリックでクイック編集閉
      >
        <div className="canvas relative w-full flex flex-col items-center min-h-[500px] pt-8">
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              <div className="flex items-center">
                {/* 言語切り替えトグル */}
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => handleLanguageChange(language)}
                    className={
                      selectedLanguage === language
                        ? "border border-primary text-primary mr-2 px-4 py-1 rounded-full"
                        : "mr-2 px-4 py-1 rounded-full"
                    }
                  >
                    {language}
                  </button>
                ))}

                {/* 保存状態 */}
                {saving && (
                  <div className="ml-4 text-xs">保存しています...</div>
                )}
                {saved && <div className="ml-4 text-xs">保存しました</div>}
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
                  className="canvas-content w-full min-w-[870px] max-w-[870px] min-h-[400px] shadow-lg rounded"
                  style={{ backgroundColor: "white" }}
                  dangerouslySetInnerHTML={{ __html: html }}
                  onClick={(e) => {
                    e.stopPropagation(); // canvas-content以外要素クリックでクイック編集閉
                    openQuickEdit(e);
                  }}
                  onMouseOver={handleHover}
                />
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
                  <pre className="w-full">
                    <code
                      contentEditable
                      className="html outline-none w-full h-full"
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
                      onInput={handleCodeInput}
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

            {/* クイック編集 */}
            <div
              className={`properties-panel fixed top-[50px] right-0 w-[288px] h-screen overflow-auto transition-all duration-400 ease-in-out transform ${
                selectedElement
                  ? "translate-x-0 opacity-100 visible"
                  : "translate-x-full opacity-0 invisible"
              }`}
              onClick={(e) => e.stopPropagation()} // クイック編集以外の要素クリックでクイック編集閉
            >
              <div className="bg-white shadow-lg p-4 h-full">
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <h2 className="text-[16px]">クイック編集</h2>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-gray-500"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* 主要プロパティ */}
                <h3 className="font-bold text-[16px] mb-2">
                  {selectedElement?.type}
                </h3>
                <input
                  className="w-full p-2 border border-primary rounded mb-4"
                  value={selectedElement?.content || ""}
                  onChange={updateMainProperty}
                />

                {/* その他プロパティ */}
                {Object.entries(selectedElement?.props || {}).map(
                  ([key, value]) => {
                    if (key === "class") return null; // classとdiv属性は編集から除外
                    return (
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
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
