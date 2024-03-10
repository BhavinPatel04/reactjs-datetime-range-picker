import React from "react";
import moment, { type DurationInputArg1, type DurationInputArg2, type unitOfTime } from "moment";
import { type CALENDAR_SIDES, type SELECT_AS } from "../types";
import { DEFAULT_DATE_FORMAT } from "../constants";
import { type Config, type DateSide, type State } from "../interfaces";
import { type NgxDatetimeRangePickerService } from "../service";
import { DatetimeRangeType } from "../enum";
import DTRPSelect from "./Select";

interface Props {
  state: State;
  config: Config;
  side: CALENDAR_SIDES;
  service: NgxDatetimeRangePickerService;
  selectAs?: SELECT_AS;
  generateCalendar: (state: State, config: Config, date: string, side: CALENDAR_SIDES) => State;
  setState: (state: State) => void;
  onCalendarLabelChange: (value: string, side: CALENDAR_SIDES, type: string) => void;
}

const MonthYearSelect: React.FC<Props> = ({
  state,
  config,
  side,
  service,
  selectAs,
  generateCalendar,
  setState,
  onCalendarLabelChange,
}) => {
  const onClickNext = (side: CALENDAR_SIDES): void => {
    const { label, labelFormat, type } = service.getLabelProps(state, config.type!, side);
    const endDate = moment(label, labelFormat)
      .add(1 as DurationInputArg1, type as DurationInputArg2)
      .endOf(type as unitOfTime.StartOf)
      .format(DEFAULT_DATE_FORMAT);

    const generatedCalendarState = generateCalendar(state, config, endDate, side);
    state = generatedCalendarState;
    setState(state);
  };
  const isPrevAvailable = (side: CALENDAR_SIDES): boolean => {
    const { label, labelFormat, type } = service.getLabelProps(state, config.type!, side);

    return (
      moment(label, labelFormat)
        .startOf(type as unitOfTime.StartOf)
        .valueOf() >
      moment(config.minDate, DEFAULT_DATE_FORMAT)
        .startOf(type as unitOfTime.StartOf)
        .valueOf()
    );
  };

  const onClickPrevious = (side: CALENDAR_SIDES): void => {
    const { label, labelFormat, type } = service.getLabelProps(state, config.type!, side);
    const startDate = moment(label, labelFormat)
      .subtract(1 as DurationInputArg1, type as DurationInputArg2)
      .startOf(type as unitOfTime.StartOf)
      .format(DEFAULT_DATE_FORMAT);

    const generatedCalendarState = generateCalendar(state, config, startDate, side);
    state = generatedCalendarState;
    setState(state);
  };
  const isNextAvailable = (side: CALENDAR_SIDES): boolean => {
    const { label, labelFormat, type } = service.getLabelProps(state, config.type!, side);

    return (
      moment(label, labelFormat)
        .endOf(type as unitOfTime.StartOf)
        .valueOf() <
      moment(config.maxDate, DEFAULT_DATE_FORMAT)
        .endOf(type as unitOfTime.StartOf)
        .valueOf()
    );
  };
  return (
    <div className="calendar-label-container">
      <div className="prev">
        <div
          className={`${isPrevAvailable(side) ? "available" : "disabled"}`}
          onClick={() => {
            onClickPrevious(side);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            fill={`${isPrevAvailable(side) ? null : "#e6e6e6"}`}
          >
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
          </svg>
        </div>
      </div>
      <div
        //   colspan={getCalendarColspan()}
        className="calendar-label"
      >
        <div className="date-dropdown-container" style={{ position: "relative" }}>
          {config.type === DatetimeRangeType.daily && (
            <div className="date-dropdown ngx-datetime-range-picker-select-panel month-select-panel">
              <DTRPSelect
                selectAs={selectAs}
                options={(state.dates[side] as DateSide).months!}
                selectedValue={`${state.selectedMonth[side] as string}`}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  onCalendarLabelChange(e.target.value, side, "month");
                }}
              />
            </div>
          )}
          <div className="date-dropdown ngx-datetime-range-picker-select-panel year-select-panel">
            <DTRPSelect
              selectAs={selectAs}
              options={(state.dates[side] as DateSide).years}
              selectedValue={`${state.selectedYear[side] as string}`}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onCalendarLabelChange(e.target.value, side, "year");
              }}
            />
          </div>
        </div>
      </div>
      <div className="next">
        <div
          className={`${isNextAvailable(side) ? "available" : "disabled"}`}
          onClick={() => {
            onClickNext(side);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            fill={`${isNextAvailable(side) ? null : "#e6e6e6"}`}
          >
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MonthYearSelect;
