// /* eslint-disable */
// import React, { type ElementType, useEffect, useRef, useState } from "react";
// import moment, { type DurationInputArg1, type DurationInputArg2, type unitOfTime } from "moment";
// import {
//   type Options,
//   type Settings,
//   type State,
//   type RowItemVariables,
//   type RowOptions,
//   type RowItemOptions,
//   type DateSide,
//   type ActiveItemSide,
//   type DateCharacteristics,
//   type DateRangeModel,
//   type Config,
//   type TimeSide,
//   type DateRow,
//   type RowVariables,
//   type DateTimeRangeChangeOutput,
//   type DateTimeRangeModelChangeOutput,
// } from "./interfaces";
// import { NgxDatetimeRangePickerConstants as Constants } from "./constants";
// import { NgxDatetimeRangePickerService } from "./service";
// import { cloneDeep, isEmpty, isNil, mergeDeep } from "./util";
// import "./DateTimeRangePicker.css";
// import { type CALENDAR_SIDES, type TIME_ITEM, type TZ_MAP_KEYS } from "./types";
// import { DatetimeRangeType } from "./enum";

// enum InputFocusBlur {
//   focus = 1,
//   blur = 2,
// }

// enum s {
//   daily,
// }
// const DEFAULT_TIME_FORMAT = Constants.DEFAULT.TIME_FORMAT;
// const USA_TZ_CODE: TZ_MAP_KEYS = Constants.CONSTANT.USA_TZ_CODE;
// export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

// interface Props {
//   options: Options;
//   settings: Settings;
//   dateRangeModel: DateRangeModel;
//   canBeEmpty: boolean;
//   dateRangeModelChange: (options: Options | DateRangeModel) => void;
//   dateRangeChanged: (options: Options) => void;
//   inputFocusBlur: (options: Record<any, any>) => void;
//   selectedDate: (options: Options) => void;
//   inputAs?: ElementType;
//   selectAs?: ElementType;
//   selectOptionAs?: ElementType;
//   buttonAs?: ElementType;
// }

// const service = new NgxDatetimeRangePickerService();

// const DateTimeRangePicker: React.FC<Props> = ({
//   options: userOptions,
//   settings: userSettings,
//   dateRangeModel: userDateRangeModel,
//   canBeEmpty: userCanBeEmpty,
//   dateRangeModelChange,
//   dateRangeChanged,
//   inputFocusBlur,
//   selectedDate,
//   inputAs: InputTag = "input",
//   selectAs: SelectTag = "select",
//   selectOptionAs: SelectOptionTag = "option",
//   buttonAs: ButtonTag = "button",
// }: Props) => {
//   const [state, setState] = useState({} as State);
//   const [options, setOptions] = useState({} as Options);
//   const [settings, setSettings] = useState({} as Settings);
//   const [config, setConfig] = useState({} as Config);
//   const [dateRangeModel, setDateRangeModel] = useState({} as DateRangeModel);
//   const [canBeEmpty, setCanBeEmpty] = useState(false);
//   const filterInputBox = useRef(null);
//   const itemCell = useRef(null);

//   const onCalendarClose = (): void => {
//     if (config.startDate && config.endDate) {
//       if (filterInputBox) {
//         filterInputBox.current.nativeElement.classList.remove("empty-filter");
//       }
//       setState({
//         ...state,
//         isCalendarVisible: false,
//       });
//     } else {
//       // filterInputBox.nativeElement.classList.add('empty-filter');
//     }
//   };

//   const init = () => {
//     const _state: State = cloneDeep(state) as State;
//     _state.isValidFilter = false;
//     if (!config) {
//       setConfig(Object.assign(service.getDefaultOptions(), service.getDefaultSettings()));
//     }
//     setState(_state);
//     initialize();
//     parseOptions();
//     updateInputField();
//   };

//   const initialize = () => {
//     setState(service.getDefaultState());
//   };

//   const onCreate = () => {
//     const _state = service.getDefaultState();
//     const _options = service.getDefaultOptions();
//     const _settings = service.getDefaultSettings();
//     const _config = Object.assign(_options, _settings);

//     _state.todayTime = service.getZoneToday(_state.selectedTimezone, _config.viewDateFormat || "");

//     setState(_state);
//     setOptions(_options);
//     setSettings(_settings);
//     setConfig(_config);

//     document.addEventListener("click", (event: MouseEvent) => {
//       if (
//         state.isCalendarVisible &&
//         event.target &&
//         !(event.target as HTMLElement).parentElement?.getElementsByClassName(
//           "ngx-datetime-range-picker-select-panel",
//         ).length &&
//         !(event.target as HTMLElement).closest(".mat-mdc-option")
//         // element.nativeElement !== event.target &&
//         // !element.nativeElement.contains(event.target)
//       ) {
//         onCalendarClose();
//       }
//     });
//   };

//   const parseOptions = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     let _options: Options = { ...options };
//     let _settings: Settings = { ...settings };
//     if (options !== undefined) {
//       Object.keys(options).forEach((k) => {
//         if (!isNil(options[k as keyof Options])) {
//           _options = {
//             ..._options,
//             [k]: options[k as keyof Options],
//           };
//         } else {
//           console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
//             'options.${k}' is undefined or null. Setting default value.
//           `);
//         }
//       });
//     }
//     if (settings !== undefined) {
//       Object.keys(settings).forEach((k) => {
//         if (!isNil(settings[k as keyof Settings])) {
//           _settings = {
//             ..._settings,
//             [k]: settings[k as keyof Settings],
//           };
//         } else {
//           console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
//             'settings.${k}' is undefined or null. Setting default value.
//           `);
//         }
//       });
//     }

//     // check if inputDateFormat is provided
//     if (!config.inputDateFormat) {
//       console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
//         'inputDateFormat' is required to convert dates.
//         'inputDateFormat' not provided. Setting it to YYYY-MM-DD.
//       `);
//       _config.inputDateFormat = DEFAULT_DATE_FORMAT;
//     }

//     if (config.type === "weekly" || config.type === "yearly") {
//       _config.showRowNumber = false;
//     }
//     if (config.singleDatePicker) {
//       _config.startDate = cloneDeep(config.endDate) as string;
//     }

//     selectTimeZone();
//     parseOptionsToDefaultDateFormat();
//     processDateRangeModel();
//     sanitizeDates();
//     processRanges();
//     doDateRangeModelChange();
//     updateCalendar();
//   };

