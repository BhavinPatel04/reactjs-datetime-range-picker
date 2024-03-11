# reactjs-datetime-range-picker
ReactJS datetime range picker with daily, weekly, monthly, quarterly &amp; yearly levels

[![npm version](https://badge.fury.io/js/reactjs-datetime-range-picker.svg)](https://badge.fury.io/js/reactjs-datetime-range-picker) 

This plugin uses bootstrap and moment.js. This plugin can render the components from any UI library you are using in your app as long as the UI library exports Input, Select and Button components.

## Demo
[Storybook demo](https://bhavinpatel04.github.io/reactjs-datetime-range-picker/)

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
      dateRangeModel={dateRangeModel}
      options={options}
      settings={settings}
      onSelectedDate={onSelectedDate}
      dateRangeModelChange={(options: Options | DateRangeModel) => console.log(options)}
      dateRangeChanged={(options: Options) => console.log(options)}
      inputFocusBlur={(options: Record<string, unknown>) => console.log(options)}
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
      dateRangeModel={dateRangeModel}
      options={options}
      settings={settings}
      inputAs={Input}
      selectAs={selectAs}
      buttonAs={Button}
      onSelectedDate={onSelectedDate}
      dateRangeModelChange={(options: Options | DateRangeModel) => console.log(options)}
      dateRangeChanged={(options: Options) => console.log(options)}
      inputFocusBlur={(options: Record<string, unknown>) => console.log(options)}
    />
  </>
}
```

## Options

| Option    | Type   | Description                                 |
| --------- | ------ | ------------------------------------------- |
| dateArray | Array  | Only the dates in the array will be enabled |
| startDate | string | Start date                                  |
| endDate   | string | End date                                    |
| minDate   | string | Min date                                    |
| maxDate   | string | Max date                                    |
| startTime | string | Start time (only for timepicker)            |
| endTime   | string | End time (only for timepicker)              |
| minTime   | string | Min time (only for timepicker)              |
| maxTime   | string | Max time (only for timepicker)              |

## Settings

| Setting           | Type    | Default                                                                                                               | Description                                               |
| ----------------- | ------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| type              | string  | 'daily'                                                                                                               | type (daily                                               | weekly | monthly | quarterly | yearly) |
| timePicker        | boolean | false                                                                                                                 | enable/disable timepicker                                 |
| inputDateFormat   | string  | "YYYY-MM-DD"                                                                                                          | input date format                                         |
| viewDateFormat    | string  | "YYYY-MM-DD"                                                                                                          | date format to view the date in                           |
| outputDateFormat  | string  | "YYYY-MM-DD"                                                                                                          | date format in which change event will return the date in |
| singleDatePicker  | boolean | false                                                                                                                 | enable/disable single date picker                         |
| componentDisabled | string  | false                                                                                                                 | enable/disable component                                  |
| placeholder       | string  | "Select Date"                                                                                                         | placeholder/title of the component                        |
| showRowNumber     | boolean | true                                                                                                                  | hide/show week numers for daily                           |
| availableRanges   | Object  | {"Last 7 Days": {startDate: inputDateFormat, endDate: inputDateFormat}, "Last 30 days": {...}, "Last 90 days": {...}} | ranges to show                                            |
| showRanges        | boolean | true                                                                                                                  | hide/show ranges                                          |
| disableWeekends   | boolean | false                                                                                                                 | enable/disable weekends                                   |
| disableWeekdays   | boolean | false                                                                                                                 | enable/disable weekdays                                   |
| displayBeginDate  | boolean | false                                                                                                                 | show begin date in input                                  |
| displayEndDate    | boolean | false                                                                                                                 | show end date in input                                    |

## [License](https://github.com/BhavinPatel04/ngx-datetime-range-picker/blob/master/LICENSE)

MIT
