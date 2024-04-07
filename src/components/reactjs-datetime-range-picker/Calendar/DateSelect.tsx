import React, { useRef } from "react";
import moment from "moment";
import { type CALENDAR_SIDES } from "../types";
import { type ActiveItemSide, type Config, type DateSide, type State } from "../interfaces";
import { DEFAULT_DATE_FORMAT } from "../constants";
import { cloneDeep, generateCalendar, iterateOverDateObj } from "../util";
import { DatetimeRangeType } from "../enum";

interface Props {
  state: State;
  config: Config;
  side: CALENDAR_SIDES;
  setState: (state: State) => void;
  setConfig: (config: Config) => void;
  handleDateChange: (
    state: State,
    config: Config,
  ) => {
    _state: State;
    _config: Config;
  };
  updateActiveItemInputField: (state: State, config: Config) => void;
}

const DateSelect: React.FC<Props> = ({
  state,
  config,
  side,
  setState,
  setConfig,
  handleDateChange,
  updateActiveItemInputField,
}) => {
  const itemCell = useRef<Record<string, HTMLTableCellElement | null>>({});
  const onCellClick = (item: ActiveItemSide, side: CALENDAR_SIDES): void => {
    let internalState: State = cloneDeep(state) as State;
    let internalConfig: Config = cloneDeep(config) as Config;
    const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
    const startDate: number = moment(internalConfig.startDate, DEFAULT_DATE_FORMAT).valueOf();
    const endDate: number = moment(internalConfig.endDate, DEFAULT_DATE_FORMAT).valueOf();
    const minDate: number = moment(internalConfig.minDate, DEFAULT_DATE_FORMAT).valueOf();
    const maxDate: number = moment(internalConfig.maxDate, DEFAULT_DATE_FORMAT).valueOf();

    if (!item.available) {
      if (date < minDate || date > maxDate) {
        return;
      }
      const generatedCalendarState = generateCalendar(
        internalState,
        internalConfig,
        item.date!,
        side,
      );
      internalState = generatedCalendarState;
    }

    if (endDate || date < startDate) {
      internalConfig.endDate = "";
      internalConfig.startDate = item.date;
      internalState.activeItem.left = item;
    } else if (!endDate && date < startDate) {
      internalConfig.endDate = cloneDeep(internalConfig.startDate!) as string;
      internalState.activeItem.right = item;
    } else {
      internalConfig.endDate = item.date;
      internalState.activeItem.right = item;
    }

    if (internalConfig.singleDatePicker && internalConfig.startDate) {
      internalConfig.endDate = cloneDeep(internalConfig.startDate) as string;
      internalState.activeItem.right = internalState.activeItem.left = item;
    }

    const { _state: updatedState, _config: updateConfig } = handleDateChange(
      internalState,
      internalConfig,
    );
    internalState = updatedState;
    internalConfig = updateConfig;

    setState(internalState);
    setConfig(internalConfig);
  };

  const onCellMouseEnter = (item: ActiveItemSide, itemCell: HTMLTableCellElement | null): void => {
    if (!item.available) {
      return;
    }

    const internalState: State = cloneDeep(state) as State;
    const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
    const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
    const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
    const hoverItemText: string = itemCell ? itemCell.innerText : "";
    let hoverItemFirstDate: string = itemCell ? itemCell?.getAttribute("data-firstday") ?? "" : "";
    let hoverItemLastDate: string = itemCell ? itemCell?.getAttribute("data-lastday") ?? "" : "";

    hoverItemFirstDate = moment(hoverItemFirstDate, DEFAULT_DATE_FORMAT).format(
      config.viewDateFormat,
    );
    hoverItemLastDate = moment(hoverItemLastDate, DEFAULT_DATE_FORMAT).format(
      config.viewDateFormat,
    );

    let activeItemInputFieldText = `${hoverItemText} (${hoverItemFirstDate} - ${hoverItemLastDate})`;

    if (config.type === DatetimeRangeType.daily) {
      activeItemInputFieldText = `${hoverItemLastDate}`;
    }

    if (!endDate) {
      const func = (rowItem: ActiveItemSide): void => {
        if (rowItem.available) {
          const hoverItemDate = rowItem.date
            ? moment(rowItem.date, DEFAULT_DATE_FORMAT).valueOf()
            : moment(rowItem.date, DEFAULT_DATE_FORMAT).valueOf();
          if ((hoverItemDate > startDate && hoverItemDate < date) || date === hoverItemDate) {
            rowItem.inRange = true;
            internalState.dateTitleText.right = activeItemInputFieldText;
          }
        }
      };

      iterateOverDateObj(internalState.dates, func.bind(this));
    } else {
      internalState.dateTitleText[side] = activeItemInputFieldText;
    }
    setState(internalState);
  };

  const onCellMouseLeave = (): void => {
    if (!config.endDate) {
      const func = (rowItem: ActiveItemSide): void => {
        rowItem.inRange = false;
      };
      iterateOverDateObj(state.dates, func.bind(this));
    } else {
      updateActiveItemInputField(state, config);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          {config.showRowNumber && <th className="rowNumber"></th>}
          {state.weekDayOptions.map((day, idx) => (
            <th key={`day-${idx}`} className="calendar-week-day capitalize">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(state.dates[side] as DateSide).itemRows.map((row, trIdx) => (
          <tr key={`tr-${trIdx}`}>
            {config.showRowNumber && row.rowNumberText && (
              <td className="rowNumber">{row.rowNumberText}</td>
            )}
            {row.items.map((item, tdIdx) => (
              <td
                key={`td-${trIdx}-${tdIdx}`}
                ref={(el) => {
                  if (itemCell.current) {
                    itemCell.current[`td-${trIdx}-${tdIdx}`] = el;
                  }
                }}
                data-firstday={item.firstDay}
                data-lastday={item.lastDay}
                className={`${item.available ? "available" : ""} ${
                  item.inRange ? "in-range" : ""
                } ${
                  (state.activeStartDate === item.date && side === "left") ||
                  (state.activeEndDate === item.date && side === "right")
                    ? "active"
                    : ""
                } ${item.today ? "today" : ""}`}
                onClick={() => {
                  onCellClick(item, side);
                }}
                onMouseOver={() => {
                  onCellMouseEnter(item, itemCell.current[`td-${trIdx}-${tdIdx}`]);
                }}
                onMouseLeave={() => {
                  onCellMouseLeave();
                }}
              >
                <div>{item.rowItemText}</div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DateSelect;
