import React, { ElementType } from "react";
import { type Config, type Options, type State } from "../interfaces";
import { updateActiveItem, updateRange, updateCalendar } from "../util";
import { BUTTON_AS } from "../types";

interface Props {
  state: State;
  config: Config;
  buttonAs?: BUTTON_AS;
  dateRangeSelected: (state: State, config: Config) => void;
  setState: (state: State) => void;
  setConfig: (config: Config) => void;
  updateInputField: (state: State, config: Config) => void;
  doApply: (
    state: State,
    config: Config,
  ) => {
    state: State;
    config: Config;
  };
}

const Actions: React.FC<Props> = ({
  state,
  config,
  buttonAs,
  dateRangeSelected,
  setState,
  setConfig,
  updateInputField,
  doApply,
}) => {
  const ButtonTag: ElementType = buttonAs?.tag ?? "button";

  // const onTimeApply = (): void => {
  //   dateRangeSelected();
  //   updateInputField(state, config);
  // };

  const onRangeClick = (
    _config: Config,
    _state: State,
    rangeLabel: string,
    options: Options,
  ): void => {
    let __state = updateRange(_config, _state, rangeLabel, options);
    __state = updateActiveItem(_config, __state);
    __state = updateCalendar(__state, _config);
    const { state: appliedState, config: appliedConfig } = doApply(__state, _config);
    setState(appliedState);
    setConfig(appliedConfig);
  };

  return (
    <div className="ranges">
      {Object.keys(config.availableRanges!).map((range, idx) => (
        <ButtonTag
          key={`button-${idx}`}
          className={`calendar-range ${range === state.activeRange ? "active-range" : ""} ${
            buttonAs?.classNames ? buttonAs.classNames : "default-button-class"
          }`}
          onClick={() => {
            onRangeClick(config, state, range, config.availableRanges![range] as Options);
          }}
        >
          {range}
        </ButtonTag>
      ))}
      {/* {config.timePicker && state.customRange && (
        <div
          className={`range-select-button-container ${
            Object.keys(config.availableRanges ?? {}).length > 0 ? "range-select-button-bottom" : ""
          }`}
        >
          <ButtonTag
            className={`range-select-button range-select-apply-button ${
              buttonAs?.classNames ? buttonAs.classNames : buttonAs?.tag ? "" : "default-button-as"
            }`}
            onClick={() => {
              onTimeApply();
            }}
          >
            Apply
          </ButtonTag>
          <ButtonTag
            className={`range-select-button range-select-cancel-button ${
              buttonAs?.classNames ? buttonAs.classNames : buttonAs?.tag ? "" : "default-button-as"
            }`}
            onClick={() => {
              onTimeApply();
            }}
          >
            Cancel
          </ButtonTag>
        </div>
      )} */}
    </div>
  );
};

export default Actions;