//   const selectTimeZone = () => {
//     const _state: State = cloneDeep(state) as State;
//     if (config.timezoneSupport) {
//       if (!config.defaultTimezone) {
//         config.defaultTimezone = USA_TZ_CODE;
//       }
//       _state.selectedTimezone = config.defaultTimezone;
//     }

//     if (config.useLocalTimezone) {
//       _state.selectedTimezone = state.localTimezone;
//     }
//     setState(_state);
//     onTimezoneChange(_state.selectedTimezone);
//   };

//   const sanitizeDates = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     const subtractWeekCount = 0;
//     const setDate = (type: string) => {
//       _config.minDate = moment(_config.minDate, DEFAULT_DATE_FORMAT)
//         .endOf(type as unitOfTime.StartOf)
//         .format(DEFAULT_DATE_FORMAT);
//       _config.maxDate =
//         type === "week"
//           ? moment(_config.maxDate, DEFAULT_DATE_FORMAT)
//               .subtract(subtractWeekCount, "week")
//               .endOf(type as unitOfTime.StartOf)
//               .format(DEFAULT_DATE_FORMAT)
//           : moment(_config.maxDate, DEFAULT_DATE_FORMAT)
//               .endOf(type as unitOfTime.StartOf)
//               .format(DEFAULT_DATE_FORMAT);
//       _config.startDate = moment(_config.startDate, DEFAULT_DATE_FORMAT)
//         .endOf(type as unitOfTime.StartOf)
//         .format(DEFAULT_DATE_FORMAT);
//       _config.endDate =
//         type === "week"
//           ? moment(_config.endDate, DEFAULT_DATE_FORMAT)
//               .subtract(subtractWeekCount, "week")
//               .endOf(type)
//               .format(DEFAULT_DATE_FORMAT)
//           : moment(_config.endDate, DEFAULT_DATE_FORMAT)
//               .endOf(type as unitOfTime.StartOf)
//               .format(DEFAULT_DATE_FORMAT);
//     };

//     if (_config.type === "weekly") {
//       setDate.bind(this)("week");
//     } else if (_config.type === "monthly") {
//       setDate.bind(this)("month");
//     } else if (_config.type === "quarterly") {
//       setDate.bind(this)("quarter");
//     } else if (_config.type === "yearly") {
//       setDate.bind(this)("year");
//     }

//     if (
//       moment(_config.startDate, DEFAULT_DATE_FORMAT).valueOf() <
//       moment(_config.minDate, DEFAULT_DATE_FORMAT).valueOf()
//     ) {
//       _config.minDate = _config.startDate;
//     }

//     if (
//       moment(_config.endDate, DEFAULT_DATE_FORMAT).valueOf() >
//       moment(_config.maxDate, DEFAULT_DATE_FORMAT).valueOf()
//     ) {
//       _config.maxDate = _config.endDate;
//     }
//     setConfig(_config);
//   };

//   const processDateRangeModel = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     if (undefined === dateRangeModel || isEmpty(dateRangeModel)) {
//       return;
//     }

//     if (!dateRangeModel[config.type]) {
//       const _optionsKeys: string[] = Object.keys(service.getDefaultOptions());
//       let _model: Options = {} as Options;
//       Object.keys(dateRangeModel).forEach((key: string) => {
//         if (_optionsKeys.includes(key)) {
//           _model = {
//             ..._model,
//             [key]: dateRangeModel[key as keyof DateRangeModel],
//           };
//           delete dateRangeModel[key as keyof DateRangeModel];
//         }
//       });
//       dateRangeModel[config.type] = _model;
//       if (!dateRangeModel[config.type]) {
//         return;
//       }
//     }

//     config.dateArray = dateRangeModel[config.type].dateArray || config.dateArray;

//     handleDateArray();

//     if (config.dateArray.length) {
//       if (!dateRangeModel[config.type].minDate) {
//         dateRangeModel[config.type].minDate = config.dateArray[0] || config.minDate;
//       }
//       if (!dateRangeModel[config.type].maxDate) {
//         dateRangeModel[config.type].maxDate =
//           config.dateArray[config.dateArray.length - 1] || config.maxDate;
//       }
//       if (!dateRangeModel[config.type].startDate) {
//         dateRangeModel[config.type].startDate = config.dateArray[0] || config.startDate;
//       }
//       if (!dateRangeModel[config.type].endDate) {
//         dateRangeModel[config.type].endDate =
//           config.dateArray[config.dateArray.length - 1] || config.endDate;
//       }
//     }

//     const dateRangeMinDate = dateRangeModel[config.type].minDate || config.minDate;
//     const dateRangeMaxDate = dateRangeModel[config.type].maxDate || config.maxDate;
//     const dateRangeStartDate = dateRangeModel[config.type].startDate || config.startDate;
//     const dateRangeEndDate = dateRangeModel[config.type].endDate || config.endDate;

//     _config.minDate = service.formatDateToDefaultFormat(dateRangeMinDate, config.inputDateFormat);
//     _config.maxDate = service.formatDateToDefaultFormat(dateRangeMaxDate, config.inputDateFormat);
//     _config.startDate = service.formatDateToDefaultFormat(
//       dateRangeStartDate,
//       config.inputDateFormat,
//     );
//     _config.endDate = service.formatDateToDefaultFormat(dateRangeEndDate, config.inputDateFormat);

//     if (config.timePicker) {
//       const dateRangeMinTime = dateRangeModel[config.type].minTime || config.minTime;
//       const dateRangeMaxTime = dateRangeModel[config.type].maxTime || config.maxTime;
//       const dateRangeStartTime = dateRangeModel[config.type].startTime || config.startTime;
//       const dateRangeEndTime = dateRangeModel[config.type].endTime || config.endTime;

//       _config.minTime = service.formatTimeToDefaultFormat(dateRangeMinTime);
//       _config.maxTime = service.formatTimeToDefaultFormat(dateRangeMaxTime);
//       _config.startTime = service.formatTimeToDefaultFormat(dateRangeStartTime);
//       _config.endTime = service.formatTimeToDefaultFormat(dateRangeEndTime);
//     }
//     setConfig(_config);
//   };

//   const handleDateArray = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     if (config.dateArray?.length) {
//       // converts all the dates to DEFAULT_DATE_FORMAT
//       _config.dateArray = service.getSanitizedDateArray(config);

//       // sort in asc order
//       _config.dateArray = _config.dateArray.sort((date1, date2) => {
//         const value1: number = moment(date1, DEFAULT_DATE_FORMAT).valueOf();
//         const value2: number = moment(date2, DEFAULT_DATE_FORMAT).valueOf();
//         return value1 - value2;
//       });
//     }
//     setConfig(_config);
//   };

