/*
|--------------------------------------------------------------------------
| LPの型定義
|--------------------------------------------------------------------------
*/
export type Website = {
  id: number;
  title: string;
  localizedHtml: LocalizedHtml[];
};

export type LocalizedHtml = {
  id: number;
  language: Language;
  content: string;
};

export enum Language {
  JP = "JP",
  EN = "EN",
  TW = "TW",
  CN = "CN",
}
