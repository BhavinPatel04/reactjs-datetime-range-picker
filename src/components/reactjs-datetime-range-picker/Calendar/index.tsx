import React from "react";
import { type State, type Config } from "../interfaces";
import { BUTTON_AS, type CALENDAR_SIDES, type SELECT_AS, type TIME_ITEM } from "../types";
import TimezoneSelect from "./TimezoneSelect";
import DateDisplay from "./DateDisplay";
import MonthYearSelect from "./MonthYearSelect";
import DateSelect from "./DateSelect";
import TimeSelect from "./TimeSelect";
import Actions from "./Actions";

interface Props {
  config: Config;
  state: State;
  selectAs?: SELECT_AS;
  buttonAs?: BUTTON_AS;
  dateRangeSelected: (state: State, config: Config) => void;
  setState: (state: State) => void;
  setConfig: (config: Config) => void;
  updateInputField: (state: State, config: Config) => void;
  doApply: (
    state: State,
    config: Config,
  ) => {
    state: State;
    config: Config;
  };
  handleDateChange: (
    state: State,
    config: Config,
  ) => {
    _state: State;
    _config: Config;
  };
  updateActiveItemInputField: (state: State, config: Config) => void;
  onCalendarLabelChange: (label: string, side: CALENDAR_SIDES, type: string) => void;
  onTimeLabelChange: (
    state: State,
    config: Config,
    timeItem: TIME_ITEM,
    side: CALENDAR_SIDES,
    item: string,
  ) => void;
}

const Calendar: React.FC<Props> = ({
  config,
  state,
  selectAs,
  buttonAs,
  dateRangeSelected,
  setState,
  setConfig,
  updateInputField,
  doApply,
  handleDateChange,
  updateActiveItemInputField,
  onCalendarLabelChange,
  onTimeLabelChange,
}) => {
  return (
    <div className="calendar-view">
      <div className="date-select">
        <div style={{ position: "relative" }}>
          {!!config.timezoneSupport && (
            <TimezoneSelect state={state} config={config} setState={setState} />
          )}
          <ul className="list-inline calendar-container">
            {state.sides.map((side, idx) => (
              <li key={`calendar-${idx}`} className={`calendar ${side}`}>
                <DateDisplay key={`calendar-${idx}`} state={state} side={side} />
                <div className="divider"></div>
                <div className="calendar-table">
                  {state.calendarAvailable[side] && (
                    <div
                      className="calendar-side-container"
                      style={{ minWidth: "250px", position: "relative" }}
                    >
                      <MonthYearSelect
                        key={`month-year-select-${idx}`}
                        config={config}
                        state={state}
                        side={side}
                        selectAs={selectAs}
                        onCalendarLabelChange={onCalendarLabelChange}
                        setState={setState}
                      />
                      <DateSelect
                        key={`date-select-${idx}`}
                        config={config}
                        state={state}
                        side={side}
                        setState={setState}
                        setConfig={setConfig}
                        handleDateChange={handleDateChange}
                        updateActiveItemInputField={updateActiveItemInputField}
                      />
                    </div>
                  )}
                </div>
                {config.timePicker && (
                  <div className="time-picker-container">
                    <div className="divider"></div>
                    <TimeSelect
                      key={`time-select-${idx}`}
                      state={state}
                      side={side}
                      config={config}
                      selectAs={selectAs}
                      onTimeLabelChange={onTimeLabelChange}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {((!config.singleDatePicker && config.showRanges) ?? config.timePicker) && (
          <Actions
            config={config}
            state={state}
            buttonAs={buttonAs}
            setState={setState}
            setConfig={setConfig}
            updateInputField={updateInputField}
            dateRangeSelected={dateRangeSelected}
            doApply={doApply}
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;