//   const processRanges = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     const _state: State = cloneDeep(state) as State;
//     if (_config.showRanges && !_config.singleDatePicker) {
//       _config.availableRanges = service.createDefaultRanges(_config);
//       selectActiveRange();
//     } else {
//       _state.activeRange = "Custom Range";
//       onRangeClick(_state.activeRange, null);
//     }
//     setConfig(_config);
//     setState(_state);
//   };

//   const selectActiveRange = () => {
//     const _state: State = cloneDeep(state) as State;
//     for (const range in config.availableRanges) {
//       if (range) {
//         const rangeModel = config.availableRanges[range];
//         if (config.startDate === rangeModel.startDate && config.endDate === rangeModel.endDate) {
//           _state.activeRange = range;
//           updateActiveItem();
//         }
//       }
//     }

//     if (!_state.activeRange) {
//       _state.activeRange = "Custom Range";
//       onRangeClick(_state.activeRange, null);
//     }
//     setState(_state);
//   };

//   const updateCalendar = () => {
//     const _state: State = cloneDeep(state) as State;
//     _state.sides.length = 0;
//     _state.dates = {};
//     // takes 223 milliSeconds
//     // Order is important left - right
//     if (!config.singleDatePicker) {
//       _state.sides.push("left");
//       _state.dates.left = generateCalendar(config.startDate, "left");
//       if (config.timePicker) {
//         _state.times.left = generateTimePicker(config.startTime, "left");
//       }
//     }
//     _state.sides.push("right");
//     _state.dates.right = generateCalendar(config.endDate, "right");
//     if (config.timePicker) {
//       _state.times.right = generateTimePicker(config.endTime, "right");
//     }
//     setState(_state);
//   };

//   useEffect(() => {
//     setCanBeEmpty(userCanBeEmpty);
//   }, [userCanBeEmpty]);

//   useEffect(() => {
//     service.checkSettingsValidity(userSettings);
//     setSettings(mergeDeep(settings, userSettings));
//   }, [userSettings]);

//   useEffect(() => {
//     if (!config.type) {
//       return;
//     }
//     const previousValue: Options | undefined = dateRangeModel[config.type];
//     const currentValue: Options | undefined = userDateRangeModel[config.type];
//     if (
//       previousValue &&
//       currentValue &&
//       previousValue.startDate === currentValue.startDate &&
//       previousValue.endDate === currentValue.endDate
//     ) {
//     }
//   }, [userDateRangeModel]);

//   useEffect(() => {
//     setOptions(userOptions);
//   }, [userOptions]);

//   useEffect(() => {
//     onCreate();
//     init();
//   }, []);

//   const onComponentClick = () => {
//     setState({
//       ...state,
//       isCalendarVisible: !state.isCalendarVisible,
//     });
//   };

//   const onFocusInput = (event: MouseEvent | FocusEvent): void => {
//     inputFocusBlur({
//       reason: InputFocusBlur.focus,
//       value: (event.target as HTMLInputElement).value,
//     });
//   };

//   const onBlurInput = (event: MouseEvent | FocusEvent): void => {
//     const value = (event.target as HTMLInputElement).value;
//     setState({
//       ...state,
//       selectedDateText: value,
//     });
//     inputFocusBlur({
//       reason: InputFocusBlur.blur,
//       value,
//     });
//   };

//   const onDateRangeInputChange = (value: string) => {
//     dateRangeSelected();
//   };

//   const dateRangeSelected = () => {
//     const dateRangeModel: DateTimeRangeChangeOutput = getNgxDatetimeRangeChangeOutput();
//     setState({
//       ...state,
//       isCalendarVisible: false,
//     });
//     if (filterInputBox) {
//       filterInputBox.current.nativeElement.classList.remove("empty-filter");
//     }
//     doDateRangeModelChange();
//     dateRangeChanged(dateRangeModel);
//   };

//   const doDateRangeModelChange = () => {
//     const dateRangeModel: DateTimeRangeModelChangeOutput = getDateRangeModel(
//       config.inputDateFormat,
//     );
//     dateRangeModelChange(dateRangeModel);
//   };

//   const getDateRangeModel = (format?: string): DateTimeRangeModelChangeOutput => {
//     let dRModel: DateTimeRangeModelChangeOutput = {};
//     if (undefined !== dateRangeModel && !isEmpty(dateRangeModel)) {
//       dRModel = cloneDeep(dateRangeModel) as {};
//     }
//     dRModel[config.type] = getNgxDatetimeRangeChangeOutput(format);
//     return dRModel;
//   };

//   const getNgxDatetimeRangeChangeOutput = (format?: string): DateTimeRangeChangeOutput => {
//     let dateRangeChangeOutput: DateTimeRangeChangeOutput;
//     let outputDateFormat: string = config.outputDateFormat;
//     if (undefined !== format) {
//       outputDateFormat = format;
//     }
//     let startDate = service.formatStartDate(config, outputDateFormat);
//     let endDate = moment(config.endDate, DEFAULT_DATE_FORMAT).format(outputDateFormat);

//     if (config.selectedTimezone) {
//       startDate = service.formatToZoneDate(config.selectedTimezone, outputDateFormat, startDate);
//       endDate = service.formatToZoneDate(config.selectedTimezone, outputDateFormat, endDate);
//     }

//     dateRangeChangeOutput = {
//       activeRange: state.activeRange,
//       startDate,
//       endDate,
//     };

//     if (config.timePicker) {
//       const startTime = config.startTime;
//       const endTime = config.endTime;

//       dateRangeChangeOutput = {
//         activeRange: state.activeRange,
//         startDate,
//         endDate,
//         startTime,
//         endTime,
//       };
//     }

//     return dateRangeChangeOutput;
//   };

//   const parseOptionsToDefaultDateFormat = () => {
//     const _config: Config = cloneDeep(config) as Config;
//     _config.minDate = service.formatDateToDefaultFormat(config.minDate, config.inputDateFormat);
//     _config.maxDate = service.formatDateToDefaultFormat(config.maxDate, config.inputDateFormat);
//     _config.startDate = service.formatDateToDefaultFormat(config.startDate, config.inputDateFormat);
//     _config.endDate = service.formatDateToDefaultFormat(config.endDate, config.inputDateFormat);

//     if (config.timePicker) {
//       _config.minTime = service.formatTimeToDefaultFormat(config.minTime);
//       _config.maxTime = service.formatTimeToDefaultFormat(config.maxTime);
//       _config.startTime = service.formatTimeToDefaultFormat(config.startTime);
//       _config.endTime = service.formatTimeToDefaultFormat(config.endTime);
//     }
//     setConfig(_config);
//   };

