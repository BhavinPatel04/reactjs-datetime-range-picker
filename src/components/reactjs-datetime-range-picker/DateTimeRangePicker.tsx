import React, { type ElementType, useEffect, useRef, useState } from "react";
import moment, { type unitOfTime } from "moment";
import type {
  Options,
  Settings,
  State,
  RowItemVariables,
  RowOptions,
  RowItemOptions,
  DateSide,
  ActiveItemSide,
  DateCharacteristics,
  DateRangeModel,
  Config,
  TimeSide,
  DateRow,
  RowVariables,
  DateTimeRangeChangeOutput,
  DateTimeRangeModelChangeOutput,
  CalendarType,
} from "./interfaces";
import { NgxDatetimeRangePickerConstants as Constants, DEFAULT_DATE_FORMAT } from "./constants";
import { NgxDatetimeRangePickerService } from "./service";
import { cloneDeep, isEmpty, isNil, mergeDeep } from "./util";
import { type CALENDAR_SIDES, type SELECT_AS, type TIME_ITEM, type TZ_MAP_KEYS } from "./types";
import { DatetimeRangeType } from "./enum";
import Calendar from "./Calendar";
import "./DateTimeRangePicker.less";

enum InputFocusBlur {
  focus = 1,
  blur = 2,
}

const DEFAULT_TIME_FORMAT = Constants.DEFAULT.TIME_FORMAT;
const USA_TZ_CODE: TZ_MAP_KEYS = Constants.CONSTANT.USA_TZ_CODE;

export interface Props {
  options: Options;
  settings: Settings;
  dateRangeModel: DateRangeModel;
  canBeEmpty: boolean;
  dateRangeModelChange?: (options: Options | DateRangeModel) => void;
  dateRangeChanged?: (options: Options) => void;
  inputFocusBlur?: (options: Record<string, unknown>) => void;
  selectedDate?: (options: Options) => void;
  inputAs?: ElementType;
  selectAs?: SELECT_AS;
  buttonAs?: ElementType;
}

const service = new NgxDatetimeRangePickerService();

