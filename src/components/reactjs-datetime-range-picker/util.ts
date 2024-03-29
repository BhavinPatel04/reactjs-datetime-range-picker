import { type SELECT_AS } from "./types";

export const getNotAvailableText = (): string => {
  return "N/A";
};

/**
 *
 * @param value the value to be cloned
 * @note will not work for objects containing functions
 */
export const cloneDeep = (
  value: Record<string, any> | string | number,
): Record<string, any> | string | number => {
  if (value) {
    return JSON.parse(JSON.stringify(value));
  }
  return {};
};

export const isEmpty = (value: Record<any, any>): boolean => {
  if (value) {
    return Object.keys(value).length <= 0;
  }
  return false;
};

export const mergeDeep = (...objects: Array<Record<string, any>>): Record<string, any> => {
  const isObject = (obj: Record<string, any>): boolean => obj && typeof obj === "object";

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
};

export const isNil = (value: unknown): boolean => {
  return value == null || value === undefined;
};

export const getSelectDefaultValue = (
  value: string | number,
  selectedAttributeValueType: SELECT_AS["selectedAttributeValueType"],
): string | number | string[] => {
  if (selectedAttributeValueType === "array") {
    return [`${value}`];
  }
  if (selectedAttributeValueType === "string") {
    return `${value}`;
  }
  if (selectedAttributeValueType === "number") {
    return Number(value);
  }
  return value;
};