//   const doApply = () => {
//     const _state: State = cloneDeep(state) as State;
//     const startDate = config.startDate;
//     const endDate = config.endDate;

//     _state.activeStartDate = startDate as string;
//     _state.activeEndDate = endDate as string;

//     if (config.startDate && config.endDate) {
//       if (!config.timePicker) {
//         dateRangeSelected();
//       } else {
//         if (config.timePicker) {
//           _state.sides.forEach((side) => {
//             _state.times[side] = generateTimePicker(null, side);
//           });
//         }
//       }
//     }

//     let outputStartDate: number | null = startDate
//       ? moment(startDate, DEFAULT_DATE_FORMAT).valueOf()
//       : null;
//     let outputEndDate: number | null = endDate
//       ? moment(endDate, DEFAULT_DATE_FORMAT).valueOf()
//       : null;
//     if (config.outputDateFormat) {
//       outputStartDate = startDate
//         ? Number(moment(startDate, DEFAULT_DATE_FORMAT).format(config.outputDateFormat))
//         : null;
//       outputEndDate = endDate
//         ? Number(moment(endDate, DEFAULT_DATE_FORMAT).format(config.outputDateFormat))
//         : null;
//     }
//     selectedDate({
//       startDate: outputStartDate,
//       endDate: outputEndDate,
//     });

//     setState(_state);
//     updateInputField();
//   };

//   const updateInputField = () => {
//     const startDate = service.formatStartDate(config, config.viewDateFormat);
//     const endDate = config.endDate
//       ? moment(config.endDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat)
//       : "";

//     if (config.singleDatePicker) {
//       let startDateText = startDate;
//       let endDataText = endDate;
//       let dateText = "";

//       if (config.timePicker) {
//         startDateText = `${startDate} ${config.startTime}`;
//         endDataText = `${endDate} ${config.endTime}`;
//       }
//       if (config.displayBeginDate) {
//         dateText = `${startDateText}`;
//       } else if (config.displayEndDate) {
//         dateText = `${endDataText}`;
//       } else {
//         dateText = `${startDateText} - ${endDataText}`;
//       }

//       state.selectedDateText = dateText;
//     } else {
//       let startDateText = startDate;
//       let endDataText = endDate;

//       if (config.timePicker) {
//         startDateText = `${startDate} ${config.startTime}`;
//         endDataText = `${endDate} ${config.endTime}`;
//       }

//       state.selectedDateText = `${startDateText} - ${endDataText}`;
//     }

//     if (canBeEmpty || !state.selectedDateText.includes("nvalid")) {
//       state.isValidFilter = true;
//     }

//     if (config.type === "yearly") {
//       state.dateTitleText.left = `${startDate}`;
//       state.dateTitleText.right = `${endDate}`;
//     } else {
//       updateActiveItemInputField();
//     }
//   };

//   const updateActiveItemInputField = () => {
//     if (!config.singleDatePicker) {
//       updateSide("left");
//     }
//     updateSide("right");
//   };

//   const updateSide = (side: CALENDAR_SIDES) => {
//     let itemFirstDate = (state.activeItem[side] as ActiveItemSide).firstDay;
//     let itemLastDate = (state.activeItem[side] as ActiveItemSide).lastDay;
//     const itemText = (state.activeItem[side] as ActiveItemSide).rowItemText;
//     itemFirstDate = moment(itemFirstDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat);
//     itemLastDate = moment(itemLastDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat);
//     if (config.type !== "daily") {
//       state.dateTitleText[side] = `${itemText} (${itemFirstDate} - ${itemLastDate})`;
//     } else {
//       state.dateTitleText[side] = `${itemFirstDate}`;
//     }
//   };

//   const onCalendarLabelChange = (label: string, side: CALENDAR_SIDES, type: string) => {
//     const _state: State = cloneDeep(state) as State;
//     const _config: Config = cloneDeep(config) as Config;
//     _state.isCalendarVisible = true;
//     if (type === "month") {
//       _state.selectedMonth[side] = label;
//     } else if (type === "year") {
//       _state.selectedYear[side] = label;
//     }

//     if (config.type !== "daily") {
//       _state.selectedMonth[side] = "Jun";
//     }

//     if (config.type !== "yearly") {
//       const selectedMonth = `${state.selectedMonth[side]} ${state.selectedYear[side]}`;
//       const date: string = moment(selectedMonth, "MMM YYYY")
//         .startOf("month")
//         .format(DEFAULT_DATE_FORMAT);
//       _state.dates[side] = generateCalendar(date, side);
//     } else {
//       if (_state.selectedYear.left <= state.selectedYear.right && side === "right") {
//         _config.startDate = moment(state.selectedYear.left as number, "YYYY")
//           .startOf("year")
//           .format(DEFAULT_DATE_FORMAT);
//         _config.endDate = moment(state.selectedYear.right as number, "YYYY")
//           .endOf("year")
//           .format(DEFAULT_DATE_FORMAT);

//         doApply();
//       }
//       const internalConfig: Config = {
//         startDate: moment(state.selectedYear.left as number, "YYYY")
//           .startOf("year")
//           .format(DEFAULT_DATE_FORMAT),
//         type: "yearly",
//       };
//       const startDate: string = service.formatStartDate(internalConfig, config.viewDateFormat);
//       const endDate: string = config.endDate
//         ? moment(config.endDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat)
//         : "";
//       _state.dateTitleText.left = `${startDate}`;
//       _state.dateTitleText.right = `${endDate}`;
//     }
//     setState(_state);
//     setConfig(_config);
//   };

//   const onTimeLabelChange = (timeItem: TIME_ITEM, side: CALENDAR_SIDES, item: string) => {
//     const _state: State = cloneDeep(state) as State;
//     let time = null;
//     if (side === "left") {
//       time = config.startTime.split(":");
//       if (timeItem === "hour") {
//         config.startTime = `${item}:${time[1]}`;
//       } else {
//         config.startTime = `${time[0]}:${item}`;
//       }

//       const startDateEpoch: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
//       const endDateEpoch: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
//       if (startDateEpoch === endDateEpoch) {
//         state.times.right = generateTimePicker(config.startTime, "right");
//       }
//     } else {
//       time = config.endTime.split(":");
//       if (timeItem === "hour") {
//         config.endTime = `${item}:${time[1]}`;
//       } else {
//         config.endTime = `${time[0]}:${item}`;
//       }
//     }

