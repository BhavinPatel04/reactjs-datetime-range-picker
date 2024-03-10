import React, { useRef } from "react";
import moment from "moment";
import { type CALENDAR_SIDES } from "../types";
import { type ActiveItemSide, type Config, type DateSide, type State } from "../interfaces";
import { type NgxDatetimeRangePickerService } from "../service";
import { DEFAULT_DATE_FORMAT } from "../constants";
import { cloneDeep } from "../util";
import { DatetimeRangeType } from "../enum";

interface Props {
  state: State;
  config: Config;
  side: CALENDAR_SIDES;
  service: NgxDatetimeRangePickerService;
  setState: (state: State) => void;
  generateCalendar: (state: State, config: Config, date: string, side: CALENDAR_SIDES) => State;
  updateActiveItemInputField: (state: State, config: Config) => void;
  doApply: () => void;
}

const DateSelect: React.FC<Props> = ({
  state,
  config,
  side,
  service,
  setState,
  generateCalendar,
  updateActiveItemInputField,
  doApply,
}) => {
  const itemCell = useRef<Record<string, HTMLTableCellElement | null>>({});
  const onCellClick = (item: ActiveItemSide, side: CALENDAR_SIDES): void => {
    let internalState: State = cloneDeep(state) as State;
    const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
    const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
    const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
    const minDate: number = moment(config.minDate, DEFAULT_DATE_FORMAT).valueOf();
    const maxDate: number = moment(config.maxDate, DEFAULT_DATE_FORMAT).valueOf();

    if (!item.available) {
      if (date < minDate || date > maxDate) {
        return;
      }
      const generatedCalendarState = generateCalendar(internalState, config, item.date!, side);
      internalState = generatedCalendarState;
      setState(internalState);
    }

    if (endDate || date < startDate) {
      config.endDate = "";
      config.startDate = item.date;
      internalState.activeItem.left = item;
    } else if (!endDate && date < startDate) {
      config.endDate = cloneDeep(config.startDate!) as string;
      internalState.activeItem.right = item;
    } else {
      config.endDate = item.date;
      internalState.activeItem.right = item;
    }

    if (config.singleDatePicker) {
      config.endDate = cloneDeep(config.startDate!) as string;
      internalState.activeItem.right = internalState.activeItem.left = item;
    }

    setState(internalState);
    doApply();
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

      service.iterateOverDateObj(internalState.dates, func.bind(this));
    } else {
      // if (config.singleDatePicker) {
      //   internalState.dateTitleText.right = activeItemInputFieldText;
      // } else {
      //   internalState.dateTitleText.left = activeItemInputFieldText;
      // }
      internalState.dateTitleText[side] = activeItemInputFieldText;
    }
    setState(internalState);
  };

  const onCellMouseLeave = (): void => {
    if (!config.endDate) {
      const func = (rowItem: ActiveItemSide): void => {
        rowItem.inRange = false;
      };
      service.iterateOverDateObj(state.dates, func.bind(this));
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
