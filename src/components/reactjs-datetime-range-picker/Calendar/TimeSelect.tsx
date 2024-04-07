import React from "react";
import { type CALENDAR_SIDES, type SELECT_AS, type TIME_ITEM } from "../types";
import { type Config, type State, type TimeSide } from "../interfaces";
import DTRPSelect from "./DTRPSelect";

interface Props {
  state: State;
  config: Config;
  selectAs?: SELECT_AS;
  side: CALENDAR_SIDES;
  onTimeLabelChange: (
    state: State,
    config: Config,
    timeItem: TIME_ITEM,
    side: CALENDAR_SIDES,
    item: string,
  ) => void;
}

const TimeSelect: React.FC<Props> = ({ state, config, selectAs, side, onTimeLabelChange }) => {
  const getSelectedTimeItemText = (item: string, side: CALENDAR_SIDES): string => {
    if (item === "hour") {
      return state.selectedHour[side] as string;
    } else if (item === "minute") {
      return state.selectedMinute[side] as string;
    }
    return "";
  };

  return (
    <div className={`time-select ${side}`}>
      <div className="clock-icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
          <path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.376 0-149.188-30Q261-156 208.5-208.5T126-330.958q-30-69.959-30-149.5Q96-560 126-630t82.5-122q52.5-52 122.458-82 69.959-30 149.5-30 79.542 0 149.548 30.24 70.007 30.24 121.792 82.08 51.786 51.84 81.994 121.92T864-480q0 79.376-30 149.188Q804-261 752-208.5T629.869-126Q559.738-96 480-96Zm0-384Zm.477 312q129.477 0 220.5-91.5T792-480.477q0-129.477-91.023-220.5T480.477-792Q351-792 259.5-700.977t-91.5 220.5Q168-351 259.5-259.5T480.477-168Z" />
        </svg>
      </div>
      {state.timeItems.map((timeItem, index) => (
        <div key={`time-item-${index}`} className="d-inline-block time-item-container">
          <DTRPSelect
            classes="timeItem-select"
            selectAs={selectAs}
            options={(state.times[side] as TimeSide)[timeItem]}
            selectedValue={getSelectedTimeItemText(timeItem, side)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              onTimeLabelChange(state, config, timeItem, side, e.target.value);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TimeSelect;
