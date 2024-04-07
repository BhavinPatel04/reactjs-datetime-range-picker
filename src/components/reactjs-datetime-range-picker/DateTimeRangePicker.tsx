import React, { type ElementType, useEffect, useRef, useState } from "react";
import moment from "moment";
import type {
  Options,
  Settings,
  State,
  ActiveItemSide,
  DateRangeModel,
  Config,
  DateTimeRangeChangeOutput,
  DateTimeRangeModelChangeOutput,
  AriaLabelsOptions,
} from "./interfaces";
import {
  INPUT_AS,
  type CALENDAR_SIDES,
  type SELECT_AS,
  type TIME_ITEM,
  BUTTON_AS,
  DATETIME_RANGE_TYPE,
  TZ_MAP_KEYS,
} from "./types";
import { DatetimeRangeType, InputFocusBlur } from "./enum";
import {
  cloneDeep,
  mergeDeep,
  getDateRangeModel,
  getDefaultSettings,
  checkSettingsValidity,
  getDefaultOptions,
  getDefaultState,
  parseOptions,
  getNgxDatetimeRangeChangeOutput,
  generateCalendar,
  generateTimePicker,
  convertToViewTimeItem,
  formatStartDate,
  getCombinedConfig,
} from "./util";
import { DEFAULT_DATE_FORMAT } from "./constants";
import Calendar from "./Calendar";
import "./DateTimeRangePicker.less";

export interface Props {
  // options: Options;
  // settings: Settings;
  dateArray?: any[];
  startDate?: string | number;
  endDate?: string | number;
  minDate?: string | number;
  maxDate?: string | number;
  startTime?: string;
  endTime?: string;
  minTime?: string;
  maxTime?: string;
  type?: DATETIME_RANGE_TYPE;
  modelKeys?: string[];
  useLocalTimezone?: boolean;
  showTimezoneSelect?: boolean;
  timePicker?: boolean;
  timezoneSupport?: boolean;
  defaultTimezone?: TZ_MAP_KEYS;
  inputClass?: string;
  inputDateFormat?: string;
  viewDateFormat?: string;
  outputDateFormat?: string;
  singleDatePicker?: boolean;
  componentDisabled?: boolean;
  label?: string;
  placeholder?: string;
  showRowNumber?: boolean;
  availableRanges?: Record<string, any>;
  showRanges?: boolean;
  disableWeekends?: boolean;
  disableWeekdays?: boolean;
  displayBeginDate?: boolean;
  displayEndDate?: boolean;
  ariaLabels?: AriaLabelsOptions;
  dateRangeModel: DateRangeModel;
  canBeEmpty: boolean;
  dateRangeModelChange?: (options: Options | DateRangeModel) => void;
  dateRangeChanged?: (options: Options) => void;
  inputFocusBlur?: (options: Record<string, unknown>) => void;
  onSelectedDate?: (options: Options) => void;
  inputAs?: INPUT_AS;
  selectAs?: SELECT_AS;
  buttonAs?: BUTTON_AS;
}

