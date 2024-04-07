import React from "react";
import { type SELECT_AS } from "../types";
import { getSelectDefaultValue } from "../util";

interface Props {
  selectAs?: SELECT_AS;
  options: any[];
  selectedValue: string;
  classes?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DTRPSelect: React.FC<Props> = ({
  selectAs,
  options,
  selectedValue,
  classes = "",
  onChange,
}) => {
  const SelectTag = selectAs?.tag ?? "select";
  const SelectOptionTag = selectAs?.optionTag ?? "option";
  const selectDefaultSelectedAttribute = selectAs?.selectedAttributeName ?? "value";
  const selectedAttributeValueType = selectAs?.selectedAttributeValueType ?? "string";

  return (
    <SelectTag
      className={`${classes} ngx-datetime-range-picker-select-panel ${
        selectAs?.classNames ? selectAs.classNames : "default-select-class"
      }`}
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
