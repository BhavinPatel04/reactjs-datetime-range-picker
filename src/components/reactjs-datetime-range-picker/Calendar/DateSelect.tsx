import React from "react";
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
  itemCell: React.MutableRefObject<any>;
  service: NgxDatetimeRangePickerService;
  setState: (state: State) => void;
  generateCalendar: (
    state: State,
    config: Config,
    date: string,
    side: CALENDAR_SIDES,
  ) => { dates: DateSide; state: State };
  updateActiveItemInputField: (state: State, config: Config) => void;
  doApply: () => void;
}

const DateSelect: React.FC<Props> = ({
  state,
  config,
  side,
  itemCell,
  service,
  setState,
  generateCalendar,
  updateActiveItemInputField,
  doApply,
}) => {
  const onCellClick = (item: ActiveItemSide, side: CALENDAR_SIDES): void => {
    const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
    const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
    const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
    const minDate: number = moment(config.minDate, DEFAULT_DATE_FORMAT).valueOf();
    const maxDate: number = moment(config.maxDate, DEFAULT_DATE_FORMAT).valueOf();

    if (!item.available) {
      if (date < minDate || date > maxDate) {
        return;
      }
      const generatedCalendar = generateCalendar(state, config, item.date!, side);
      state = generatedCalendar.state;
      state.dates[side] = generatedCalendar.dates;
      setState(state);
    }

    if (endDate || date < startDate) {
      config.endDate = "";
      config.startDate = item.date;
      state.activeItem.left = item;
    } else if (!endDate && date < startDate) {
      config.endDate = cloneDeep(config.startDate!) as string;
      state.activeItem.right = item;
    } else {
      config.endDate = item.date;
      state.activeItem.right = item;
    }

    if (config.singleDatePicker) {
      config.endDate = cloneDeep(config.startDate!) as string;
      state.activeItem.right = state.activeItem.left = item;
    }

    doApply();
  };

  const onCellMouseEnter = (item: ActiveItemSide, itemCell: React.MutableRefObject<any>): void => {
    if (!item.available) {
      return;
    }

    const date: number = moment(item.date, DEFAULT_DATE_FORMAT).valueOf();
    const startDate: number = moment(config.startDate, DEFAULT_DATE_FORMAT).valueOf();
    const endDate: number = moment(config.endDate, DEFAULT_DATE_FORMAT).valueOf();
    const hoverItemText: string = itemCell ? itemCell.current.innerText : "";
    let hoverItemFirstDate: string = itemCell ? itemCell.current.getAttribute("firstday") : "";
    let hoverItemLastDate: string = itemCell ? itemCell.current.getAttribute("lastday") : "";

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
            state.dateTitleText.right = activeItemInputFieldText;
          }
        }
      };

      service.iterateOverDateObj(state.dates, func.bind(this));
    } else {
      if (config.singleDatePicker) {
        state.dateTitleText.right = activeItemInputFieldText;
      } else {
        state.dateTitleText.left = activeItemInputFieldText;
      }
    }
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
        {(state.dates[side] as DateSide).itemRows.map((row, idx) => (
          <tr key={`tr-${idx}`}>
            {config.showRowNumber && row.rowNumberText && (
              <td className="rowNumber">{row.rowNumberText}</td>
            )}
            {row.items.map((item) => (
              <td
                key={`td-${idx}`}
                ref={itemCell}
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
                  onCellMouseEnter(item, itemCell);
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
