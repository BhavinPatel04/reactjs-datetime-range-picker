import React, { type ElementType } from "react";
import { type CALENDAR_SIDES } from "../types";
import { type State } from "../interfaces";

interface Props {
  state: State;
  side: CALENDAR_SIDES;
  inputAs?: ElementType;
}

const DateDisplay: React.FC<Props> = ({ state, side, inputAs: InputTag = "input" }) => {
  return (
    <div className="dateTitleInput">
      <InputTag type="text" className="dateSelect" value={state.dateTitleText[side]} readonly />
    </div>
  );
};

export default DateDisplay;
