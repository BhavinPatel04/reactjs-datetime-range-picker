import moment, {
  unitOfTime,
  type DurationInputArg1,
  type DurationInputArg2,
  type Moment,
} from "moment";
import { TZ_MAP_KEYS, type SELECT_AS, CALENDAR_SIDES, DATETIME_RANGE_TYPE } from "./types";
import {
  type Options,
  type Settings,
  type State,
  type RowItemVariables,
  type RowOptions,
  type RowItemOptions,
  type DateSide,
  type ActiveItemSide,
  type DateCharacteristics,
  type DateRangeModel,
  type Config,
  type TimeSide,
  type DateRow,
  type RowVariables,
  type DateTimeRangeModelChangeOutput,
  type CalendarType,
  type CalendarSides,
  type DateTimeRangeChangeOutput,
  CalendarTypes,
} from "./interfaces";
import { NgxDatetimeRangePickerConstants as Constants, DEFAULT_DATE_FORMAT } from "./constants";
import { DatetimeRangeType } from "./enum";

const DEFAULT_TIME_FORMAT = Constants.DEFAULT.TIME_FORMAT;
const USA_TZ_CODE: TZ_MAP_KEYS = Constants.CONSTANT.USA_TZ_CODE;
const MONTHS_AVAILABLE = Constants.CONSTANT.MONTHS_AVAILABLE;
const TZ_NAMES = Constants.CONSTANT.TZ_NAMES;
const DEFAULT_RANGES = Constants.DEFAULT.RANGES;
const MOMENT_CONVERSION_MAP = Constants.CONSTANT.MOMENT_CONVERSION_MAP;

export const getDefaultOptions = (): Options => {
  return cloneDeep(Constants.DEFAULT.OPTIONS) as Options;
};

export const getDefaultSettings = (): Settings => {
  return cloneDeep(Constants.DEFAULT.SETTINGS) as Settings;
};

export const getDefaultState = (): State => {
  return cloneDeep(Constants.DEFAULT.STATE) as State;
};

export const checkSettingsValidity = (settings: Settings): void => {
  if (settings.type && !CalendarTypes.includes(settings.type as CalendarType)) {
    const errMsg = `${settings.type} is an invalid calendar type. It should one of ${[...CalendarTypes].join(",")}`;
    throw new Error(errMsg);
  }
};

export const formatDateToDefaultFormat = (
  date: string | number,
  format: string,
): string | undefined => {
  let formattedDate = null;
  if (!date) {
    return;
  }

  if (!isNaN(Number(date))) {
    formattedDate = moment(date).format(DEFAULT_DATE_FORMAT);
  } else {
    formattedDate = moment(date, format).format(DEFAULT_DATE_FORMAT);
  }

  return formattedDate;
};

export const formatTimeToDefaultFormat = (time: string, tz: TZ_MAP_KEYS): string | null => {
  let formattedTime = null;
  if (!time) {
    return null;
  }

  if (time.includes(":")) {
    if (time.includes("AM") || time.includes("PM")) {
      formattedTime = moment(formatDateToTZ(moment().valueOf(), tz), "h:mm A").format(
        DEFAULT_TIME_FORMAT,
      );
    } else {
      formattedTime = time;
    }
  } else {
    console.warn(
      `WARN_NGX_DATETIME_RANGE_PICKER:
          The provided time is not in correct format.
          Format: HH:mm or hh:mm A
      `,
    );
  }
  return formattedTime;
};

export const getCalendarRowNumberText = (type: string, number: number): string | undefined => {
  return (() => {
    switch (type) {
      case "daily":
        return `W${number}`;
      case "weekly":
        return "";
      case "monthly":
        return `Q${number}`;
      case "quarterly":
        return `${number}`;
      case "yearly":
        return "";
    }
  })();
};

export const createDefaultRanges = (config: Config): Record<string, any> => {
  const ranges: Record<
    string,
    {
      startDate: string | null;
      endDate: string | null;
    }
  > = {};
  const type: DATETIME_RANGE_TYPE = config.type;
  const maxDate: string = cloneDeep(config.maxDate!) as string;

  DEFAULT_RANGES[type].forEach((rangeInfo: { label: string; count: number }) => {
    ranges[rangeInfo.label] = {
      startDate: moment(maxDate, DEFAULT_DATE_FORMAT)
        .subtract(
          rangeInfo.count as DurationInputArg1,
          MOMENT_CONVERSION_MAP[type] as DurationInputArg2,
        )
        .format(DEFAULT_DATE_FORMAT),
      endDate: maxDate,
    };
  });

  ranges["Custom Range"] = { startDate: null, endDate: null };
  return ranges;
};

export const getSanitizedDateArray = (config: Config): string[] => {
  const sanitizedDateArray: string[] = [];
  const type: DATETIME_RANGE_TYPE = config.type;
  const dateArray = config.dateArray!;
  const inputDateFormat = config.inputDateFormat;

  // dateArray can have nulls
  dateArray.forEach((date) => {
    if (!date) {
      return;
    }

    let format: string = "";

    if (isNaN(Number(date))) {
      if (inputDateFormat) {
        format = inputDateFormat;
      } else {
        format = (moment(date) as any)._f; // moment does not support this
      }
    }

    if (inputDateFormat !== (moment(date) as any)._f) {
      console.warn(
        `ERR_NGX_DATETIME_RANGE_PICKER:
            inputDateFormat !== dateFormat in dateArray.
            Converted dates might not be as expected
          `,
      );
    }

    const value: Moment = format ? moment(date, format) : moment(date);

    if (value) {
      const formattedDate = value
        .endOf(MOMENT_CONVERSION_MAP[type] as moment.unitOfTime.StartOf)
        .format(DEFAULT_DATE_FORMAT);
      sanitizedDateArray.push(formattedDate);
    } else {
      console.warn(
        `ERR_NGX_DATETIME_RANGE_PICKER:
            dateArray values are in unknown format.
            Pass the format or pass the dates in known format
          `,
      );
    }
  });

  return [...new Set(sanitizedDateArray)];
};

