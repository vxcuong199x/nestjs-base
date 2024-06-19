const isI18nKey = 'isI18n.';

export const i18nEncode = (message: string): string => `${isI18nKey}${message}`;

export const i18nDecode = (message: string): string =>
  message.replace(isI18nKey, '');

export const isI18nMessage = (message: string): boolean =>
  new RegExp(`^${isI18nKey}[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$`).test(message);
