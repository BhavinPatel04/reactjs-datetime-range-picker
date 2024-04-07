# reactjs-datetime-range-picker
ReactJS datetime range picker with daily, weekly, monthly, quarterly &amp; yearly levels

[![npm version](https://badge.fury.io/js/reactjs-datetime-range-picker.svg)](https://badge.fury.io/js/reactjs-datetime-range-picker) 

This plugin uses bootstrap and moment.js. This plugin can render the components from any UI library you are using in your app as long as the UI library exports Input, Select and Button components.

## Demo
[Storybook demo](https://bhavinpatel04.github.io/reactjs-datetime-range-picker)

## Angular Version
[ngx-datetime-range-picker](https://github.com/BhavinPatel04/ngx-datetime-range-picker)

## Installation
#### Install the plugin:
```
# npm
npm install reactjs-datetime-range-picker --save-dev

# yarn
yarn add reactjs-datetime-range-picker --dev
```

#### Using the basic HTML components
```typescript
import React from "react";
import {
  ReactJSDatetimeRangePicker,
  DateRangeModel,
  Options,
  Settings,
} from "reactjs-datetime-range-picker";

const SomeComponent: React.FC<Props> = ({}) => {
  const dateRangeModel: DateRangeModel = {...};
  const options: Options = {...};
  const settings: Settings = {...};

  const onDateSelect = (options: Options) => {
    console.log(options);
    /**
     * {
     *   startDate: "2018-10-13",
     *   endDate: "2018-10-19",
     * },
     */
  };

  return <>
    ...
    <ReactJSDatetimeRangePicker
      canBeEmpty={false}
      dateRangeModel={dateRangeModel}
      options={options}
      settings={settings}
      onDateSelect={onDateSelect}
      onDateRangeModelChange={(options: Options | DateRangeModel) => console.log(options)}
      onDateRangeChange={(options: Options) => console.log(options)}
      onInputBlur={(options: Record<string, unknown>) => console.log(options)}
    />
  </>
}
```

#### Using the components from the library you are using. Example: [NextUI](https://nextui.org/)
Assumpition is that you have already installed the UI library you will be using.
```typescript
import React from "react";
import {
  ReactJSDatetimeRangePicker,
  DateRangeModel,
  Options,
  Settings,
  SELECT_AS
} from "reactjs-datetime-range-picker";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";

const SomeComponent: React.FC<Props> = ({}) => {
  const dateRangeModel: DateRangeModel = {...};
  const options: Options = {...};
  const settings: Settings = {...};
  const selectAs: SELECT_AS = {
    tag: Select,
    optionTag: SelectItem,
    selectedAttributeName: "defaultSelectedKeys", // specify the propery that your library uses for default value selection
    selectedAttributeValueType: "array", // specify if the above property accepts default value in array or string
  };
  
  const onSelectedDate = (options: Options) => {
    console.log(options);
    /**
     * {
     *   startDate: "2018-10-13",
     *   endDate: "2018-10-19",
     * },
     */
  };

  return <>
    ...
    <ReactJSDatetimeRangePicker
      canBeEmpty={false}
      onDateSelect={{
        daily: {
          endDate: '2024-03-23',
          startDate: '2024-03-23'
        },
        weekly: {
          endDate: '2024-03-23',
          startDate: '2024-03-17'
        }
      }}
      
      displayEndDate={true}
      inputDateFormat="YYYY-MM-DD"
      label="Date"
      placeholder="Date"
      showRowNumber
      singleDatePicker
      type="daily"
      viewDateFormat="MMM D, YYYY"
      inputAs={Input}
      selectAs={selectAs}
      buttonAs={Button}
      onDateSelect={onDateSelect}
      onDateRangeModelChange={(options: Options | DateRangeModel) => console.log(options)}
      onDateRangeChange={(options: Options) => console.log(options)}
      onInputBlur={(options: Record<string, unknown>) => console.log(options)}
    />
  </>
}
```

## Properties

| Property              | Type    | Default                                                                                                               | Description                                               |
| --------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| type                  | string  | 'daily'                                                                                                               | type (daily | weekly | monthly | quarterly | yearly)      |
| timePicker            | boolean | false                                                                                                                 | enable/disable timepicker                                 |
| inputDateFormat       | string  | "YYYY-MM-DD"                                                                                                          | input date format                                         |
| viewDateFormat        | string  | "YYYY-MM-DD"                                                                                                          | date format to view the date in                           |
| outputDateFormat      | string  | "YYYY-MM-DD"                                                                                                          | date format in which change event will return the date in |
| singleDatePicker      | boolean | false                                                                                                                 | enable/disable single date picker                         |
| componentDisabled     | string  | false                                                                                                                 | enable/disable component                                  |
| placeholder           | string  | "Select Date"                                                                                                         | placeholder/title of the component                        |
| showRowNumber         | boolean | true                                                                                                                  | hide/show week numers for daily                           |
| availableRanges       | Object  | {"Last 7 Days": {startDate: inputDateFormat, endDate: inputDateFormat}, "Last 30 days": {...}, "Last 90 days": {...}} | ranges to show                                            |
| showRanges            | boolean | true                                                                                                                  | hide/show ranges                                          |
| disableWeekends       | boolean | false                                                                                                                 | enable/disable weekends                                   |
| disableWeekdays       | boolean | false                                                                                                                 | enable/disable weekdays                                   |
| displayBeginDate      | boolean | false                                                                                                                 | show begin date in input                                  |
| displayEndDate        | boolean | false                                                                                                                 | show end date in input                                    |
| dateArray             | Array   | []                                                                                                                    | Only the dates in the array will be enabled               |
| startDate             | string  | Today's date                                                                                                          | Start date                                                |
| endDate               | string  | Today's date                                                                                                          | End date                                                  |
| minDate               | string  | Current Year - 2                                                                                                      | Min date                                                  |
| maxDate               | string  | Today's date                                                                                                          | Max date                                                  |
| startTime             | string  | "00:00"                                                                                                               | Start time (only for timepicker)                          |
| endTime               | string  | "23:59"                                                                                                               | End time (only for timepicker)                            |
| minTime               | string  |                                                                                                                       | Min time (only for timepicker)                            |
| maxTime               | string  |                                                                                                                       | Max time (only for timepicker)                            |
| onDateRangeModelChange| function| function(options: Options \| DateRangeModel) {}                                                                        | Emits the date range model when the calendar is closed    |
| onDateSelect          | function| function(options: Options) {}                                                                                         | Emits date when date is selected                          |
| onDateRangeChange     | function| function(options: Options) {}                                                                                         | Emits the selected date and time when the calendar is closed|
| onInputBlur           | function| function(options: Record<string, unknown>) {}                                                                         | Emitted when the date input is blurred                    |

## [License](https://github.com/BhavinPatel04/ngx-datetime-range-picker/blob/master/LICENSE)

MIT