//     if (timeItem === "hour") {
//       state.selectedHour[side] = service.convertToViewTimeItem(item);
//     } else {
//       state.selectedMinute[side] = service.convertToViewTimeItem(item);
//     }
//     setState(_state);
//   };

//   const generateCalendar = (date: string | number, side: CALENDAR_SIDES): DateSide => {
//     const _state: State = cloneDeep(state) as State;
//     _state.selectedMonth[side] = moment(date, DEFAULT_DATE_FORMAT).format("MMM");
//     _state.selectedYear[side] = service.getSelectedYear(date);
//     const calendarLabel = `${state.selectedMonth[side]} ${state.selectedYear[side]}`;

//     const dates: DateSide = {
//       label: calendarLabel,
//       months: service.getMonthsAvailable(
//         config.minDate as string,
//         config.maxDate as string,
//         state.selectedYear[side] as number,
//       ),
//       years: service.getYearsAvailable(config),
//       itemRows: [] as DateRow[],
//     };

//     _state.weekDayOptions = [""];

//     if (config.type !== "yearly") {
//       // moment returns wrong week number
//       const monthStartWeekNumber: number = moment(date, DEFAULT_DATE_FORMAT)
//         .year(state.selectedYear[side] as number)
//         .startOf("month")
//         .week(); // previousMonthLastWeek
//       const yearStartDate = moment(state.selectedYear[side] as number, "YYYY")
//         .startOf("year")
//         .format(DEFAULT_DATE_FORMAT);
//       let numberOfRows = 1;

//       if (config.type === "daily") {
//         numberOfRows = service.getNumberOfWeeks(date as string);
//         _state.weekDayOptions = ["su", "mo", "tu", "we", "th", "fr", "sa"];
//       } else if (config.type === "weekly") {
//         numberOfRows = 8;
//         _state.weekDayOptions = ["", "", "", "", "", "", ""];
//       } else if (config.type === "monthly") {
//         numberOfRows = 4;
//         _state.weekDayOptions = ["", "", ""];
//       } else if (config.type === "quarterly") {
//         numberOfRows = 4;
//         _state.weekDayOptions = [""];
//       }

//       for (let dateRows = 0; dateRows < numberOfRows; dateRows++) {
//         const dateRowObj: DateRow = {
//           rowNumber: null as string,
//           rowNumberText: null as string,
//           items: [] as DateCharacteristics[],
//         };

//         const rowOptions: RowOptions = {
//           type: config.type,
//           monthStartWeekNumber,
//           dateRows,
//           year: state.selectedYear[side] as string,
//           itemCount: null,
//         };

//         const { rowNumber, columns }: RowVariables = service.getCalendarRowVariables(rowOptions);

//         dateRowObj.rowNumber = rowNumber;
//         dateRowObj.rowNumberText = service.getCalendarRowNumberText(config.type, Number(rowNumber));

//         for (let rowItem = 0; rowItem <= columns; rowItem++) {
//           const rowItemOptions: RowItemOptions = {
//             type: config.type,
//             monthStartWeekNumber,
//             dateRows,
//             rowNumber,
//             yearStartDate,
//             year: state.selectedYear[side] as number,
//             rowItem,
//             columns,
//           };

//           const { currentItemDate, rowItemText, firstDay, lastDay, itemCount }: RowItemVariables =
//             service.getCalendarRowItemVariables(rowItemOptions);

//           rowOptions.itemCount = itemCount;

//           const { available, inRange, active, today }: DateCharacteristics =
//             service.getDateCharacteristics(config, state, currentItemDate, calendarLabel, side);

//           const itemObj: ActiveItemSide = {
//             date: currentItemDate,
//             rowItemText,
//             firstDay,
//             lastDay,
//             available,
//             inRange,
//             active,
//             today,
//           };
//           if (service.isRowIemValid(rowOptions)) {
//             if (active) {
//               _state.activeItem[side] = itemObj;
//             }
//             dateRowObj.items.push(itemObj);
//           }
//         }
//         dates.itemRows.push(dateRowObj);
//       }
//     }

//     _state.calendarAvailable[side] = true;

//     // generate month/year select
//     setTimeout(() => {
//       const options: {
//         type: string;
//         side: string;
//         items: string[];
//         selected: string;
//         onChange: Function;
//       } = {
//         side,
//         onChange: onCalendarLabelChange.bind(this),
//         type: "month",
//         items: dates.months,
//         selected: state.selectedMonth[side] as string,
//       };
//       printSelect(options);

//       options.type = "year";
//       options.items = dates.years;
//       options.selected = state.selectedYear[side] as string;
//       printSelect(options);
//     });

//     setState(_state);
//     return dates;
//   };

//   const printSelect = (options: {
//     type: string;
//     side: string;
//     items: string[];
//     selected: string;
//     onChange: Function;
//   }) => {
//     let optionHTML = "";
//     options.items.forEach((item) => {
//       optionHTML += `
//         <option
//           class="dropdown-item"
//           value=${item}
//           selected=${options.selected === item}
//         >
//           ${item}
//         </option>
//       `;
//     });

//     const selectEl = `
//       <select
//         class="${options.type}-select ngx-datetime-range-picker-select-panel ${options.type}-select-panel">
//         ${optionHTML}
//       </select>
//     `;

//     const selectContainerEl = document.getElementById(`${options.type}Select`);
//     if (selectContainerEl) {
//       selectContainerEl.innerHTML = selectEl;
//       selectContainerEl.getElementsByTagName("select")[0].addEventListener("change", (e) => {
//         options.onChange(e, options.side, options.type);
//       });
//     }
//   };

//   const generateTimePicker = (time: string, side: CALENDAR_SIDES): TimeSide => {
//     const _state: State = cloneDeep(state) as State;
//     const timeObject: TimeSide = {
//       hour: [],
//       minute: [],
//       meridian: [],
//     };

//     let startHour = 0;
//     const endHour = 23;
//     let startMinute = 0;
//     const endMinute = 59;
//     let selectedHour = side === "left" ? startHour : endHour;
//     let selectedMinute = side === "left" ? startMinute : endMinute;
//     const startDateEpoch = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
//     const endDateEpoch = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();

//     if (time) {
//       selectedHour = Number(moment(time, DEFAULT_TIME_FORMAT).format("H"));
//       selectedMinute = Number(moment(time, DEFAULT_TIME_FORMAT).format("m"));

