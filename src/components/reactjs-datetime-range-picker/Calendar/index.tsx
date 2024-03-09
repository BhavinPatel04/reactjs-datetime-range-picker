import React, { type ElementType } from "react";
import { type Options, type State, type DateSide, type Config } from "../interfaces";
import { type CALENDAR_SIDES, type SELECT_AS, type TIME_ITEM } from "../types";
import { type NgxDatetimeRangePickerService } from "../service";
import TimezoneSelect from "./TimezoneSelect";
import DateDisplay from "./DateDisplay";
import MonthYearSelect from "./MonthYearSelect";
import DateSelect from "./DateSelect";
import TimeSelect from "./TimeSelect";
import Actions from "./Actions";

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

interface Props {
  config: Config;
  state: State;
  inputAs?: ElementType;
  selectAs?: SELECT_AS;
  buttonAs?: ElementType;
  itemCell: React.MutableRefObject<any>;
  service: NgxDatetimeRangePickerService;
  generateCalendar: (
    state: State,
    config: Config,
    date: string,
    side: CALENDAR_SIDES,
  ) => { dates: DateSide; state: State };
  dateRangeSelected: () => void;
  setState: (state: State) => void;
  updateInputField: (state: State, config: Config) => void;
  doApply: () => void;
  updateActiveItemInputField: (state: State, config: Config) => void;
  updateRange: (_config: Config, _state: State, rangeLabel: string, options: Options) => State;
  updateActiveItem: (config: Config, state: State) => State;
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
  inputAs,
  selectAs,
  buttonAs,
  itemCell,
  service,
  generateCalendar,
  dateRangeSelected,
  setState,
  updateInputField,
  doApply,
  updateActiveItemInputField,
  updateRange,
  updateActiveItem,
  onCalendarLabelChange,
  onTimeLabelChange,
}) => {
  return (
    <div className="calendar-view">
      <div className="date-select">
        <div style={{ position: "relative" }}>
          {!!config.timezoneSupport && (
            <TimezoneSelect state={state} config={config} service={service} setState={setState} />
          )}
          <ul className="list-inline calendar-container">
            {state.sides.map((side, idx) => (
              <li key={`calendar-${idx}`} className={`calendar ${side}`}>
                <DateDisplay key={`calendar-${idx}`} state={state} side={side} inputAs={inputAs} />
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
                        service={service}
                        generateCalendar={generateCalendar}
                        onCalendarLabelChange={onCalendarLabelChange}
                        setState={setState}
                      />
                      <DateSelect
                        key={`date-select-${idx}`}
                        config={config}
                        state={state}
                        side={side}
                        itemCell={itemCell}
                        service={service}
                        setState={setState}
                        generateCalendar={generateCalendar}
                        doApply={doApply}
                        updateActiveItemInputField={updateActiveItemInputField}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {config.timePicker && (
            <TimeSelect
              state={state}
              config={config}
              selectAs={selectAs}
              onTimeLabelChange={onTimeLabelChange}
            />
          )}
        </div>
        {((!config.singleDatePicker && config.showRanges) ?? config.timePicker) && (
          <Actions
            config={config}
            state={state}
            buttonAs={buttonAs}
            setState={setState}
            updateActiveItem={updateActiveItem}
            updateInputField={updateInputField}
            updateRange={updateRange}
            dateRangeSelected={dateRangeSelected}
            doApply={doApply}
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;
