import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import moment from "moment";
import { ReactJSDatetimeRangePicker, DateRangeModel, Options } from "../../..";
import { NextUIProvider } from "@nextui-org/system";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { DatetimeRangeType } from "../enum";
import "./assets/nextui.css";

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "DateTimeRangePicker/NextUI",
  tags: ["autodocs"],
  component: ReactJSDatetimeRangePicker,
  decorators: [
    (Story) => {
      const style: string = `
        .custom-input-class {
          border: none;
        }
        .custom-select-class {
          border: none;

        }
      }`;
      return (
        <NextUIProvider>
          <div>
            <style type="text/css">{style}</style>
            <Story />
          </div>
        </NextUIProvider>
      );
    },
  ],
} satisfies Meta<typeof ReactJSDatetimeRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Date: Story = {
  args: {
    canBeEmpty: false,
    dateRangeModel: {
      daily: {
        startDate: moment().format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      },
      weekly: {
        startDate: moment().subtract(6, "days").format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      } as Options,
    } as DateRangeModel,
    singleDatePicker: true,
    displayEndDate: true,
    timezoneSupport: false,
    type: DatetimeRangeType.daily,
    viewDateFormat: "MMM D, YYYY",
    label: "Date",
    placeholder: "Date",
    inputDateFormat: "YYYY-MM-DD",
    showRowNumber: true,
    inputAs: {
      tag: Input,
      classNames: "custom-input-class",
    },
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
    },
    buttonAs: {
      tag: Button,
    },
    onDateRangeModelChange: (options) => {
      console.log("Date range model changed", options);
    },
    onDateSelect: (options) => {
      console.log("Date selected", options);
    },
    onDateRangeChange: (options) => {
      console.log("Date range changed", options);
    },
    onInputBlur: (options) => {
      console.log("Input blurred", options);
    },
  },
};

export const DateTimezone: Story = {
  args: {
    canBeEmpty: false,
    dateRangeModel: {
      daily: {
        startDate: moment().format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      },
      weekly: {
        startDate: moment().subtract(6, "days").format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      } as Options,
    } as DateRangeModel,
    singleDatePicker: true,
    displayEndDate: true,
    timePicker: true,
    timezoneSupport: true,
    type: DatetimeRangeType.daily,
    viewDateFormat: "MMM D, YYYY",
    label: "Date",
    placeholder: "Date",
    inputDateFormat: "YYYY-MM-DD",
    showRowNumber: true,
    inputAs: {
      tag: Input,
      classNames: "custom-input-class",
    },
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
      classNames: "custom-select-class",
    },
    buttonAs: {
      tag: Button,
    },
    onDateRangeModelChange: (options) => {
      console.log("Date range model changed", options);
    },
    onDateSelect: (options) => {
      console.log("Date selected", options);
    },
    onDateRangeChange: (options) => {
      console.log("Date range changed", options);
    },
    onInputBlur: (options) => {
      console.log("Input blurred", options);
    },
  },
};

export const DateRange: Story = {
  args: {
    canBeEmpty: false,
    dateRangeModel: {
      daily: {
        startDate: moment().subtract(6, "days").format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      },
      weekly: {
        startDate: moment().subtract(2, "weeks").format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
      } as Options,
    } as DateRangeModel,
    timezoneSupport: false,
    type: DatetimeRangeType.weekly,
    viewDateFormat: "MMM D, YYYY",
    label: "Date Range",
    placeholder: "Date Range",
    inputDateFormat: "YYYY-MM-DD",
    inputAs: {
      tag: Input,
      classNames: "custom-input-class",
    },
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
      classNames: "custom-select-class",
    },
    buttonAs: {
      tag: Button,
    },
    onDateRangeModelChange: (options) => {
      console.log("Date range model changed", options);
    },
    onDateSelect: (options) => {
      console.log("Date selected", options);
    },
    onDateRangeChange: (options) => {
      console.log("Date range changed", options);
    },
    onInputBlur: (options) => {
      console.log("Input blurred", options);
    },
  },
};

export const DateArrayRange: Story = {
  args: {
    canBeEmpty: false,
    dateRangeModel: {
      daily: {
        dateArray: [
          moment().subtract(1, "weeks").format(DEFAULT_DATE_FORMAT),
          moment().subtract(3, "weeks").format(DEFAULT_DATE_FORMAT),
          moment().subtract(5, "weeks").format(DEFAULT_DATE_FORMAT),
        ],
        minDate: moment().subtract(6, "weeks").format(DEFAULT_DATE_FORMAT),
        maxDate: moment().format(DEFAULT_DATE_FORMAT),
      },
      weekly: {
        dateArray: [
          moment().format(DEFAULT_DATE_FORMAT),
          moment().subtract(3, "weeks").format(DEFAULT_DATE_FORMAT),
          moment().subtract(5, "weeks").format(DEFAULT_DATE_FORMAT),
        ],
        minDate: moment().subtract(6, "weeks").format(DEFAULT_DATE_FORMAT),
        maxDate: moment().format(DEFAULT_DATE_FORMAT),
      } as Options,
    } as DateRangeModel,
    timezoneSupport: false,
    type: DatetimeRangeType.daily,
    viewDateFormat: "MMM D, YYYY",
    label: "Date Array Range",
    placeholder: "Date Array Range",
    inputDateFormat: "YYYY-MM-DD",
    inputAs: {
      tag: Input,
      classNames: "custom-input-class",
    },
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
      classNames: "custom-select-class",
    },
    buttonAs: {
      tag: Button,
    },
    onDateRangeModelChange: (options) => {
      console.log("Date range model changed", options);
    },
    onDateSelect: (options) => {
      console.log("Date selected", options);
    },
    onDateRangeChange: (options) => {
      console.log("Date range changed", options);
    },
    onInputBlur: (options) => {
      console.log("Input blurred", options);
    },
  },
};

export const DateTimeRange: Story = {
  args: {
    canBeEmpty: false,
    dateRangeModel: {
      daily: {
        startDate: moment().subtract(6, "weeks").format(DEFAULT_DATE_FORMAT),
        endDate: moment().format(DEFAULT_DATE_FORMAT),
        minDate: "2017-01-01",
        maxDate: moment().format(DEFAULT_DATE_FORMAT),
        startTime: "13:00",
        endTime: "18:00",
      } as Options,
    } as DateRangeModel,
    timezoneSupport: false,
    timePicker: true,
    type: DatetimeRangeType.daily,
    viewDateFormat: "MMM D, YYYY",
    label: "Date Time Range",
    placeholder: "Date Time Range",
    inputDateFormat: "YYYY-MM-DD",
    inputAs: {
      tag: Input,
      classNames: "custom-input-class",
    },
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
      classNames: "custom-select-class",
    },
    buttonAs: {
      tag: Button,
    },
    onDateRangeModelChange: (options) => {
      console.log("Date range model changed", options);
    },
    onDateSelect: (options) => {
      console.log("Date selected", options);
    },
    onDateRangeChange: (options) => {
      console.log("Date range changed", options);
    },
    onInputBlur: (options) => {
      console.log("Input blurred", options);
    },
  },
};