export const getNumberOfWeeks = (date: string): number | undefined => {
  if (!date) {
    return;
  }

  const monthStart: number = moment(date, DEFAULT_DATE_FORMAT).startOf("month").day();
  const monthEnd: number = Number(moment(date, DEFAULT_DATE_FORMAT).endOf("month").format("D"));
  return Math.ceil((monthStart + monthEnd) / 7);
};

export const getYearlyWeekCount = (year: string): number | undefined => {
  if (!year) {
    return;
  }

  const yearStartDate: string = moment(year, "YYYY").startOf("year").format(DEFAULT_DATE_FORMAT);
  const yearEndDate: string = moment(year, "YYYY").endOf("year").format(DEFAULT_DATE_FORMAT);
  const yearEndWeekEndDate: string = moment(yearEndDate, DEFAULT_DATE_FORMAT)
    .startOf("week")
    .format(DEFAULT_DATE_FORMAT);
  const yearStartWeekEndDate: string = moment(yearStartDate, DEFAULT_DATE_FORMAT)
    .endOf("week")
    .format(DEFAULT_DATE_FORMAT);

  const yearStartWeekNumber: number = getWeekNumber(yearStartWeekEndDate) as number;
  const yearEndWeekNumber: number = getWeekNumber(yearEndWeekEndDate) as number;

  return yearEndWeekNumber - yearStartWeekNumber + 1;
};

export const getMonthsAvailable = (
  minDate: string,
  maxDate: string,
  selectedYear: number,
): string[] => {
  const months: string[] = [];

  if (!minDate || !maxDate || !selectedYear) {
    return [];
  }

  const _minDate = moment(minDate, DEFAULT_DATE_FORMAT).startOf("month");
  const _maxDate = moment(maxDate, DEFAULT_DATE_FORMAT).startOf("month");

  let minDatems: number = moment(_minDate, DEFAULT_DATE_FORMAT).valueOf();
  let maxDatems: number = moment(_maxDate, DEFAULT_DATE_FORMAT).valueOf();
  const yearStartms: number = moment().year(selectedYear).startOf("year").valueOf();
  const yearEndms: number = moment().year(selectedYear).endOf("year").valueOf();

  if (minDatems < yearStartms) {
    minDatems = yearStartms;
  }
  if (maxDatems > yearEndms) {
    maxDatems = yearEndms;
  }

  let minDateMonthNumber: number = moment(minDatems).month();
  const diff: number = moment(maxDatems).diff(moment(minDatems), "months");
  const maxMonths: number = diff < MONTHS_AVAILABLE.length ? diff : MONTHS_AVAILABLE.length;

  for (let i = 0; i <= maxMonths; i++) {
    if (minDateMonthNumber >= MONTHS_AVAILABLE.length) {
      months.push(MONTHS_AVAILABLE[minDateMonthNumber - MONTHS_AVAILABLE.length]);
    } else {
      months.push(MONTHS_AVAILABLE[minDateMonthNumber]);
    }
    minDateMonthNumber++;
  }

  return months;
};

export const getYearsAvailable = (config: Config): string[] => {
  const minDate: string | number = config ? config.minDate! : "";
  const maxDate: string | number = config ? config.maxDate! : "";
  const years: string[] = [];

  if (minDate && maxDate) {
    const minYear: number = Number(getSelectedYear(minDate));
    const maxYear: number = Number(getSelectedYear(maxDate));
    const diff = maxYear - minYear;

    for (let i = 0; i <= diff; i++) {
      years.push(`${minYear + i}`);
    }
  }
  return years.reverse();
};

export const isDateAvailable = (
  date: number,
  minDate: number,
  maxDate: number,
  startDate: number,
  endDate: number,
  monthStartDate: number,
  monthEndDate: number,
  config: Config,
): boolean => {
  let available = false;
  const type: string = config.type;
  const disableWeekends: boolean = config.disableWeekends!;
  const disableWeekdays: boolean = config.disableWeekdays!;

  if (type === "daily") {
    minDate = minDate > monthStartDate ? minDate : monthStartDate;
    maxDate = maxDate < monthEndDate ? maxDate : monthEndDate;
  }

  if (date >= minDate && date <= maxDate) {
    available = true;

    if (available) {
      if (disableWeekends) {
        available = !isWeekend(date);
      }
      if (disableWeekdays) {
        available = !isWeekday(date);
      }
      if (config.dateArray?.length) {
        available = isInDateArray(date, config.dateArray, DEFAULT_DATE_FORMAT);
      }
    }
  }
  return available;
};

export const isDateInRange = (
  date: number,
  minDate: number,
  maxDate: number,
  startDate: number,
  endDate: number,
  monthStartDate: number,
  monthEndDate: number,
  available: boolean,
  config: Config,
): boolean => {
  let inRange = false;
  const type: string = config.type;
  const singleDatePicker: boolean = config.singleDatePicker!;

  if (!singleDatePicker) {
    if (type === "daily") {
      minDate = monthStartDate;
      maxDate = monthEndDate;
    }
    if (date >= startDate && date <= endDate && date >= minDate && date <= maxDate) {
      if (available) {
        inRange = true;
      }
    }
  }
  return inRange;
};

export const isDateActive = (
  date: number,
  startDate: number,
  endDate: number,
  side: string,
): boolean => {
  return (date === startDate && side === "left") || (date === endDate && side === "right");
};

export const isDateToday = (dateMs: number, config: Config): boolean => {
  const todayDate: string = moment().format(DEFAULT_DATE_FORMAT);
  const type: string = config.type;
  const { firstDay, lastDay } = getFirstLastDay(todayDate, type);
  const firstDayMs: number = moment(firstDay, DEFAULT_DATE_FORMAT).valueOf();
  const lastDayMs: number = moment(lastDay, DEFAULT_DATE_FORMAT).valueOf();
  return dateMs >= firstDayMs && dateMs <= lastDayMs;
};

export const isWeekday = (date: number, format?: string): boolean => {
  return !isWeekend(date, format);
};

export const isWeekend = (date: number, format?: string): boolean => {
  if (!format) {
    format = "";
  }
  const day = moment(date, format).day();
  return day === 0 || day === 6;
};

export const isInDateArray = (date: number, dateArray: any[], format?: string): boolean => {
  if (!format) {
    format = "";
  }
  return dateArray.find((d) => moment(d, format).valueOf() === date) !== undefined;
};

