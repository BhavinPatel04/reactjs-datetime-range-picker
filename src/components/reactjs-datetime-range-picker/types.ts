import { type ElementType } from "react";
import { type DatetimeRangeType } from "./enum";

export type DATETIME_RANGE_TYPE = keyof typeof DatetimeRangeType;

export type TZ_MAP_KEYS = "MST" | "PST" | "CET";

export type TZ_MAP = {
  [K in TZ_MAP_KEYS]: string;
};

export type CALENDAR_SIDES = "left" | "right";

export type TIME_ITEM = "hour" | "minute" | "meridian";

export interface SELECT_AS {
  tag: ElementType;
  optionTag: ElementType;
  selectedAttributeName: string;
  selectedAttributeValueType: "string" | "array" | "number";
}
