import React from "react";
import { type TZ_MAP_KEYS } from "../types";
import { type Config, type State } from "../interfaces";
import { type NgxDatetimeRangePickerService } from "../service";

interface Props {
  state: State;
  config: Config;
  service: NgxDatetimeRangePickerService;
  setState: (state: State) => void;
}

const TimezoneSelect: React.FC<Props> = ({ state, config, service, setState }) => {
  const onTimezoneChange = (tz: TZ_MAP_KEYS): void => {
    setState({
      ...state,
      selectedTimezone: tz,
      todayTime: service.getZoneToday(tz, config.viewDateFormat!),
    });
  };
  return (
    <div className="list-inline timezone-select">
      <div className="timeZones">
        {state.timeZones.map((tz: TZ_MAP_KEYS, idx) => (
          <div
            key={`tz-${idx}`}
            className={`timezone ${
              idx === state.timeZones.length - 1 ? "border-separator" : ""
            } ${state.selectedTimezone === tz ? "active-timezone" : ""}`}
            onClick={() => {
              onTimezoneChange(tz);
            }}
          >
            {tz}
          </div>
        ))}
      </div>
      <div className="currentTime">
        <span className="today-text">Today</span>:{" "}
        <span className="active-timezone">{state.todayTime}</span>
      </div>
    </div>
  );
};

export default TimezoneSelect;