//       if (side === "right" && startDateEpoch === endDateEpoch) {
//         startHour = selectedHour;
//         startMinute = selectedMinute;
//       }
//     }

//     // let dateOptions = {
//     //   timeZone: TZ_NAMES[state.selectedTimezone],
//     //   timeZoneName: 'short',
//     //   hour12: false
//     // }
//     // let startDateObj = new Date(`Jan 1 1970 ${startHour}:${startMinute}:00 GMT-0700 (Mountain Standard Time)`);
//     // let endDateObj = new Date(`Jan 1 1970 ${endHour}:${endMinute}:00 GMT-0700 (Mountain Standard Time)`);
//     // startTime = startDateObj.toLocaleTimeString('en-US', dateOptions);
//     // endTime = endDateObj.toLocaleTimeString('en-US', dateOptions);

//     // startHour = moment(startTime, 'HH:mm:ss').format('H');
//     // endHour = moment(endTime, 'HH:mm:ss').format('H');
//     // startMinute = moment(startTime, 'HH:mm:ss').format('m');
//     // endMinute = moment(endTime, 'HH:mm:ss').format('m');

//     for (let h = startHour; h <= 23; h++) {
//       const stringified_h = service.convertToViewTimeItem(h);
//       timeObject.hour.push(stringified_h);
//     }
//     for (let m = startMinute; m <= 59; m++) {
//       const stringified_m = service.convertToViewTimeItem(m);
//       timeObject.minute.push(stringified_m);
//     }

//     _state.selectedHour[side] = service.convertToViewTimeItem(selectedHour);
//     _state.selectedMinute[side] = service.convertToViewTimeItem(selectedMinute);

//     if (side === "left") {
//       config.startTime = `${state.selectedHour[side]}:${state.selectedMinute[side]}`;
//     } else if (side === "right") {
//       config.endTime = `${state.selectedHour[side]}:${state.selectedMinute[side]}`;
//     }

//     // generate hour/minute select
//     setTimeout(() => {
//       const options: {
//         type: string;
//         side: string;
//         items: string[];
//         selected: string;
//         onChange: Function;
//       } = {
//         side,
//         onChange: onTimeLabelChange.bind(this),
//         type: "hour",
//         items: timeObject.hour,
//         selected: state.selectedHour[side] as string,
//       };
//       printSelect(options);

//       options.type = "minute";
//       options.items = timeObject.minute;
//       options.selected = state.selectedMinute[side] as string;
//       printSelect(options);
//     });
//     setState(_state);
//     return timeObject;
//   };

//   const onTimezoneChange = (tz: TZ_MAP_KEYS) => {
//     const _state: State = cloneDeep(state) as State;
//     _state.selectedTimezone = tz;
//     _state.todayTime = service.getZoneToday(_state.selectedTimezone, config.viewDateFormat);

//     console.log("=======> _state", _state);
//     parseOptionsToDefaultDateFormat();
//     _state.sides.forEach((side: CALENDAR_SIDES) => {
//       let date = config.startDate;
//       let time = config.startTime;
//       if (side === "right") {
//         date = config.endDate;
//         time = config.endTime;
//       }
//       _state.dates[side] = generateCalendar(date, side);
//       if (config.timePicker) {
//         _state.times[side] = generateTimePicker(time, side);
//       }
//     });
//     setState(_state);
//   };

//   const isPrevAvailable = (side: CALENDAR_SIDES): boolean => {
//     const { label, labelFormat, type } = service.getLabelProps(state, config.type, side);

//     return (
//       moment(label, labelFormat)
//         .startOf(type as unitOfTime.StartOf)
//         .valueOf() >
//       moment(config.minDate, DEFAULT_DATE_FORMAT)
//         .startOf(type as unitOfTime.StartOf)
//         .valueOf()
//     );
//   };

//   const onClickPrevious = (side: CALENDAR_SIDES) => {
//     const { label, labelFormat, type } = service.getLabelProps(state, config.type, side);
//     const startDate = moment(label, labelFormat)
//       .subtract(1 as DurationInputArg1, type as DurationInputArg2)
//       .startOf(type as unitOfTime.StartOf)
//       .format(DEFAULT_DATE_FORMAT);

//     state.dates[side] = generateCalendar(startDate, side);
//   };

//   //   const getCalendarColspan = () => {
//   //     return service.getCalendarColspan(config.type);
//   //   };

//   const isNextAvailable = (side: CALENDAR_SIDES): boolean => {
//     const { label, labelFormat, type } = service.getLabelProps(state, config.type, side);

//     return (
//       moment(label, labelFormat)
//         .endOf(type as unitOfTime.StartOf)
//         .valueOf() <
//       moment(config.maxDate, DEFAULT_DATE_FORMAT)
//         .endOf(type as unitOfTime.StartOf)
//         .valueOf()
//     );
//   };

//   const onClickNext = (side: CALENDAR_SIDES) => {
//     const { label, labelFormat, type } = service.getLabelProps(state, config.type, side);
//     const endDate = moment(label, labelFormat)
//       .add(1 as DurationInputArg1, type as DurationInputArg2)
//       .endOf(type as unitOfTime.StartOf)
//       .format(DEFAULT_DATE_FORMAT);

//     state.dates[side] = generateCalendar(endDate, side);
//   };

//   const getCalendarLabelContent = (side: CALENDAR_SIDES) => (
//     <>
//       <div className="prev">
//         <div
//           className={`${isPrevAvailable(side) ? "available" : "disabled"}`}
//           onClick={() => {
//             onClickPrevious(side);
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="24"
//             viewBox="0 -960 960 960"
//             width="24"
//             fill={`${isPrevAvailable(side) ? null : "#e6e6e6"}`}
//           >
//             <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
//           </svg>
//         </div>
//       </div>
//       <div
//         //   colspan={getCalendarColspan()}
//         className="calendar-label"
//       >
//         <div className="date-dropdown-container" style={{ position: "relative" }}>
//           {config.type === DatetimeRangeType.daily && (
//             <div className="date-dropdown ngx-datetime-range-picker-select-panel month-select-panel">
//               <SelectTag
//                 className="month-select"
//                 value={state.selectedMonth[side]}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                   onCalendarLabelChange(e.target.value, side, "month");
//                 }}
//               >
//                 {(state.dates[side] as DateSide).months.map((month) => (
//                   <SelectOptionTag className="dropdown-item" value={month}>
//                     {month}
//                   </SelectOptionTag>
//                 ))}
//               </SelectTag>
//             </div>
//           )}
//           <div className="date-dropdown ngx-datetime-range-picker-select-panel year-select-panel">
//             <SelectTag
//               className="year-select"
//               value={state.selectedMonth[side]}
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                 onCalendarLabelChange(e.target.value, side, "year");
//               }}
//             >
//               {(state.dates[side] as DateSide).years.map((year) => (
//                 <SelectOptionTag className="dropdown-item" value={year}>
//                   {year}
//                 </SelectOptionTag>
//               ))}
//             </SelectTag>
//           </div>
//         </div>
//       </div>
//       <div className="next">
//         <div
//           className={`${isNextAvailable(side) ? "available" : "disabled"}`}
//           onClick={() => {
//             onClickNext(side);
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="24"
//             viewBox="0 -960 960 960"
//             width="24"
//             fill={`${isNextAvailable(side) ? null : "#e6e6e6"}`}
//           >
//             <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
//           </svg>
//         </div>
//       </div>
//     </>
//   );

