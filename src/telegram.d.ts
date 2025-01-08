interface TelegramWebApp {
  MainButton: {
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  isExpanded?: boolean;
  initData: string;
  initDataUnsafe?: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: string;
    hash?: string;
  };
  platform?: string;
  version?: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
