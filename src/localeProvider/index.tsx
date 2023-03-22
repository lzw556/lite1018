import React, { createContext, useState, useContext, useEffect } from 'react';

export const LANGUAGES = {
  english: 'en-US' as 'en-US',
  chinese: 'zh-CN' as 'zh-CN'
};

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

type LocalProviderProps = {
  language: Language;
  setLocale: React.Dispatch<React.SetStateAction<LocalProviderProps>>;
  translations: any;
};

const LocaleContext = createContext<LocalProviderProps>({} as LocalProviderProps);

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export const LocaleProvider = ({ children }: { children?: React.ReactNode }) => {
  const locale = useLocaleProvider();
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
};

function useLocaleProvider() {
  const uaLang = window.navigator.language;
  const localLang = localStorage.getItem('lang');
  const initialLang =
    (localLang || uaLang) !== LANGUAGES.chinese ? LANGUAGES.english : LANGUAGES.chinese;
  const [locale, setLocale] = useState<LocalProviderProps>({
    language: initialLang
  } as LocalProviderProps);
  useEffect(() => {
    localStorage.setItem('lang', locale.language);
  }, [locale.language]);

  return { ...locale, setLocale, translations: {} };
}
