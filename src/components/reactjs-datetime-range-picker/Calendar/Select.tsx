import React from "react";
import { type SELECT_AS } from "../types";
import { getSelectDefaultValue } from "../util";

interface Props {
  selectAs?: SELECT_AS;
  options: any[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DTRPSelect: React.FC<Props> = ({ selectAs, options, selectedValue, onChange }) => {
  const SelectTag = selectAs?.tag ?? "select";
  const SelectOptionTag = selectAs?.optionTag ?? "option";
  const selectDefaultSelectedAttribute = selectAs?.selectedAttributeName ?? "value";
  const selectedAttributeValueType = selectAs?.selectedAttributeValueType ?? "string";

  // const getSelectedTimeItemText = (item: string, side: CALENDAR_SIDES): string => {
  //   if (item === "hour") {
  //     return state.selectedHour[side] as string;
  //   } else if (item === "minute") {
  //     return state.selectedMinute[side] as string;
  //   }
  //   return "";
  // };

  return (
    <SelectTag
      className="timeItem-select ngx-datetime-range-picker-select-panel timeItem-select-panel"
      // value={`${selectedValue as string}`}
      {...{
        [selectDefaultSelectedAttribute]: getSelectDefaultValue(
          selectedValue,
          selectedAttributeValueType,
        ),
      }}
      onChange={onChange}
    >
      {options.map((item: any) => (
        <SelectOptionTag className="dropdown-item" key={item} value={item}>
          {item}
        </SelectOptionTag>
      ))}
    </SelectTag>
  );
};

export default DTRPSelect;