export const getCalendarRowVariables = (options: RowOptions): RowVariables => {
  const variables: RowVariables = {
    rowNumber: "",
    columns: 0,
  };
  const type: string = options.type;
  const monthStartWeekNumber: number = options.monthStartWeekNumber;
  const dateRows: number = options.dateRows;
  const year = `${options.year}`;

  if (type === "daily") {
    variables.rowNumber = `${monthStartWeekNumber + dateRows}`;
    variables.columns = 6;
  } else if (type === "weekly") {
    variables.rowNumber = ``;
    variables.columns = 6;
  } else if (type === "monthly") {
    variables.rowNumber = `${dateRows + 1}`;
    variables.columns = 2;
  } else if (type === "quarterly") {
    variables.rowNumber = year.charAt(dateRows);
    variables.columns = 0;
  } else if (type === "yearly") {
    variables.rowNumber = "";
    variables.columns = 0;
  }

  return variables;
};

export const getCalendarRowItemVariables = (options: RowItemOptions): RowItemVariables => {
  const { type, monthStartWeekNumber, yearStartDate, year, rowItem, dateRows, columns } = options;

  const itemCount: number = rowItem + dateRows * columns + dateRows;
  let currentItemDate = "";
  let rowItemText = "";

  if (type === "daily") {
    if (!isNil(monthStartWeekNumber) && !isNil(dateRows) && !isNil(year)) {
      const yearStartDateDaily = moment().year(year).startOf("year").format(DEFAULT_DATE_FORMAT);
      currentItemDate = moment(yearStartDateDaily, DEFAULT_DATE_FORMAT)
        .add(monthStartWeekNumber + dateRows - 1, "week")
        .startOf("week")
        .add(rowItem, "day")
        .format(DEFAULT_DATE_FORMAT);
      rowItemText = moment(currentItemDate, DEFAULT_DATE_FORMAT).format("D");
    }
  } else if (type === "weekly") {
    if (!isNil(yearStartDate) && !isNil(itemCount)) {
      currentItemDate = moment(yearStartDate, DEFAULT_DATE_FORMAT)
        .add(itemCount, "week")
        .endOf("week")
        .format(DEFAULT_DATE_FORMAT);
      const weekNumber: any = itemCount + 1;
      rowItemText = `W${weekNumber}`;
    }
  } else if (type === "monthly") {
    if (!isNil(itemCount) && !isNil(year)) {
      currentItemDate = moment()
        .year(year)
        .month(itemCount)
        .endOf("month")
        .format(DEFAULT_DATE_FORMAT);
      rowItemText = moment(currentItemDate, DEFAULT_DATE_FORMAT).format("MMM");
    }
  } else if (type === "quarterly") {
    if (!isNil(itemCount) && !isNil(year)) {
      currentItemDate = moment()
        .year(year)
        .quarter(itemCount + 1)
        .endOf("quarter")
        .format(DEFAULT_DATE_FORMAT);
      rowItemText = `Quarter ${itemCount + 1}`;
    }
  }

  const { firstDay, lastDay } = getFirstLastDay(currentItemDate, type);

  return {
    itemCount,
    currentItemDate,
    rowItemText,
    firstDay,
    lastDay,
  };
};

export const isRowIemValid = (options: RowOptions): boolean => {
  let valid = false;
  const type: string = options.type;
  const year: string = options.year;
  const itemCount: number = options.itemCount!;
  const validWeekCount: number = getYearlyWeekCount(year)!;

  if (type === "daily") {
    valid = true;
  } else if (type === "weekly") {
    if (itemCount < validWeekCount) {
      valid = true;
    }
  } else if (type === "monthly") {
    valid = true;
  } else if (type === "quarterly") {
    valid = true;
  }

  return valid;
};

export const formatStartDate = (config: Config, returnFormat: string): string => {
  const startDate: string | number = config.startDate!;
  const type: DATETIME_RANGE_TYPE = config.type;
  let formattedStartDate: string = "";

  if (startDate) {
    formattedStartDate = moment(startDate, DEFAULT_DATE_FORMAT)
      .startOf(MOMENT_CONVERSION_MAP[type] as moment.unitOfTime.StartOf)
      .format(returnFormat);
  }

  return formattedStartDate;
};

export const getSelectedYear = (date: string | number): number => {
  return Number(moment(date, DEFAULT_DATE_FORMAT).format("YYYY"));
};

export const getFirstLastDay = (
  date: string,
  type: string,
): { firstDay: string; lastDay: string } => {
  let firstDay = "";
  let lastDay = "";

  if (type === "daily") {
    firstDay = lastDay = date;
  } else if (type === "weekly") {
    firstDay = moment(date, DEFAULT_DATE_FORMAT).startOf("week").format(DEFAULT_DATE_FORMAT);
    lastDay = moment(date, DEFAULT_DATE_FORMAT).endOf("week").format(DEFAULT_DATE_FORMAT);
  } else if (type === "monthly") {
    firstDay = moment(date, DEFAULT_DATE_FORMAT).startOf("month").format(DEFAULT_DATE_FORMAT);
    lastDay = moment(date, DEFAULT_DATE_FORMAT).endOf("month").format(DEFAULT_DATE_FORMAT);
  } else if (type === "quarterly") {
    firstDay = moment(date, DEFAULT_DATE_FORMAT).startOf("quarter").format(DEFAULT_DATE_FORMAT);
    lastDay = moment(date, DEFAULT_DATE_FORMAT).endOf("quarter").format(DEFAULT_DATE_FORMAT);
  } else if (type === "yearly") {
    firstDay = moment(date, DEFAULT_DATE_FORMAT).startOf("year").format(DEFAULT_DATE_FORMAT);
    lastDay = moment(date, DEFAULT_DATE_FORMAT).endOf("year").format(DEFAULT_DATE_FORMAT);
  }

  return { firstDay, lastDay };
};

/**
 *  returns in format "MM/DD/YYYY, hh:mm:ss A"
 */
export const formatDateToTZ = (_date: number, tz: TZ_MAP_KEYS): string => {
  return new Date(_date).toLocaleString("en-US", {
    timeZone: TZ_NAMES[tz],
  });
};

