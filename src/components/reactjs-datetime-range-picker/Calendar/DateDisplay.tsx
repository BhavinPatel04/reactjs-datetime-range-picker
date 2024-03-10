import React from "react";
import { type CALENDAR_SIDES } from "../types";
import { type State } from "../interfaces";

interface Props {
  state: State;
  side: CALENDAR_SIDES;
}

const DateDisplay: React.FC<Props> = ({ state, side }) => {
  return (
    <div className="dateTitleInput">
      <div className="dateSelect">{state.dateTitleText[side] as string}</div>
    </div>
  );
};

export default DateDisplay;