//   const onCellClick = (item: ActiveItemSide, side: CALENDAR_SIDES) => {
//     const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
//     const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
//     const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
//     const minDate: number = moment(config.minDate, DEFAULT_DATE_FORMAT).valueOf();
//     const maxDate: number = moment(config.maxDate, DEFAULT_DATE_FORMAT).valueOf();

//     if (!item.available) {
//       if (date < minDate || date > maxDate) {
//         return;
//       }
//       state.dates[side] = generateCalendar(item.date, side);
//     }

//     if (endDate || date < startDate) {
//       config.endDate = null;
//       config.startDate = item.date;
//       state.activeItem.left = item;
//     } else if (!endDate && date < startDate) {
//       config.endDate = cloneDeep(config.startDate) as string;
//       state.activeItem.right = item;
//     } else {
//       config.endDate = item.date;
//       state.activeItem.right = item;
//     }

//     if (config.singleDatePicker) {
//       config.endDate = cloneDeep(config.startDate) as string;
//       state.activeItem.right = state.activeItem.left = item;
//     }

//     doApply();
//   };

//   const onCellMouseEnter = (item: ActiveItemSide, itemCell: React.MutableRefObject<any>) => {
//     if (!item.available) {
//       return;
//     }

//     const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
//     const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
//     const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
//     const hoverItemText: string = itemCell ? itemCell.current.innerText : "";
//     let hoverItemFirstDate: string = itemCell ? itemCell.current.getAttribute("firstday") : "";
//     let hoverItemLastDate: string = itemCell ? itemCell.current.getAttribute("lastday") : "";

//     hoverItemFirstDate = moment(hoverItemFirstDate, DEFAULT_DATE_FORMAT).format(
//       config.viewDateFormat,
//     );
//     hoverItemLastDate = moment(hoverItemLastDate, DEFAULT_DATE_FORMAT).format(
//       config.viewDateFormat,
//     );

//     let activeItemInputFieldText = `${hoverItemText} (${hoverItemFirstDate} - ${hoverItemLastDate})`;

//     if (config.type === DatetimeRangeType.daily) {
//       activeItemInputFieldText = `${hoverItemLastDate}`;
//     }

//     if (!endDate) {
//       const func = (rowItem: ActiveItemSide) => {
//         if (rowItem.available) {
//           const hoverItemDate = rowItem.date
//             ? moment(rowItem.date, DEFAULT_DATE_FORMAT).valueOf()
//             : moment(rowItem.date, DEFAULT_DATE_FORMAT).valueOf();
//           if ((hoverItemDate > startDate && hoverItemDate < date) || date === hoverItemDate) {
//             rowItem.inRange = true;
//             state.dateTitleText.right = activeItemInputFieldText;
//           }
//         }
//       };

//       service.iterateOverDateObj(state.dates, func.bind(this));
//     } else {
//       if (config.singleDatePicker) {
//         state.dateTitleText.right = activeItemInputFieldText;
//       } else {
//         state.dateTitleText.left = activeItemInputFieldText;
//       }
//     }
//   };

//   const onCellMouseLeave = () => {
//     if (!config.endDate) {
//       const func = (rowItem: ActiveItemSide) => {
//         rowItem.inRange = false;
//       };
//       service.iterateOverDateObj(state.dates, func.bind(this));
//     } else {
//       updateActiveItemInputField();
//     }
//   };

//   const getSelectedTimeItemText = (item: string, side: CALENDAR_SIDES) => {
//     if (item === "hour") {
//       return state.selectedHour[side];
//     } else if (item === "minute") {
//       return state.selectedMinute[side];
//     }
//   };

//   const onRangeClick = (rangeLabel: string, dateRangeModel: Options) => {
//     state.activeRange = rangeLabel;
//     if (rangeLabel === "Custom Range") {
//       state.customRange = true;
//     } else {
//       state.customRange = false;
//       config.startDate = dateRangeModel.startDate;
//       config.endDate = dateRangeModel.endDate;
//       if (config.timePicker) {
//         state.times = {};
//       }
//       setActiveItemOnRangeClick();
//     }
//   };

//   const setActiveItemOnRangeClick = () => {
//     updateActiveItem();
//     doApply();
//   };

//   const updateActiveItem = () => {
//     const startDate: ActiveItemSide = service.getFirstLastDay(
//       config.startDate as string,
//       config.type,
//     );
//     const endDate: ActiveItemSide = service.getFirstLastDay(config.endDate as string, config.type);

//     if (config.type === DatetimeRangeType.weekly) {
//       startDate.rowItemText = `W${service.getWeekNumber(startDate.firstDay)}`;
//       endDate.rowItemText = `W${service.getWeekNumber(endDate.firstDay)}`;
//     } else if (config.type === DatetimeRangeType.monthly) {
//       startDate.rowItemText = `${moment(startDate.firstDay, DEFAULT_DATE_FORMAT).format("MMM")}`;
//       endDate.rowItemText = `${moment(endDate.firstDay, DEFAULT_DATE_FORMAT).format("MMM")}`;
//     } else if (config.type === DatetimeRangeType.quarterly) {
//       startDate.rowItemText = `Quarter ${moment(
//         startDate.firstDay,
//         DEFAULT_DATE_FORMAT,
//       ).quarter()}`;
//       endDate.rowItemText = `Quarter ${moment(endDate.firstDay, DEFAULT_DATE_FORMAT).quarter()}`;
//     }

//     Object.assign(state.activeItem.left, startDate);
//     Object.assign(state.activeItem.right, endDate);

//     // doApply();
//   };

//   const onTimeApply = () => {
//     dateRangeSelected();
//     updateInputField();
//   };