const DateTimeRangePicker: React.FC<Props> = ({
  dateArray,
  startDate,
  endDate,
  minDate,
  maxDate,
  startTime,
  endTime,
  minTime,
  maxTime,
  type = DatetimeRangeType.daily,
  modelKeys,
  useLocalTimezone,
  showTimezoneSelect,
  timePicker,
  timezoneSupport,
  defaultTimezone,
  inputClass,
  inputDateFormat,
  viewDateFormat,
  outputDateFormat,
  singleDatePicker,
  componentDisabled,
  label,
  placeholder,
  showRowNumber,
  availableRanges,
  showRanges,
  disableWeekends,
  disableWeekdays,
  displayBeginDate,
  displayEndDate,
  ariaLabels,
  dateRangeModel: userDateRangeModel,
  canBeEmpty: userCanBeEmpty,
  dateRangeModelChange,
  dateRangeChanged,
  inputFocusBlur,
  onSelectedDate,
  inputAs,
  selectAs,
  buttonAs,
}: Props) => {
  const InputTag: ElementType = inputAs?.tag ?? "input";

  const [state, setState] = useState({} as State);
  const [options, setOptions] = useState({} as Options);
  const [settings, setSettings] = useState({} as Settings);
  const [config, setConfig] = useState({} as Config);
  const [dateRangeModel, setDateRangeModel] = useState({} as DateRangeModel);
  const [canBeEmpty, setCanBeEmpty] = useState(false);
  const filterInputBox = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onCalendarClose = (): void => {
    if (config.startDate && config.endDate) {
      if (filterInputBox) {
        filterInputBox.current?.classList.remove("empty-filter");
      }
      let _state: State = cloneDeep(state) as State;
      _state = updateInputField(_state, config);
      // setState({
      //   ..._state,
      //   isCalendarVisible: false,
      // });
      dateRangeSelected(_state, config);
      updateInputField(_state, config);
    }
  };

  const init = (
    userCanBeEmpty: boolean,
    userDateRangeModel: DateRangeModel,
    dateArray?: any[],
    startDate?: string | number,
    endDate?: string | number,
    minDate?: string | number,
    maxDate?: string | number,
    startTime?: string,
    endTime?: string,
    minTime?: string,
    maxTime?: string,
    type?: DATETIME_RANGE_TYPE,
    modelKeys?: string[],
    useLocalTimezone?: boolean,
    showTimezoneSelect?: boolean,
    timePicker?: boolean,
    timezoneSupport?: boolean,
    defaultTimezone?: TZ_MAP_KEYS,
    inputClass?: string,
    inputDateFormat?: string,
    viewDateFormat?: string,
    outputDateFormat?: string,
    singleDatePicker?: boolean,
    componentDisabled?: boolean,
    label?: string,
    placeholder?: string,
    showRowNumber?: boolean,
    availableRanges?: Record<string, any>,
    showRanges?: boolean,
    disableWeekends?: boolean,
    disableWeekdays?: boolean,
    displayBeginDate?: boolean,
    displayEndDate?: boolean,
    ariaLabels?: AriaLabelsOptions,
  ): void => {
    // canBeEmpty
    setCanBeEmpty(userCanBeEmpty);

    // settings
    const userSettings: Settings = {
      type: type ?? DatetimeRangeType.daily,
      modelKeys,
      useLocalTimezone,
      showTimezoneSelect,
      timePicker,
      timezoneSupport,
      defaultTimezone,
      inputClass,
      inputDateFormat,
      viewDateFormat,
      outputDateFormat,
      singleDatePicker,
      componentDisabled,
      label,
      placeholder,
      showRowNumber,
      availableRanges,
      showRanges,
      disableWeekends,
      disableWeekdays,
      displayBeginDate,
      displayEndDate,
      ariaLabels,
    };
    const _settings: Settings = mergeDeep(getDefaultSettings(), settings, userSettings) as Settings;
    checkSettingsValidity(userSettings);

    // options
    const userOptions: Options = {
      dateArray,
      startDate,
      endDate,
      minDate,
      maxDate,
      startTime,
      endTime,
      minTime,
      maxTime,
    };
    const _options = mergeDeep(getDefaultOptions(), options, userOptions);

    // dateRangeModel
    const _dateRangeModel: DateRangeModel = cloneDeep(userDateRangeModel) as DateRangeModel;
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
        : (Object.assign(_options, _settings) as Config);
    const _state: State = Object.assign(getDefaultState(), state);
    _state.isValidFilter = false;
    _config = getCombinedConfig(_options, _settings, _config);
    // setConfig(_config);
    setSettings(_settings);
    setOptions(_options);
    initialize(_state, _config, _dateRangeModel);
  };

  const initialize = (_state: State, _config: Config, _dateRangeModel: DateRangeModel): void => {
    let internalState: State = cloneDeep(_state) as State;
    let internalConfig: Config = cloneDeep(_config) as Config;
    let internalDateRangeModel: DateRangeModel = cloneDeep(_dateRangeModel) as DateRangeModel;
    const parsedData = parseOptions(internalState, internalConfig, internalDateRangeModel);
    internalState = parsedData.state;
    internalConfig = parsedData.config;
    internalDateRangeModel = parsedData.dateRangeModel;
    internalState = updateInputField(internalState, internalConfig);

    setDateRangeModel(Object.assign(dateRangeModel, internalDateRangeModel));
    setConfig(Object.assign(config, internalConfig));
    setState(Object.assign(getDefaultState(), internalState));
  };

  const onComponentClick = (): void => {
    const internalState: State = cloneDeep(state) as State;
    internalState.isCalendarVisible = !state.isCalendarVisible;
    if (!internalState.isCalendarVisible) {
      onCalendarClose();
    } else {
      setState(internalState);
      initialize(internalState, config, dateRangeModel);
    }
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
    dateRangeSelected(state, config);
  };

  const dateRangeSelected = (__state: State, __config: Config): void => {
    const dateRangeOuput: DateTimeRangeChangeOutput = getNgxDatetimeRangeChangeOutput(
      __config,
      __state,
    );
    if (filterInputBox) {
      filterInputBox.current?.classList.remove("empty-filter");
    }
    doDateRangeModelChange();
    dateRangeChanged && dateRangeChanged(dateRangeOuput);
    setState({
      ...__state,
      isCalendarVisible: false,
    });
    setDateRangeModel(
      mergeDeep(dateRangeModel, {
        [config.type]: {
          startDate: dateRangeOuput.startDate,
          endDate: dateRangeOuput.endDate,
          startTime: dateRangeOuput.startTime,
          endTime: dateRangeOuput.endTime,
        },
      }),
    );
  };

  const doDateRangeModelChange = (): void => {
    const changedDateRangeModel: DateTimeRangeModelChangeOutput = getDateRangeModel(
      config,
      state,
      dateRangeModel,
      config.inputDateFormat,
    );
    dateRangeModelChange && dateRangeModelChange(changedDateRangeModel);
  };

  const doApply = (
    __state: State,
    __config: Config,
  ): {
    state: State;
    config: Config;
  } => {
    const { _state, _config } = handleDateChange(__state, __config);
    const updatedState: State = updateInputField(_state, _config);
    return {
      state: updatedState,
      config: _config,
    };
  };

  const handleDateChange = (
    __state: State,
    __config: Config,
  ): {
    _state: State;
    _config: Config;
  } => {
    let _state: State = cloneDeep(__state) as State;
    const _config: Config = cloneDeep(__config) as Config;
    const startDate = _config.startDate;
    const endDate = _config.endDate;

    _state.activeStartDate = startDate as string;
    _state.activeEndDate = endDate as string;

    if (_config.startDate && _config.endDate) {
      if (!_config.timePicker) {
        dateRangeSelected(__state, __config);
      } else {
        if (_config.timePicker) {
          _state.sides.forEach((side) => {
            const generatedTimePicker = generateTimePicker(_state, _config, null, side);
            _state = generatedTimePicker.state;
            _state.times[side] = generatedTimePicker.timeObject;
          });
        }
      }
    }

    let outputStartDate: number | null | string = startDate
      ? moment(startDate, DEFAULT_DATE_FORMAT).valueOf()
      : null;
    let outputEndDate: number | null | string = endDate
      ? moment(endDate, DEFAULT_DATE_FORMAT).valueOf()
      : null;
    if (_config.outputDateFormat) {
      outputStartDate = startDate
        ? moment(startDate, DEFAULT_DATE_FORMAT).format(_config.outputDateFormat)
        : null;
      outputEndDate = endDate
        ? moment(endDate, DEFAULT_DATE_FORMAT).format(_config.outputDateFormat)
        : null;
    }
    onSelectedDate &&
      onSelectedDate({
        startDate: outputStartDate!,
        endDate: outputEndDate!,
      });

    _config.startTime = `${_state.selectedHour.left as string}:${
      _state.selectedMinute.left as string
    }`;
    _config.endTime = `${_state.selectedHour.right as string}:${
      _state.selectedMinute.right as string
    }`;

    return {
      _state,
      _config,
    };
  };

  const updateInputField = (_state: State, _config: Config): State => {
    let internalState: State = cloneDeep(_state) as State;
    const startDate = formatStartDate(_config, _config.viewDateFormat!);
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
      internalState.dateTitleText.left = startDate;
      internalState.dateTitleText.right = endDate;
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
    let _config: Config = cloneDeep(config) as Config;
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

        const { state: appliedState, config: appliedConfig } = doApply(stateCopy, _config);
        stateCopy = appliedState;
        _config = appliedConfig;
      }
      const internalConfig: Config = {
        startDate: moment(stateCopy.selectedYear.left as number, "YYYY")
          .startOf("year")
          .format(DEFAULT_DATE_FORMAT),
        type: "yearly",
      };
      const startDate: string = formatStartDate(internalConfig, config.viewDateFormat!);
      const endDate: string = config.endDate
        ? moment(config.endDate, DEFAULT_DATE_FORMAT).format(config.viewDateFormat)
        : "";
      stateCopy.dateTitleText.left = startDate;
      stateCopy.dateTitleText.right = endDate;
    }
    setState(stateCopy);
    setConfig(_config);
  };

  const onTimeLabelChange = (
    __state: State,
    __config: Config,
    timeItem: TIME_ITEM,
    side: CALENDAR_SIDES,
    item: string,
  ): void => {
    let _state: State = cloneDeep(__state) as State;
    const _config: Config = cloneDeep(__config) as Config;
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
      _state.selectedHour[side] = convertToViewTimeItem(item);
    } else {
      _state.selectedMinute[side] = convertToViewTimeItem(item);
    }

    _config.startTime = `${_state.selectedHour.left as string}:${
      _state.selectedMinute.left as string
    }`;
    _config.endTime = `${_state.selectedHour.right as string}:${
      _state.selectedMinute.right as string
    }`;

    const startDate: string = formatStartDate(_config, _config.viewDateFormat!);
    const endDate: string = _config.endDate
      ? moment(_config.endDate, DEFAULT_DATE_FORMAT).format(_config.viewDateFormat)
      : "";

    _state.dateTitleText.left = startDate;
    _state.dateTitleText.right = endDate;

    setState(_state);
    setConfig(_config);
  };

  useEffect(() => {
    init(
      userCanBeEmpty,
      userDateRangeModel,
      dateArray,
      startDate,
      endDate,
      minDate,
      maxDate,
      startTime,
      endTime,
      minTime,
      maxTime,
      type,
      modelKeys,
      useLocalTimezone,
      showTimezoneSelect,
      timePicker,
      timezoneSupport,
      defaultTimezone,
      inputClass,
      inputDateFormat,
      viewDateFormat,
      outputDateFormat,
      singleDatePicker,
      componentDisabled,
      label,
      placeholder,
      showRowNumber,
      availableRanges,
      showRanges,
      disableWeekends,
      disableWeekdays,
      displayBeginDate,
      displayEndDate,
      ariaLabels,
    );
  }, [
    userCanBeEmpty,
    userDateRangeModel,
    dateArray,
    startDate,
    endDate,
    minDate,
    maxDate,
    startTime,
    endTime,
    minTime,
    maxTime,
    type,
    modelKeys,
    useLocalTimezone,
    showTimezoneSelect,
    timePicker,
    timezoneSupport,
    defaultTimezone,
    inputClass,
    inputDateFormat,
    viewDateFormat,
    outputDateFormat,
    singleDatePicker,
    componentDisabled,
    label,
    placeholder,
    showRowNumber,
    availableRanges,
    showRanges,
    disableWeekends,
    disableWeekdays,
    displayBeginDate,
    displayEndDate,
    ariaLabels,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        state.isCalendarVisible &&
        event.target &&
        !(event.target as HTMLElement).parentElement?.getElementsByClassName(
          "ngx-datetime-range-picker-select-panel",
        ).length &&
        !(event.target as HTMLElement).closest(".dropdown-item") &&
        wrapperRef.current &&
        wrapperRef.current !== event.target &&
        !wrapperRef.current.contains(event.target as HTMLElement)
      ) {
        onCalendarClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [wrapperRef, state]);

  return (
    <div ref={wrapperRef} className="ngx-datetime-range-picker">
      <div className="date-input">
        <InputTag
          ref={filterInputBox}
          className={`dateSelect full-width ${config.inputClass ?? ""} ${
            inputAs?.classNames ? inputAs.classNames : "default-input-class"
          }`}
          label={config.label}
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
          dateRangeSelected={dateRangeSelected}
          setState={setState}
          setConfig={setConfig}
          updateInputField={updateInputField}
          doApply={doApply}
          handleDateChange={handleDateChange}
          updateActiveItemInputField={updateActiveItemInputField}
          onCalendarLabelChange={onCalendarLabelChange}
          onTimeLabelChange={onTimeLabelChange}
        />
      )}
    </div>
  );
};

export default DateTimeRangePicker;
