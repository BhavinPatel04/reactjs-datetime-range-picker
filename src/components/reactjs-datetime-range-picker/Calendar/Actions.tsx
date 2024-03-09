import React, { type ElementType } from "react";
import { type Config, type Options, type State } from "../interfaces";

interface Props {
  state: State;
  config: Config;
  buttonAs?: ElementType;
  dateRangeSelected: () => void;
  setState: (state: State) => void;
  updateInputField: (state: State, config: Config) => void;
  updateRange: (_config: Config, _state: State, rangeLabel: string, options: Options) => State;
  updateActiveItem: (config: Config, state: State) => State;
  doApply: () => void;
}

const Actions: React.FC<Props> = ({
  state,
  config,
  buttonAs: ButtonTag = "button",
  dateRangeSelected,
  setState,
  updateInputField,
  updateRange,
  updateActiveItem,
  doApply,
}) => {
  const onTimeApply = (): void => {
    dateRangeSelected();
    updateInputField(state, config);
  };

  const onRangeClick = (
    _config: Config,
    _state: State,
    rangeLabel: string,
    options: Options,
  ): void => {
    const __state = updateRange(_config, _state, rangeLabel, options);
    setState(updateActiveItem(_config, __state));
    doApply();
  };
  return (
    <div className="ranges">
      {Object.keys(config.availableRanges!).map((range, idx) => (
        <ButtonTag
          key={`button-${idx}`}
          className={`calendar-range ${range === state.activeRange ? "active-range" : ""}`}
          onClick={() => {
            onRangeClick(config, state, range, config.availableRanges![range] as Options);
          }}
        >
          {range}
        </ButtonTag>
      ))}
      {config.timePicker && state.customRange && (
        <div
          className={`range-select-button-container ${
            Object.keys(config.availableRanges ?? {}).length > 0 ? "range-select-button-bottom" : ""
          }`}
        >
          <ButtonTag
            className="range-select-button range-select-apply-button"
            onClick={() => {
              onTimeApply();
            }}
          >
            Apply
          </ButtonTag>
          <ButtonTag
            className="range-select-button range-select-cancel-button"
            onClick={() => {
              onTimeApply();
            }}
          >
            Cancel
          </ButtonTag>
        </div>
      )}
    </div>
  );
};

export default Actions;