const DateTimeRangePicker: React.FC<Props> = ({
  options: userOptions,
  settings: userSettings,
  dateRangeModel: userDateRangeModel,
  canBeEmpty: userCanBeEmpty,
  dateRangeModelChange,
  dateRangeChanged,
  inputFocusBlur,
  selectedDate,
  inputAs: InputTag = "input",
  selectAs,
  buttonAs,
}: Props) => {
  const [state, setState] = useState({} as State);
  const [options, setOptions] = useState({} as Options);
  const [settings, setSettings] = useState({} as Settings);
  const [config, setConfig] = useState({} as Config);
  const [dateRangeModel, setDateRangeModel] = useState({} as DateRangeModel);
  const [canBeEmpty, setCanBeEmpty] = useState(false);
  const filterInputBox = useRef<HTMLInputElement>(null);

  const onCalendarClose = (): void => {
    if (config.startDate && config.endDate) {
      if (filterInputBox) {
        filterInputBox.current?.classList.remove("empty-filter");
      }
      setState({
        ...state,
        isCalendarVisible: false,
      });
    } else {
      // filterInputBox.nativeElement.classList.add('empty-filter');
    }
  };

  const init = (
    userCanBeEmpty: boolean,
    userOptions: Options,
    userSettings: Settings,
    userDateRangeModel: DateRangeModel,
  ): void => {
    // canBeEmpty
    setCanBeEmpty(userCanBeEmpty);

    // settings
    const _settings = mergeDeep(service.getDefaultSettings(), settings, userSettings);
    service.checkSettingsValidity(userSettings);

    // options
    const _options = mergeDeep(service.getDefaultOptions(), options, userOptions);

    // dateRangeModel
    let _dateRangeModel: DateRangeModel = cloneDeep(userDateRangeModel) as DateRangeModel;
    if (config.type) {
      const previousValue: Options | undefined = dateRangeModel[config.type];
      const currentValue: Options | undefined = _dateRangeModel[config.type];
      if (
        previousValue &&
        currentValue &&
        previousValue.startDate === currentValue.startDate &&
        previousValue.endDate === currentValue.endDate
      ) {
        return;
      }
    }

    let _config: Config =
      Object.keys(config).length > 0
        ? (cloneDeep(config) as Config)
        : Object.assign(_options, _settings);
    let _state: State = Object.assign(service.getDefaultState(), state);
    _state.isValidFilter = false;
    const parsedData = parseOptions(_options, _settings, _state, _config, _dateRangeModel);
    _state = parsedData.state;
    _config = parsedData.config;
    _dateRangeModel = parsedData.dateRangeModel;
    _state = updateInputField(_state, _config);

    setSettings(_settings);
    setOptions(_options);
    setDateRangeModel(Object.assign(dateRangeModel, _dateRangeModel));
    setConfig(Object.assign(config, _config));
    setState(Object.assign(service.getDefaultState(), _state));
  };

  const parseOptions = (
    __options: Options,
    __settings: Settings,
    _state: State,
    _config: Config,
    userDateRangeModel: DateRangeModel,
  ): {
    config: Config;
    state: State;
    dateRangeModel: DateRangeModel;
  } => {
    let _options: Options = cloneDeep(__options) as Options;
    let _settings: Settings = cloneDeep(__settings) as Settings;
    let _dateRangeModel: DateRangeModel = cloneDeep(userDateRangeModel) as DateRangeModel;
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
            [k]: settings[k as keyof Settings],
          };
        } else {
          console.warn(`WARN_NGX_DATETIME_RANGE_PICKER:
            'settings.${k}' is undefined or null. Setting default value.
          `);
        }
      });
    }

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

    const combinedConfig = { ..._options, ..._settings, ..._config };

    const timeZoneInfo = selectTimeZone(_state, combinedConfig);
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
    _dateRangeModel = getDateRangeModel(sanitizedDatesConfig.inputDateFormat);
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

  const selectTimeZone = (
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
      _state.selectedTimezone = state.localTimezone;
    }
    _state.todayTime = service.getZoneToday(_state.selectedTimezone, config.viewDateFormat ?? "");
    return {
      config: _config,
      state: _state,
    };
  };

  const populateDateAndTime = (_state: State, _config: Config): State => {
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

  const sanitizeDates = (__config: Config): Config => {
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

  const processDateRangeModel = (
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
      const _optionsKeys: string[] = Object.keys(service.getDefaultOptions());
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

    const dateRangeMinDate: string = (_dateRangeModel[_config.type!]!.minDate ??
      _config.minDate ??
      "") as string;
    const dateRangeMaxDate: string = (_dateRangeModel[_config.type!]!.maxDate ??
      _config.maxDate ??
      "") as string;
    const dateRangeStartDate: string = (_dateRangeModel[_config.type!]!.startDate ??
      _config.startDate ??
      "") as string;
    const dateRangeEndDate: string = (_dateRangeModel[_config.type!]!.endDate ??
      _config.endDate ??
      "") as string;

    _config.minDate = service.formatDateToDefaultFormat(
      dateRangeMinDate,
      _config.inputDateFormat ?? "",
    );
    _config.maxDate = service.formatDateToDefaultFormat(
      dateRangeMaxDate,
      _config.inputDateFormat ?? "",
    );
    _config.startDate = service.formatDateToDefaultFormat(
      dateRangeStartDate,
      _config.inputDateFormat ?? "",
    );
    _config.endDate = service.formatDateToDefaultFormat(
      dateRangeEndDate,
      _config.inputDateFormat ?? "",
    );

    if (_config.timePicker) {
      const dateRangeMinTime: string =
        _dateRangeModel[_config.type!]!.minTime ?? _config.minTime ?? "";
      const dateRangeMaxTime: string =
        _dateRangeModel[_config.type!]!.maxTime ?? _config.maxTime ?? "";
      const dateRangeStartTime: string =
        _dateRangeModel[_config.type!]!.startTime ?? _config.startTime ?? "";
      const dateRangeEndTime: string =
        _dateRangeModel[_config.type!]!.endTime ?? _config.endTime ?? "";

      _config.minTime = service.formatTimeToDefaultFormat(dateRangeMinTime)!;
      _config.maxTime = service.formatTimeToDefaultFormat(dateRangeMaxTime)!;
      _config.startTime = service.formatTimeToDefaultFormat(dateRangeStartTime)!;
      _config.endTime = service.formatTimeToDefaultFormat(dateRangeEndTime)!;
    }
    return {
      config: _config,
      dateRangeModel: _dateRangeModel,
    };
  };

  const handleDateArray = (_config: Config): Config => {
    if (_config.dateArray?.length) {
      // converts all the dates to DEFAULT_DATE_FORMAT
      _config.dateArray = service.getSanitizedDateArray(_config);

      // sort in asc order
      _config.dateArray = _config.dateArray.sort((date1, date2) => {
        const value1: number = moment(date1 as string, DEFAULT_DATE_FORMAT).valueOf();
        const value2: number = moment(date2 as string, DEFAULT_DATE_FORMAT).valueOf();
        return value1 - value2;
      });
    }
    return _config;
  };

  const processRanges = (_config: Config, __state: State): State => {
    let _state: State = cloneDeep(__state) as State;
    if (_config.showRanges && !_config.singleDatePicker) {
      _config.availableRanges = service.createDefaultRanges(_config);
      _state = selectActiveRange(_state, _config);
    } else {
      _state.activeRange = "Custom Range";
      _state = updateRange(_config, _state, _state.activeRange, null);
      _state = updateActiveItem(_config, _state);
    }
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

  const updateCalendar = (_state: State, _config: Config): State => {
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

  useEffect(() => {
    init(userCanBeEmpty, userOptions, userSettings, userDateRangeModel);
  }, [userCanBeEmpty, userOptions, userSettings, userDateRangeModel]);

  useEffect(() => {
    document.addEventListener("click", (event: MouseEvent) => {
      if (
        state.isCalendarVisible &&
        event.target &&
        !(event.target as HTMLElement)?.parentElement?.getElementsByClassName(
          "ngx-datetime-range-picker-select-panel",
        ).length &&
        !(event.target as HTMLElement)?.closest(".mat-mdc-option")
        // this.element.nativeElement !== event.target &&
        // !this.element.nativeElement.contains(event.target)
      ) {
        onCalendarClose();
      }
    });
  }, []);

  const onComponentClick = (): void => {
    setState({
      ...state,
      isCalendarVisible: !state.isCalendarVisible,
    });
  };

  const onFocusInput = (event: MouseEvent | FocusEvent): void => {
    inputFocusBlur &&
      inputFocusBlur({
        reason: InputFocusBlur.focus,
        value: (event.target as HTMLInputElement).value,
      });
  };

  const onBlurInput = (event: MouseEvent | FocusEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    setState({
      ...state,
      selectedDateText: value,
    });
    inputFocusBlur &&
      inputFocusBlur({
        reason: InputFocusBlur.blur,
        value,
      });
  };

  const onDateRangeInputChange = (value: string): void => {
    dateRangeSelected();
  };

  const dateRangeSelected = (): void => {
    const dateRangeModel: DateTimeRangeChangeOutput = getNgxDatetimeRangeChangeOutput();
    setState({
      ...state,
      isCalendarVisible: false,
    });
    if (filterInputBox) {
      filterInputBox.current?.classList.remove("empty-filter");
    }
    doDateRangeModelChange();
    dateRangeChanged && dateRangeChanged(dateRangeModel);
  };

  const doDateRangeModelChange = (): void => {
    const dateRangeModel: DateTimeRangeModelChangeOutput = getDateRangeModel(
      config.inputDateFormat,
    );
    dateRangeModelChange && dateRangeModelChange(dateRangeModel);
  };

  const getDateRangeModel = (format?: string): DateTimeRangeModelChangeOutput => {
    let dRModel: DateTimeRangeModelChangeOutput = {};
    if (undefined !== dateRangeModel && !isEmpty(dateRangeModel)) {
      dRModel = cloneDeep(dateRangeModel) as DateTimeRangeModelChangeOutput;
    }
    if (config.type) {
      dRModel[config.type] = getNgxDatetimeRangeChangeOutput(format);
    }
    return dRModel;
  };

  const getNgxDatetimeRangeChangeOutput = (format?: string): DateTimeRangeChangeOutput => {
    let dateRangeChangeOutput: DateTimeRangeChangeOutput;
    let outputDateFormat: string = config.outputDateFormat!;
    if (undefined !== format) {
      outputDateFormat = format;
    }
    let startDate = service.formatStartDate(config, outputDateFormat);
    let endDate = moment(config.endDate, DEFAULT_DATE_FORMAT).format(outputDateFormat);

    if (config.selectedTimezone) {
      startDate = service.formatToZoneDate(config.selectedTimezone, outputDateFormat, startDate);
      endDate = service.formatToZoneDate(config.selectedTimezone, outputDateFormat, endDate);
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

  const parseOptionsToDefaultDateFormat = (_config: Config): Config => {
    _config.minDate = service.formatDateToDefaultFormat(_config.minDate!, _config.inputDateFormat!);
    _config.maxDate = service.formatDateToDefaultFormat(_config.maxDate!, _config.inputDateFormat!);
    _config.startDate = service.formatDateToDefaultFormat(
      _config.startDate!,
      _config.inputDateFormat!,
    );
    _config.endDate = service.formatDateToDefaultFormat(_config.endDate!, _config.inputDateFormat!);

    if (_config.timePicker) {
      _config.minTime = service.formatTimeToDefaultFormat(_config.minTime!)!;
      _config.maxTime = service.formatTimeToDefaultFormat(_config.maxTime!)!;
      _config.startTime = service.formatTimeToDefaultFormat(_config.startTime!)!;
      _config.endTime = service.formatTimeToDefaultFormat(_config.endTime!)!;
    }
    return _config;
  };

  const doApply = (): void => {
    let _state: State = cloneDeep(state) as State;
    const _config: Config = cloneDeep(config) as Config;
    const startDate = config.startDate;
    const endDate = config.endDate;

    _state.activeStartDate = startDate as string;
    _state.activeEndDate = endDate as string;

    if (config.startDate && config.endDate) {
      if (!config.timePicker) {
        dateRangeSelected();
      } else {
        if (config.timePicker) {
          _state.sides.forEach((side) => {
            const generatedTimePicker = generateTimePicker(_state, _config, null, side);
            _state = generatedTimePicker.state;
            _state.times[side] = generatedTimePicker.timeObject;
          });
        }
      }
    }

    let outputStartDate: number | null = startDate
      ? moment(startDate, DEFAULT_DATE_FORMAT).valueOf()
      : null;
    let outputEndDate: number | null = endDate
      ? moment(endDate, DEFAULT_DATE_FORMAT).valueOf()
      : null;
    if (config.outputDateFormat) {
      outputStartDate = startDate
        ? Number(moment(startDate, DEFAULT_DATE_FORMAT).format(config.outputDateFormat))
        : null;
      outputEndDate = endDate
        ? Number(moment(endDate, DEFAULT_DATE_FORMAT).format(config.outputDateFormat))
        : null;
    }
    selectedDate &&
      selectedDate({
        startDate: outputStartDate!,
        endDate: outputEndDate!,
      });

    _config.startTime = `${_state.selectedHour.left as string}:${
      _state.selectedMinute.left as string
    }`;
    _config.endTime = `${_state.selectedHour.right as string}:${
      _state.selectedMinute.right as string
    }`;

    setState(_state);
    setConfig(_config);
    updateInputField(_state, config);
  };

  const updateInputField = (_state: State, _config: Config): State => {
    let internalState: State = cloneDeep(_state) as State;
    const startDate = service.formatStartDate(_config, _config.viewDateFormat!);
    const endDate = _config.endDate
      ? moment(_config.endDate, DEFAULT_DATE_FORMAT).format(_config.viewDateFormat)
      : "";

    if (_config.singleDatePicker) {
      let startDateText = startDate;
      let endDataText = endDate;
      let dateText = "";

      if (_config.timePicker) {
        startDateText = `${startDate} ${_config.startTime}`;
        endDataText = `${endDate} ${_config.endTime}`;
      }
      if (_config.displayBeginDate) {
        dateText = `${startDateText}`;
      } else if (_config.displayEndDate) {
        dateText = `${endDataText}`;
      } else {
        dateText = `${startDateText} - ${endDataText}`;
      }

      internalState.selectedDateText = dateText;
    } else {
      let startDateText = startDate;
      let endDataText = endDate;

      if (_config.timePicker) {
        startDateText = `${startDate} ${_config.startTime}`;
        endDataText = `${endDate} ${_config.endTime}`;
      }

      internalState.selectedDateText = `${startDateText} - ${endDataText}`;
    }

    if (canBeEmpty || !internalState.selectedDateText.includes("nvalid")) {
      internalState.isValidFilter = true;
    }

    if (_config.type === "yearly") {
      internalState.dateTitleText.left = `${startDate}`;
      internalState.dateTitleText.right = `${endDate}`;
    } else {
      internalState = updateActiveItemInputField(internalState, _config);
    }
    return internalState;
  };

  const updateActiveItemInputField = (__state: State, _config: Config): State => {
    let _state: State = cloneDeep(__state) as State;
    if (!_config.singleDatePicker) {
      _state = updateSide(_state, _config, "left");
    }
    _state = updateSide(_state, _config, "right");
    return _state;
  };

  const updateSide = (_state: State, _config: Config, side: CALENDAR_SIDES): State => {
    const internalState: State = cloneDeep(_state) as State;
    let itemFirstDate = (internalState.activeItem[side] as ActiveItemSide).firstDay;
    let itemLastDate = (internalState.activeItem[side] as ActiveItemSide).lastDay;
    const itemText = (internalState.activeItem[side] as ActiveItemSide).rowItemText;
    itemFirstDate = moment(itemFirstDate, DEFAULT_DATE_FORMAT).format(_config.viewDateFormat);
    itemLastDate = moment(itemLastDate, DEFAULT_DATE_FORMAT).format(_config.viewDateFormat);
    if (_config.type !== "daily") {
      internalState.dateTitleText[side] = `${itemText} (${itemFirstDate} - ${itemLastDate})`;
    } else {
      internalState.dateTitleText[side] = `${itemFirstDate}`;
    }
    return internalState;
  };

  const onCalendarLabelChange = (label: string, side: CALENDAR_SIDES, type: string): void => {
    let stateCopy: State = cloneDeep(state) as State;
    const _config: Config = cloneDeep(config) as Config;
    stateCopy.isCalendarVisible = true;
    if (type === "month") {
      stateCopy.selectedMonth[side] = label;
    } else if (type === "year") {
      stateCopy.selectedYear[side] = Number(label);
    }

    if (_config.type !== "daily") {
      stateCopy.selectedMonth[side] = "Jun";
    }

    if (_config.type !== "yearly") {
      const selectedMonth = `${stateCopy.selectedMonth[side] as string} ${
        stateCopy.selectedYear[side] as string
      }`;
      const date: string = moment(selectedMonth, "MMM YYYY")
        .startOf("month")
        .format(DEFAULT_DATE_FORMAT);
      const generatedCalendarState = generateCalendar(stateCopy, _config, date, side);
      stateCopy = generatedCalendarState;
    } else {
      if (stateCopy.selectedYear.left! <= stateCopy.selectedYear.right! && side === "right") {
        _config.startDate = moment(stateCopy.selectedYear.left as number, "YYYY")
          .startOf("year")
          .format(DEFAULT_DATE_FORMAT);
        _config.endDate = moment(stateCopy.selectedYear.right as number, "YYYY")
          .endOf("year")
          .format(DEFAULT_DATE_FORMAT);

        doApply();
      }
      const internalConfig: Config = {
        startDate: moment(stateCopy.selectedYear.left as number, "YYYY")
          .startOf("year")
          .format(DEFAULT_DATE_FORMAT),
        type: "yearly",
      };
      const startDate: string = service.formatStartDate(internalConfig, config.viewDateFormat!);
      const endDate: string = config.endDate
        ? moment(config.endDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat)
        : "";
      stateCopy.dateTitleText.left = `${startDate}`;
      stateCopy.dateTitleText.right = `${endDate}`;
    }
    setState(stateCopy);
    setConfig(_config);
  };

  const onTimeLabelChange = (
    _state: State,
    _config: Config,
    timeItem: TIME_ITEM,
    side: CALENDAR_SIDES,
    item: string,
  ): {
    state: State;
    config: Config;
  } => {
    // let _state: State = cloneDeep(state) as State;
    let time = null;
    if (side === "left") {
      time = _config.startTime!.split(":");
      if (timeItem === "hour") {
        _config.startTime = `${item}:${time[1]}`;
      } else {
        _config.startTime = `${time[0]}:${item}`;
      }

      const startDateEpoch: number = moment(_config.startDate, DEFAULT_DATE_FORMAT).valueOf();
      const endDateEpoch: number = moment(_config.endDate, DEFAULT_DATE_FORMAT).valueOf();
      if (startDateEpoch === endDateEpoch) {
        const generatedTimePicker = generateTimePicker(_state, _config, _config.startTime, "right");
        _state = generatedTimePicker.state;
        _state.times.right = generatedTimePicker.timeObject;
      }
    } else {
      time = _config.endTime!.split(":");
      if (timeItem === "hour") {
        _config.endTime = `${item}:${time[1]}`;
      } else {
        _config.endTime = `${time[0]}:${item}`;
      }
    }

    if (timeItem === "hour") {
      _state.selectedHour[side] = service.convertToViewTimeItem(item);
    } else {
      _state.selectedMinute[side] = service.convertToViewTimeItem(item);
    }

    _config.startTime = `${_state.selectedHour.left as string}:${
      _state.selectedMinute.left as string
    }`;
    _config.endTime = `${_state.selectedHour.right as string}:${
      _state.selectedMinute.right as string
    }`;

    return {
      state: _state,
      config: _config,
    };
  };

  const generateCalendar = (
    _state: State,
    _config: Config,
    date: string | number,
    side: CALENDAR_SIDES,
  ): State => {
    const stateCopy: State = cloneDeep(_state) as State;
    stateCopy.selectedMonth[side] = moment(date, DEFAULT_DATE_FORMAT).format("MMM");
    stateCopy.selectedYear[side] = service.getSelectedYear(date);
    const calendarLabel = `${stateCopy.selectedMonth[side] as string} ${
      stateCopy.selectedYear[side] as string
    }`;

    const dates: DateSide = {
      label: calendarLabel,
      months: service.getMonthsAvailable(
        _config.minDate as string,
        _config.maxDate as string,
        stateCopy.selectedYear[side] as number,
      ),
      years: service.getYearsAvailable(_config),
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
        numberOfRows = service.getNumberOfWeeks(date as string)!;
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
          type: _config.type!,
          monthStartWeekNumber,
          dateRows,
          year: stateCopy.selectedYear[side] as string,
          itemCount: null,
        };

        const { rowNumber, columns }: RowVariables = service.getCalendarRowVariables(rowOptions);

        dateRowObj.rowNumber = rowNumber;
        dateRowObj.rowNumberText = service.getCalendarRowNumberText(
          _config.type!,
          Number(rowNumber),
        )!;

        for (let rowItem = 0; rowItem <= columns; rowItem++) {
          const rowItemOptions: RowItemOptions = {
            type: _config.type!,
            monthStartWeekNumber,
            dateRows,
            rowNumber,
            yearStartDate,
            year: stateCopy.selectedYear[side] as number,
            rowItem,
            columns,
          };

          const { currentItemDate, rowItemText, firstDay, lastDay, itemCount }: RowItemVariables =
            service.getCalendarRowItemVariables(rowItemOptions);

          rowOptions.itemCount = itemCount;

          const { available, inRange, active, today }: DateCharacteristics =
            service.getDateCharacteristics(
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
          if (service.isRowIemValid(rowOptions)) {
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

    // generate month/year select
    setTimeout(() => {
      const options: {
        type: string;
        side: string;
        items: string[];
        selected: string;
        onChange: (label: string, side: CALENDAR_SIDES, type: string) => void;
      } = {
        side,
        onChange: onCalendarLabelChange.bind(this),
        type: "month",
        items: dates.months!,
        selected: stateCopy.selectedMonth[side] as string,
      };
      printSelect(options);

      options.type = "year";
      options.items = dates.years;
      options.selected = stateCopy.selectedYear[side] as string;
      printSelect(options);
    });

    stateCopy.dates[side] = dates;
    return stateCopy;
  };

  const printSelect = (options: {
    type: string;
    side: string;
    items: string[];
    selected: string;
    onChange: (label: string, side: CALENDAR_SIDES, type: string) => void;
  }): void => {
    let optionHTML = "";
    options.items.forEach((item) => {
      optionHTML += `
        <option
          class="dropdown-item"
          value=${item}
          selected=${options.selected === item}
        >
          ${item}
        </option>
      `;
    });

    const selectEl = `
      <select
        class="${options.type}-select ngx-datetime-range-picker-select-panel ${options.type}-select-panel">
        ${optionHTML}
      </select>
    `;

    const selectContainerEl = document.getElementById(`${options.type}Select`);
    if (selectContainerEl) {
      selectContainerEl.innerHTML = selectEl;
      selectContainerEl.getElementsByTagName("select")[0].addEventListener("change", (e) => {
        // options.onChange(e, options.side as CALENDAR_SIDES, options.type);
      });
    }
  };

  const generateTimePicker = (
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
      const stringified_h = service.convertToViewTimeItem(h);
      timeObject.hour.push(stringified_h);
    }
    for (let m = startMinute; m <= 59; m++) {
      const stringified_m = service.convertToViewTimeItem(m);
      timeObject.minute.push(stringified_m);
    }

    _state.selectedHour[side] = service.convertToViewTimeItem(selectedHour);
    _state.selectedMinute[side] = service.convertToViewTimeItem(selectedMinute);

    // generate hour/minute select
    setTimeout(() => {
      const options: {
        type: string;
        side: string;
        items: string[];
        selected: string;
        onChange: (
          _state: State,
          _config: Config,
          timeItem: TIME_ITEM,
          side: CALENDAR_SIDES,
          item: string,
        ) => void;
      } = {
        side,
        onChange: onTimeLabelChange.bind(this),
        type: "hour",
        items: timeObject.hour,
        selected: _state.selectedHour[side] as string,
      };
      // printSelect(options);

      options.type = "minute";
      options.items = timeObject.minute;
      options.selected = _state.selectedMinute[side] as string;
      // printSelect(options);
    });

    return {
      state: _state,
      timeObject,
    };
  };

  const updateRange = (
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

  const updateActiveItem = (_config: Config, _state: State): State => {
    const startDate: ActiveItemSide = service.getFirstLastDay(
      _config.startDate as string,
      _config.type!,
    );
    const endDate: ActiveItemSide = service.getFirstLastDay(
      _config.endDate as string,
      _config.type!,
    );

    if (_config.type === DatetimeRangeType.weekly) {
      startDate.rowItemText = `W${service.getWeekNumber(startDate.firstDay!)}`;
      endDate.rowItemText = `W${service.getWeekNumber(endDate.firstDay!)}`;
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

  return (
    <div className="ngx-datetime-range-picker">
      <div className="date-input">
        <InputTag
          ref={filterInputBox}
          className={`dateSelect, ${config.inputClass ?? ""}`}
          aria-label={config.ariaLabels?.inputField}
          onClick={onComponentClick}
          placeholder={config.placeholder}
          value={state.selectedDateText}
          onChange={onDateRangeInputChange}
          onKeyUp={onCalendarClose}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          disabled={config.componentDisabled}
          autoComplete="off"
          autoCorrect="off"
          readOnly={true}
        />
      </div>
      {!!state.isCalendarVisible && (
        <Calendar
          config={config}
          state={state}
          selectAs={selectAs}
          buttonAs={buttonAs}
          service={service}
          generateCalendar={generateCalendar}
          dateRangeSelected={dateRangeSelected}
          setState={setState}
          updateInputField={updateInputField}
          doApply={doApply}
          updateActiveItemInputField={updateActiveItemInputField}
          updateRange={updateRange}
          updateActiveItem={updateActiveItem}
          onCalendarLabelChange={onCalendarLabelChange}
          onTimeLabelChange={onTimeLabelChange}
        />
      )}
    </div>
  );
};

export default DateTimeRangePicker;
