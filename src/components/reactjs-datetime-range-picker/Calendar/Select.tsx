import React from "react";
import { type SELECT_AS } from "../types";
import { getSelectDefaultValue } from "../util";
import { ActiveItemSide, DateSide, TimeSide } from "../interfaces";

interface Props {
  selectAs?: SELECT_AS;
  options: any[];
  selectedValue: DateSide | TimeSide | ActiveItemSide | string | boolean | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DTRPSelect: React.FC<Props> = ({ selectAs, options, selectedValue, onChange }) => {
  const SelectTag = selectAs?.tag ?? "select";
  const SelectOptionTag = selectAs?.optionTag ?? "option";
  const selectDefaultSelectedAttribute = selectAs?.selectedAttributeName ?? "value";
  const selectedAttributeValueType = selectAs?.selectedAttributeValueType ?? "string";

  return (
    <SelectTag
      className="timeItem-select ngx-datetime-range-picker-select-panel timeItem-select-panel"
      //   value={() => getSelectedTimeItemText(timeItem, side)}
      {...{
        [selectDefaultSelectedAttribute]: getSelectDefaultValue(
          selectedValue as string,
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