//   return (
//     <div className="ngx-datetime-range-picker">
//       <div className="date-input">
//         <InputTag
//           ref={filterInputBox}
//           className={`dateSelect, ${config.inputClass || ""}`}
//           aria-label={config.ariaLabels?.inputField}
//           onClick={onComponentClick}
//           placeholder={config.placeholder}
//           value={state.selectedDateText}
//           onChange={onDateRangeInputChange}
//           onKeyUp={onCalendarClose}
//           onFocus={onFocusInput}
//           onBlur={onBlurInput}
//           disabled={config.componentDisabled}
//           autocomplete="off"
//           autocorrect="off"
//           readonly
//         />
//       </div>
//       {!!state.isCalendarVisible && (
//         <div className="calendar-view">
//           <div className="date-select">
//             <div style={{ position: "relative" }}>
//               {!!config.timezoneSupport && (
//                 <div className="list-inline timezone-select">
//                   <div className="timeZones">
//                     {state.timeZones.map((tz: TZ_MAP_KEYS, idx) => (
//                       <div
//                         className={`timezone ${
//                           idx === state.timeZones.length - 1 ? "border-separator" : ""
//                         } ${state.selectedTimezone === tz ? "active-timezone" : ""}`}
//                         onClick={() => {
//                           onTimezoneChange(tz);
//                         }}
//                       >
//                         {tz}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="currentTime">
//                     <span className="today-text">Today</span>:{" "}
//                     <span className="active-timezone">{state.todayTime}</span>
//                   </div>
//                 </div>
//               )}
//               <ul className="list-inline calendar-container">
//                 {state.sides.map((side, idx) => (
//                   <li className={`calendar ${side}`}>
//                     <div className="dateTitleInput">
//                       <InputTag
//                         type="text"
//                         className="dateSelect"
//                         value={state.dateTitleText[side]}
//                         readonly
//                       />
//                     </div>
//                     <div className="calendar-table">
//                       {state.calendarAvailable[side] && (
//                         <div
//                           className="calendar-side-container"
//                           style={{ minWidth: "250px", position: "relative" }}
//                         >
//                           <div className="calendar-label-container">
//                             {getCalendarLabelContent(side)}
//                           </div>
//                           <table>
//                             <thead>
//                               <tr>
//                                 {config.showRowNumber && <th className="rowNumber"></th>}
//                                 {state.weekDayOptions.map((day) => (
//                                   <th className="calendar-week-day capitalize">{day}</th>
//                                 ))}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {(state.dates[side] as DateSide).itemRows.map((row) => (
//                                 <tr>
//                                   {config.showRowNumber && row.rowNumberText && (
//                                     <td className="rowNumber">{row.rowNumberText}</td>
//                                   )}
//                                   {row.items.map((item) => (
//                                     <td
//                                       ref={itemCell}
//                                       data-firstday={item.firstDay}
//                                       data-lastday={item.lastDay}
//                                       className={`${
//                                         item.available ? "available" : ""
//                                       } ${item.inRange ? "in-range" : ""} ${
//                                         (state.activeStartDate == item.date && side == "left") ||
//                                         (state.activeEndDate == item.date && side == "right")
//                                           ? "active"
//                                           : ""
//                                       } ${item.today ? "today" : ""}`}
//                                       onClick={() => {
//                                         onCellClick(item, side);
//                                       }}
//                                       onMouseOver={() => {
//                                         onCellMouseEnter(item, itemCell);
//                                       }}
//                                       onMouseLeave={() => {
//                                         onCellMouseLeave();
//                                       }}
//                                     >
//                                       <div>{item.rowItemText}</div>
//                                     </td>
//                                   ))}
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//               {config.timePicker && (
//                 <ul className="list-inline time-picker-container">
//                   {state.sides.map((side, idx) => (
//                     <li className={`time-select ${side}`}>
//                       <div className="clock-icon-container">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           height="20"
//                           viewBox="0 -960 960 960"
//                           width="20"
//                         >
//                           <path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.376 0-149.188-30Q261-156 208.5-208.5T126-330.958q-30-69.959-30-149.5Q96-560 126-630t82.5-122q52.5-52 122.458-82 69.959-30 149.5-30 79.542 0 149.548 30.24 70.007 30.24 121.792 82.08 51.786 51.84 81.994 121.92T864-480q0 79.376-30 149.188Q804-261 752-208.5T629.869-126Q559.738-96 480-96Zm0-384Zm.477 312q129.477 0 220.5-91.5T792-480.477q0-129.477-91.023-220.5T480.477-792Q351-792 259.5-700.977t-91.5 220.5Q168-351 259.5-259.5T480.477-168Z" />
//                         </svg>
//                       </div>
//                       {state.timeItems.map((timeItem) => (
//                         <div className="d-inline-block time-item-container">
//                           <SelectTag
//                             className="timeItem-select ngx-datetime-range-picker-select-panel timeItem-select-panel"
//                             value={() => getSelectedTimeItemText(timeItem, side)}
//                             onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                               onTimeLabelChange(timeItem, side, e.target.value);
//                             }}
//                           >
//                             {(state.times[side] as TimeSide)[timeItem].map((item) => (
//                               <SelectOptionTag className="dropdown-item" value={item}>
//                                 {item}
//                               </SelectOptionTag>
//                             ))}
//                           </SelectTag>
//                         </div>
//                       ))}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             {((!config.singleDatePicker && config.showRanges) || config.timePicker) && (
//               <div className="ranges">
//                 {Object.keys(config.availableRanges).map((range) => (
//                   <ButtonTag
//                     className={`calendar-range ${
//                       range === state.activeRange ? "active-range" : ""
//                     }`}
//                     onClick={() => {
//                       onRangeClick(range, config.availableRanges[range]);
//                     }}
//                   >
//                     {range}
//                   </ButtonTag>
//                 ))}
//                 {config.timePicker && state.customRange && (
//                   <div
//                     className={`range-select-button-container ${
//                       Object.keys(config.availableRanges || {}).length > 0
//                         ? "range-select-button-bottom"
//                         : ""
//                     }`}
//                   >
//                     <ButtonTag
//                       className="range-select-button range-select-apply-button"
//                       onClick={() => {
//                         onTimeApply();
//                       }}
//                     >
//                       Apply
//                     </ButtonTag>
//                     <ButtonTag
//                       className="range-select-button range-select-cancel-button"
//                       onClick={() => {
//                         onTimeApply();
//                       }}
//                     >
//                       Cancel
//                     </ButtonTag>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DateTimeRangePicker;
