import React from "react";
import { type TZ_MAP_KEYS } from "../types";
import { type Config, type State } from "../interfaces";
import { getZoneToday } from "../util";
import { DEFAULT_DATE_FORMAT } from "../constants";

interface Props {
  state: State;
  config: Config;
  setState: (state: State) => void;
}

const TimezoneSelect: React.FC<Props> = ({ state, config, setState }) => {
  const onTimezoneChange = (tz: TZ_MAP_KEYS): void => {
    setState({
      ...state,
      selectedTimezone: tz,
      todayTime: getZoneToday(tz, config.viewDateFormat ?? DEFAULT_DATE_FORMAT),
    });
  };
  return (
    <div className="list-inline timezone-select">
      <div className="timeZones">
        {state.timeZones.map((tz: TZ_MAP_KEYS, idx) => (
          <>
            <div
              key={`tz-${idx}`}
              className={`timezone ${state.selectedTimezone === tz ? "active-timezone" : ""}`}
              onClick={() => {
                onTimezoneChange(tz);
              }}
            >
              {tz}
            </div>
            {idx !== state.timeZones.length - 1 && (
              <div key={`divider-${idx}`} className="vertical-divider"></div>
            )}
          </>
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