export const getZoneDate = (tz: TZ_MAP_KEYS, format: string, date?: string): Moment => {
  let _date: number = moment().valueOf();

  if (date) {
    _date = moment(date, format).startOf("day").valueOf();
  }

  const today = formatDateToTZ(_date, tz);

  return moment(today, "MM/DD/YYYY, hh:mm:ss A");
};

export const getZoneToday = (tz: TZ_MAP_KEYS, viewDateFormat: string): string => {
  const today: Moment = getZoneDate(tz, viewDateFormat);
  return moment(today).format(`${viewDateFormat}  hh:mm A`);
};

export const formatToZoneDate = (tz: TZ_MAP_KEYS, format: string, date: string): string => {
  const formattedDate: Moment = getZoneDate(tz, format, date);
  return moment(formattedDate).format(`${format}`);
};

export const convertToViewTimeItem = (item: string | number): string => {
  let stringified_item = item + "";
  if (stringified_item.length === 1) {
    stringified_item = `0${stringified_item}`;
  }
  return stringified_item;
};

export const getWeekNumber = (date: string): string | number => {
  if (date) {
    const year: number = moment(date, "YYYY-MM-DD").year();
    const month: number = moment(date, "YYYY-MM-DD").month();
    const day: number = Number(moment(date, "YYYY-MM-DD").format("D"));

    const yearStartms: Date = new Date(year, 0, 1);
    const datems: Date = new Date(year, month, day);
    return Math.ceil(
      ((datems.getTime() - yearStartms.getTime()) / 86400000 + yearStartms.getDay() + 1) / 7,
    );
  } else {
    console.warn(`
      WARN_NGX_DATETIME_RANGE_PICKER | getWeekNumber:
      Invalid date
    `);
    return getNotAvailableText();
  }
};

export const iterateOverDateObj = (
  dates: CalendarSides,
  func: (arg: ActiveItemSide) => void,
): void => {
  for (const side in dates) {
    if (side) {
      const sideDates: DateSide = dates[side as CALENDAR_SIDES] as DateSide;
      sideDates.itemRows.forEach((rows) => {
        rows.items.forEach((rowItem) => {
          func(rowItem);
        });
      });
    }
  }
};

export const getCalendarColspan = (type: string): number | undefined => {
  if (type === "daily") {
    return 6;
  } else if (type === "weekly") {
    return 8;
  } else if (type === "monthly") {
    return 3;
  } else if (type === "quarterly") {
    return 1;
  } else if (type === "yearly") {
    return 1;
  }
};

export const getCalendarRowItemColspan = (type: string): number | undefined => {
  if (type === "monthly") {
    return 3;
  } else if (type === "quarterly") {
    return 6;
  } else if (type === "yearly") {
    return 6;
  }
};

export const getDateCharacteristics = (
  config: Config,
  state: State,
  date: string,
  month: string,
  side: string,
): DateCharacteristics => {
  const currentDate: number = moment(date, DEFAULT_DATE_FORMAT).startOf("day").valueOf();

  let _date: string = formatDateToDefaultFormat(config.minDate!, DEFAULT_DATE_FORMAT)!;
  const minDate: number = moment(_date, DEFAULT_DATE_FORMAT).startOf("day").valueOf();

  _date = formatDateToDefaultFormat(config.maxDate!, DEFAULT_DATE_FORMAT)!;
  const maxDate: number = moment(_date, DEFAULT_DATE_FORMAT).startOf("day").valueOf();

  _date = formatDateToDefaultFormat(config.startDate!, DEFAULT_DATE_FORMAT)!;
  const startDate: number = moment(_date, DEFAULT_DATE_FORMAT).startOf("day").valueOf();

  _date = formatDateToDefaultFormat(config.endDate!, DEFAULT_DATE_FORMAT)!;
  const endDate: number = moment(_date, DEFAULT_DATE_FORMAT).startOf("day").valueOf();

  const currentMonthStartDate: number = moment(month, "MMM YYYY")
    .startOf("month")
    .startOf("day")
    .valueOf();
  const currentMonthEndDate: number = moment(month, "MMM YYYY")
    .endOf("month")
    .startOf("day")
    .valueOf();

  const available: boolean = isDateAvailable(
    currentDate,
    minDate,
    maxDate,
    startDate,
    endDate,
    currentMonthStartDate,
    currentMonthEndDate,
    config,
  );
  const inRange: boolean = isDateInRange(
    currentDate,
    minDate,
    maxDate,
    startDate,
    endDate,
    currentMonthStartDate,
    currentMonthEndDate,
    available,
    config,
  );
  const active: boolean = isDateActive(currentDate, startDate, endDate, side);
  const today: boolean = isDateToday(currentDate, config);

  // Active
  if (currentDate === startDate && side === "left") {
    state.activeStartDate = date;
  } else if (currentDate === endDate && side === "right") {
    state.activeEndDate = date;
  }

  return { available, inRange, active, today };
};

export const getLabelProps = (
  state: State,
  calendarType: string,
  side: CALENDAR_SIDES,
): { label: string; labelFormat: string; type: string } => {
  let label: string, labelFormat: string, type: string;

  if (calendarType === "daily") {
    label = `${state.selectedMonth[side] as string} ${state.selectedYear[side] as string}`;
    labelFormat = "MMM YYYY";
    type = "month";
  } else {
    label = `${state.selectedYear[side] as string}`;
    labelFormat = "YYYY";
    type = "year";
  }

  return { label, labelFormat, type };
};

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
      } else if (oVal) {
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

export const getCombinedConfig = (
  __options: Options,
  __settings: Settings,
  _config: Config,
): Config => {
  let _options: Options = cloneDeep(__options) as Options;
  let _settings: Settings = cloneDeep(__settings) as Settings;
  if (_options !== undefined) {
    Object.keys(_options).forEach((k) => {
      if (!isNil(_options[k as keyof Options])) {
        _options = {
          ..._options,
          [k]: _options[k as keyof Options],
        };
      } else {
        console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
          'options.${k}' is undefined or null. Setting default value.
        `);
      }
    });
  }
  if (_settings !== undefined) {
    Object.keys(_settings).forEach((k) => {
      if (!isNil(_settings[k as keyof Settings])) {
        _settings = {
          ..._settings,
          [k]: _settings[k as keyof Settings],
        };
      } else {
        console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
          'settings.${k}' is undefined or null. Setting default value.
        `);
      }
    });
  }
  return { ..._options, ..._settings, ..._config };
};

export const parseOptions = (
  _state: State,
  _config: Config,
  _dateRangeModel: DateRangeModel,
): {
  config: Config;
  state: State;
  dateRangeModel: DateRangeModel;
} => {
  // check if inputDateFormat is provided
  if (!_config.inputDateFormat) {
    console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
      'inputDateFormat' is required to convert dates.
      'inputDateFormat' not provided. Setting it to YYYY-MM-DD.
    `);
    _config.inputDateFormat = DEFAULT_DATE_FORMAT;
  }

  if (_config.type === "weekly" || _config.type === "yearly") {
    _config.showRowNumber = false;
  }
  if (_config.singleDatePicker && _config.endDate) {
    _config.startDate = cloneDeep(_config.endDate) as string;
  }

  const timeZoneInfo = selectTimeZone(_state, _config);
  _state = timeZoneInfo.state;
  const timeZoneInfoConfig = timeZoneInfo.config;
  _state = populateDateAndTime(_state, timeZoneInfoConfig);
  // if (side === "left") {
  //   _config.startTime = `${_state.selectedHour[side]}:${_state.selectedMinute[side]}`;
  // } else if (side === "right") {
  //   _config.endTime = `${_state.selectedHour[side]}:${_state.selectedMinute[side]}`;
  // }
  timeZoneInfoConfig.startTime = `${(_state.selectedHour.left as string) || ""}:${
    (_state.selectedMinute.left as string) || ""
  }`;
  timeZoneInfoConfig.endTime = `${(_state.selectedHour.right as string) || ""}:${
    (_state.selectedMinute.right as string) || ""
  }`;
  const parsedOptionsConfig = parseOptionsToDefaultDateFormat(timeZoneInfoConfig);

  const processedDateRangeModel = processDateRangeModel(parsedOptionsConfig, _dateRangeModel);
  const dateRangeModelConfig = processedDateRangeModel?.config ?? parsedOptionsConfig;
  _dateRangeModel = processedDateRangeModel?.dateRangeModel ?? _dateRangeModel;

  const sanitizedDatesConfig = sanitizeDates(dateRangeModelConfig);

  _state = processRanges(sanitizedDatesConfig, _state);
  _dateRangeModel = getDateRangeModel(
    _config,
    _state,
    _dateRangeModel,
    sanitizedDatesConfig.inputDateFormat,
  );
  _state = updateCalendar(_state, sanitizedDatesConfig);

  sanitizedDatesConfig.startTime = `${(_state.selectedHour.left as string) || ""}:${
    (_state.selectedMinute.left as string) || ""
  }`;
  sanitizedDatesConfig.endTime = `${(_state.selectedHour.right as string) || ""}:${
    (_state.selectedMinute.right as string) || ""
  }`;
  return {
    config: sanitizedDatesConfig,
    state: _state,
    dateRangeModel: _dateRangeModel,
  };
};

export const selectTimeZone = (
  _state: State,
  _config: Config,
): {
  config: Config;
  state: State;
} => {
  if (_config.timezoneSupport) {
    if (!_config.defaultTimezone) {
      _config.defaultTimezone = USA_TZ_CODE;
    }
    _state.selectedTimezone = _config.defaultTimezone;
  }

  if (_config.useLocalTimezone) {
    _state.selectedTimezone = _state.localTimezone;
  }
  _state.todayTime = getZoneToday(_state.selectedTimezone, _config.viewDateFormat ?? "");
  return {
    config: _config,
    state: _state,
  };
};

export const populateDateAndTime = (_state: State, _config: Config): State => {
  _state.sides.forEach((side: CALENDAR_SIDES) => {
    let date = _config.startDate;
    let time = _config.startTime;
    if (side === "right") {
      date = _config.endDate;
      time = _config.endTime;
    }
    const generatedCalendarState = generateCalendar(_state, _config, date ?? "", side);
    _state = generatedCalendarState;
    if (_config.timePicker) {
      const generatedTimePicker = generateTimePicker(_state, _config, time ?? "", side);
      _state = generatedTimePicker.state;
      _state.times[side] = generatedTimePicker.timeObject;
    }
  });
  return _state;
};

export const sanitizeDates = (__config: Config): Config => {
  const _config: Config = cloneDeep(__config) as Config;
  const subtractWeekCount = 0;
  const setDate = (type: string): void => {
    _config.minDate = moment(_config.minDate, DEFAULT_DATE_FORMAT)
      .endOf(type as unitOfTime.StartOf)
      .format(DEFAULT_DATE_FORMAT);
    _config.maxDate =
      type === "week"
        ? moment(_config.maxDate, DEFAULT_DATE_FORMAT)
            .subtract(subtractWeekCount, "week")
            .endOf(type as unitOfTime.StartOf)
            .format(DEFAULT_DATE_FORMAT)
        : moment(_config.maxDate, DEFAULT_DATE_FORMAT)
            .endOf(type as unitOfTime.StartOf)
            .format(DEFAULT_DATE_FORMAT);
    _config.startDate = moment(_config.startDate, DEFAULT_DATE_FORMAT)
      .endOf(type as unitOfTime.StartOf)
      .format(DEFAULT_DATE_FORMAT);
    _config.endDate =
      type === "week"
        ? moment(_config.endDate, DEFAULT_DATE_FORMAT)
            .subtract(subtractWeekCount, "week")
            .endOf(type)
            .format(DEFAULT_DATE_FORMAT)
        : moment(_config.endDate, DEFAULT_DATE_FORMAT)
            .endOf(type as unitOfTime.StartOf)
            .format(DEFAULT_DATE_FORMAT);
  };

  if (_config.type === DatetimeRangeType.weekly) {
    setDate.bind(this)("week");
  } else if (_config.type === DatetimeRangeType.monthly) {
    setDate.bind(this)("month");
  } else if (_config.type === DatetimeRangeType.quarterly) {
    setDate.bind(this)("quarter");
  } else if (_config.type === DatetimeRangeType.yearly) {
    setDate.bind(this)("year");
  }

  if (
    moment(_config.startDate, DEFAULT_DATE_FORMAT).valueOf() <
    moment(_config.minDate, DEFAULT_DATE_FORMAT).valueOf()
  ) {
    _config.minDate = _config.startDate;
  }

  if (
    moment(_config.endDate, DEFAULT_DATE_FORMAT).valueOf() >
    moment(_config.maxDate, DEFAULT_DATE_FORMAT).valueOf()
  ) {
    _config.maxDate = _config.endDate;
  }
  return _config;
};

export const processDateRangeModel = (
  __config: Config,
  _dateRangeModel: DateRangeModel,
):
  | {
      config: Config;
      dateRangeModel: DateRangeModel;
    }
  | undefined => {
  if (undefined === _dateRangeModel || isEmpty(_dateRangeModel)) {
    return;
  }

  if (__config.type && !_dateRangeModel[__config.type]) {
    const _optionsKeys: string[] = Object.keys(getDefaultOptions());
    let _model: Options = {} as Options;
    Object.keys(_dateRangeModel).forEach((key: string) => {
      if (_optionsKeys.includes(key)) {
        _model = {
          ..._model,
          [key]: _dateRangeModel[key as keyof DateRangeModel],
        };
        delete _dateRangeModel[key as keyof DateRangeModel];
      }
    });
    _dateRangeModel[__config.type] = _model;
    if (!_dateRangeModel[__config.type]) {
      return;
    }
  }

  __config.dateArray =
    (__config.type && _dateRangeModel[__config.type]?.dateArray) ?? __config.dateArray;

  const _config: Config = handleDateArray(__config);

  const configType: CalendarType | undefined = _config.type;
  if (_config.dateArray?.length && configType && _dateRangeModel[configType]) {
    if (!_dateRangeModel[configType]?.minDate) {
      _dateRangeModel[configType]!.minDate = _config.dateArray[0] || _config.minDate;
    }
    if (!_dateRangeModel[configType]?.maxDate) {
      _dateRangeModel[configType]!.maxDate =
        _config.dateArray[_config.dateArray.length - 1] || _config.maxDate;
    }
    if (!_dateRangeModel[configType]?.startDate) {
      _dateRangeModel[configType]!.startDate = _config.dateArray[0] || _config.startDate;
    }
    if (!_dateRangeModel[configType]?.endDate) {
      _dateRangeModel[configType]!.endDate =
        _config.dateArray[_config.dateArray.length - 1] || _config.endDate;
    }
  }

  const dateRangeMinDate: string = (
    _config.type ? _dateRangeModel[_config.type]?.minDate ?? _config.minDate ?? "" : ""
  ) as string;
  const dateRangeMaxDate: string = (
    _config.type ? _dateRangeModel[_config.type]?.maxDate ?? _config.maxDate ?? "" : ""
  ) as string;
  const dateRangeStartDate: string = (
    _config.type ? _dateRangeModel[_config.type]?.startDate ?? _config.startDate ?? "" : ""
  ) as string;
  const dateRangeEndDate: string = (
    _config.type ? _dateRangeModel[_config.type]?.endDate ?? _config.endDate ?? "" : ""
  ) as string;

  _config.minDate = formatDateToDefaultFormat(dateRangeMinDate, _config.inputDateFormat ?? "");
  _config.maxDate = formatDateToDefaultFormat(dateRangeMaxDate, _config.inputDateFormat ?? "");
  _config.startDate = formatDateToDefaultFormat(dateRangeStartDate, _config.inputDateFormat ?? "");
  _config.endDate = formatDateToDefaultFormat(dateRangeEndDate, _config.inputDateFormat ?? "");

  if (_config.timePicker) {
    const dateRangeMinTime: string = _config.type
      ? _dateRangeModel[_config.type]?.minTime ?? _config.minTime ?? ""
      : "";
    const dateRangeMaxTime: string = _config.type
      ? _dateRangeModel[_config.type]?.maxTime ?? _config.maxTime ?? ""
      : "";
    const dateRangeStartTime: string = _config.type
      ? _dateRangeModel[_config.type]?.startTime ?? _config.startTime ?? ""
      : "";
    const dateRangeEndTime: string = _config.type
      ? _dateRangeModel[_config.type]?.endTime ?? _config.endTime ?? ""
      : "";

    _config.minTime =
      formatTimeToDefaultFormat(dateRangeMinTime, _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.maxTime =
      formatTimeToDefaultFormat(dateRangeMaxTime, _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.startTime =
      formatTimeToDefaultFormat(dateRangeStartTime, _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.endTime =
      formatTimeToDefaultFormat(dateRangeEndTime, _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
  }
  return {
    config: _config,
    dateRangeModel: _dateRangeModel,
  };
};

export const handleDateArray = (_config: Config): Config => {
  if (_config.dateArray?.length) {
    // converts all the dates to DEFAULT_DATE_FORMAT
    _config.dateArray = getSanitizedDateArray(_config);

    // sort in asc order
    _config.dateArray = _config.dateArray.sort((date1, date2) => {
      const value1: number = moment(date1 as string, DEFAULT_DATE_FORMAT).valueOf();
      const value2: number = moment(date2 as string, DEFAULT_DATE_FORMAT).valueOf();
      return value1 - value2;
    });
  }
  return _config;
};

export const processRanges = (_config: Config, __state: State): State => {
  let _state: State = cloneDeep(__state) as State;
  if (_config.showRanges && !_config.singleDatePicker) {
    _config.availableRanges = createDefaultRanges(_config);
    _state = selectActiveRange(_state, _config);
  } else {
    _state.activeRange = "Custom Range";
    _state = updateRange(_config, _state, _state.activeRange, null);
    _state = updateActiveItem(_config, _state);
  }
  return _state;
};

export const updateRange = (
  _config: Config,
  _state: State,
  rangeLabel: string,
  options: Options | null,
): State => {
  _state.activeRange = rangeLabel;
  if (rangeLabel === "Custom Range") {
    _state.customRange = true;
  } else {
    _state.customRange = false;
    if (options) {
      _config.startDate = options.startDate;
      _config.endDate = options.endDate;
    }
    if (_config.timePicker) {
      _state.times = {};
    }
  }
  return _state;
};

export const updateActiveItem = (_config: Config, _state: State): State => {
  const startDate: ActiveItemSide = getFirstLastDay(_config.startDate as string, _config.type);
  const endDate: ActiveItemSide = getFirstLastDay(_config.endDate as string, _config.type);

  if (_config.type === DatetimeRangeType.weekly) {
    startDate.rowItemText = `W${getWeekNumber(startDate.firstDay!)}`;
    endDate.rowItemText = `W${getWeekNumber(endDate.firstDay!)}`;
  } else if (_config.type === DatetimeRangeType.monthly) {
    startDate.rowItemText = `${moment(startDate.firstDay, DEFAULT_DATE_FORMAT).format("MMM")}`;
    endDate.rowItemText = `${moment(endDate.firstDay, DEFAULT_DATE_FORMAT).format("MMM")}`;
  } else if (_config.type === DatetimeRangeType.quarterly) {
    startDate.rowItemText = `Quarter ${moment(startDate.firstDay, DEFAULT_DATE_FORMAT).quarter()}`;
    endDate.rowItemText = `Quarter ${moment(endDate.firstDay, DEFAULT_DATE_FORMAT).quarter()}`;
  }

  Object.assign(_state.activeItem.left!, startDate);
  Object.assign(_state.activeItem.right!, endDate);

  // doApply();
  return _state;
};

const selectActiveRange = (__state: State, _config: Config): State => {
  let _state: State = cloneDeep(__state) as State;
  for (const range in _config.availableRanges) {
    if (range) {
      const rangeModel = _config.availableRanges[range];
      if (_config.startDate === rangeModel.startDate && _config.endDate === rangeModel.endDate) {
        _state.activeRange = range;
        _state = updateActiveItem(_config, _state);
      }
    }
  }

  if (!_state.activeRange) {
    _state.activeRange = "Custom Range";
    _state = updateRange(_config, _state, _state.activeRange, null);
    _state = updateActiveItem(_config, _state);
  }
  return _state;
};

export const updateCalendar = (_state: State, _config: Config): State => {
  // const _state: State = cloneDeep(state) as State;
  _state.sides.length = 0;
  _state.dates = {};
  // takes 223 milliSeconds
  // Order is important left - right
  if (!_config.singleDatePicker) {
    _state.sides.push("left");
    const generatedCalendarState = generateCalendar(_state, _config, _config.startDate!, "left");
    _state = generatedCalendarState;
    if (_config.timePicker) {
      const generatedTimePicker = generateTimePicker(_state, _config, _config.startTime!, "left");
      _state = generatedTimePicker.state;
      _state.times.left = generatedTimePicker.timeObject;
    }
  }
  _state.sides.push("right");
  const generatedCalendarState = generateCalendar(_state, _config, _config.endDate!, "right");
  _state = generatedCalendarState;
  if (_config.timePicker) {
    const generatedTimePicker = generateTimePicker(_state, _config, _config.endTime!, "right");
    _state = generatedTimePicker.state;
    _state.times.right = generatedTimePicker.timeObject;
  }
  return _state;
};

const parseOptionsToDefaultDateFormat = (_config: Config): Config => {
  _config.minDate = formatDateToDefaultFormat(_config.minDate!, _config.inputDateFormat!);
  _config.maxDate = formatDateToDefaultFormat(_config.maxDate!, _config.inputDateFormat!);
  _config.startDate = formatDateToDefaultFormat(_config.startDate!, _config.inputDateFormat!);
  _config.endDate = formatDateToDefaultFormat(_config.endDate!, _config.inputDateFormat!);

  if (_config.timePicker) {
    _config.minTime =
      formatTimeToDefaultFormat(_config.minTime ?? "", _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.maxTime =
      formatTimeToDefaultFormat(_config.maxTime ?? "", _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.startTime =
      formatTimeToDefaultFormat(_config.startTime ?? "", _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
    _config.endTime =
      formatTimeToDefaultFormat(_config.endTime ?? "", _config.defaultTimezone ?? USA_TZ_CODE) ??
      undefined;
  }
  return _config;
};

export const generateCalendar = (
  _state: State,
  _config: Config,
  date: string | number,
  side: CALENDAR_SIDES,
): State => {
  const stateCopy: State = cloneDeep(_state) as State;
  stateCopy.selectedMonth[side] = moment(date, DEFAULT_DATE_FORMAT).format("MMM");
  stateCopy.selectedYear[side] = getSelectedYear(date);
  const calendarLabel = `${stateCopy.selectedMonth[side] as string} ${
    stateCopy.selectedYear[side] as string
  }`;

  const dates: DateSide = {
    label: calendarLabel,
    months: getMonthsAvailable(
      _config.minDate as string,
      _config.maxDate as string,
      stateCopy.selectedYear[side] as number,
    ),
    years: getYearsAvailable(_config),
    itemRows: [] as DateRow[],
  };

  stateCopy.weekDayOptions = [""];

  if (_config.type !== "yearly") {
    // moment returns wrong week number
    const monthStartWeekNumber: number = moment(date, DEFAULT_DATE_FORMAT)
      .year(stateCopy.selectedYear[side] as number)
      .startOf("month")
      .week(); // previousMonthLastWeek
    const yearStartDate = moment(stateCopy.selectedYear[side] as number, "YYYY")
      .startOf("year")
      .format(DEFAULT_DATE_FORMAT);
    let numberOfRows = 1;

    if (_config.type === "daily") {
      numberOfRows = getNumberOfWeeks(date as string)!;
      stateCopy.weekDayOptions = ["su", "mo", "tu", "we", "th", "fr", "sa"];
    } else if (_config.type === "weekly") {
      numberOfRows = 8;
      stateCopy.weekDayOptions = ["", "", "", "", "", "", ""];
    } else if (_config.type === "monthly") {
      numberOfRows = 4;
      stateCopy.weekDayOptions = ["", "", ""];
    } else if (_config.type === "quarterly") {
      numberOfRows = 4;
      stateCopy.weekDayOptions = [""];
    }

    for (let dateRows = 0; dateRows < numberOfRows; dateRows++) {
      const dateRowObj: DateRow = {
        rowNumber: null,
        rowNumberText: null,
        items: [] as DateCharacteristics[],
      };

      const rowOptions: RowOptions = {
        type: _config.type,
        monthStartWeekNumber,
        dateRows,
        year: stateCopy.selectedYear[side] as string,
        itemCount: null,
      };

      const { rowNumber, columns }: RowVariables = getCalendarRowVariables(rowOptions);

      dateRowObj.rowNumber = rowNumber;
      dateRowObj.rowNumberText = getCalendarRowNumberText(_config.type ?? "", Number(rowNumber))!;

      for (let rowItem = 0; rowItem <= columns; rowItem++) {
        const rowItemOptions: RowItemOptions = {
          type: _config.type,
          monthStartWeekNumber,
          dateRows,
          rowNumber,
          yearStartDate,
          year: stateCopy.selectedYear[side] as number,
          rowItem,
          columns,
        };

        const { currentItemDate, rowItemText, firstDay, lastDay, itemCount }: RowItemVariables =
          getCalendarRowItemVariables(rowItemOptions);

        rowOptions.itemCount = itemCount;

        const { available, inRange, active, today }: DateCharacteristics = getDateCharacteristics(
          _config,
          stateCopy,
          currentItemDate,
          calendarLabel,
          side,
        );

        const itemObj: ActiveItemSide = {
          date: currentItemDate,
          rowItemText,
          firstDay,
          lastDay,
          available,
          inRange,
          active,
          today,
        };
        if (isRowIemValid(rowOptions)) {
          if (active) {
            stateCopy.activeItem[side] = itemObj;
          }
          dateRowObj.items.push(itemObj);
        }
      }
      dates.itemRows.push(dateRowObj);
    }
  }

  stateCopy.calendarAvailable[side] = true;
  stateCopy.dates[side] = dates;
  return stateCopy;
};

export const generateTimePicker = (
  _state: State,
  _config: Config,
  time: string | null,
  side: CALENDAR_SIDES,
): { state: State; timeObject: TimeSide } => {
  // const _state: State = cloneDeep(state) as State;
  const timeObject: TimeSide = {
    hour: [],
    minute: [],
    meridian: [],
  };

  let startHour = 0;
  const endHour = 23;
  let startMinute = 0;
  const endMinute = 59;
  let selectedHour = side === "left" ? startHour : endHour;
  let selectedMinute = side === "left" ? startMinute : endMinute;
  const startDateEpoch = moment(_config.startDate, DEFAULT_DATE_FORMAT).valueOf();
  const endDateEpoch = moment(_config.endDate, DEFAULT_DATE_FORMAT).valueOf();

  if (time) {
    selectedHour = Number(moment(time, DEFAULT_TIME_FORMAT).format("H"));
    selectedMinute = Number(moment(time, DEFAULT_TIME_FORMAT).format("m"));

    if (side === "right" && startDateEpoch === endDateEpoch) {
      startHour = selectedHour;
      startMinute = selectedMinute;
    }
  }

  // let dateOptions = {
  //   timeZone: TZ_NAMES[state.selectedTimezone],
  //   timeZoneName: 'short',
  //   hour12: false
  // }
  // let startDateObj = new Date(`Jan 1 1970 ${startHour}:${startMinute}:00 GMT-0700 (Mountain Standard Time)`);
  // let endDateObj = new Date(`Jan 1 1970 ${endHour}:${endMinute}:00 GMT-0700 (Mountain Standard Time)`);
  // startTime = startDateObj.toLocaleTimeString('en-US', dateOptions);
  // endTime = endDateObj.toLocaleTimeString('en-US', dateOptions);

  // startHour = moment(startTime, 'HH:mm:ss').format('H');
  // endHour = moment(endTime, 'HH:mm:ss').format('H');
  // startMinute = moment(startTime, 'HH:mm:ss').format('m');
  // endMinute = moment(endTime, 'HH:mm:ss').format('m');

  for (let h = startHour; h <= 23; h++) {
    const stringified_h = convertToViewTimeItem(h);
    timeObject.hour.push(stringified_h);
  }
  for (let m = startMinute; m <= 59; m++) {
    const stringified_m = convertToViewTimeItem(m);
    timeObject.minute.push(stringified_m);
  }

  _state.selectedHour[side] = convertToViewTimeItem(selectedHour);
  _state.selectedMinute[side] = convertToViewTimeItem(selectedMinute);

  return {
    state: _state,
    timeObject,
  };
};

export const getDateRangeModel = (
  config: Config,
  state: State,
  dateRangeModel: DateRangeModel,
  format?: string,
): DateTimeRangeModelChangeOutput => {
  let dRModel: DateTimeRangeModelChangeOutput = {};
  if (undefined !== dateRangeModel && !isEmpty(dateRangeModel)) {
    dRModel = cloneDeep(dateRangeModel) as DateTimeRangeModelChangeOutput;
  }
  if (config.type) {
    dRModel[config.type] = getDatetimeRangeChangeOutput(config, state, format);
  }
  return dRModel;
};

export const getDatetimeRangeChangeOutput = (
  config: Config,
  state: State,
  format?: string,
): DateTimeRangeChangeOutput => {
  let dateRangeChangeOutput: DateTimeRangeChangeOutput;
  let outputDateFormat: string = config.outputDateFormat!;
  if (undefined !== format) {
    outputDateFormat = format;
  }
  let startDate = formatStartDate(config, outputDateFormat);
  let endDate = moment(config.endDate, DEFAULT_DATE_FORMAT).format(outputDateFormat);

  if (config.selectedTimezone) {
    startDate = formatToZoneDate(config.selectedTimezone, outputDateFormat, startDate);
    endDate = formatToZoneDate(config.selectedTimezone, outputDateFormat, endDate);
  }

  dateRangeChangeOutput = {
    activeRange: state.activeRange,
    startDate,
    endDate,
  };

  if (config.timePicker) {
    const startTime = config.startTime;
    const endTime = config.endTime;

    dateRangeChangeOutput = {
      activeRange: state.activeRange,
      startDate,
      endDate,
      startTime,
      endTime,
    };
  }

  return dateRangeChangeOutput;
};
