import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import moment from "moment";
import { DateTimeRangePicker } from "../index";
import { type DateRangeModel, type Options, type Settings } from "../interfaces";
import { NextUIProvider, Input, Button, Select, SelectItem } from "@nextui-org/react";
import { DatetimeRangeType } from "../enum";
import "./assets/nextui.css";

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "DateTimeRangePicker/NextUI",
  component: DateTimeRangePicker,
  decorators: [
    (Story) => (
      <NextUIProvider>
        <Story />
      </NextUIProvider>
    ),
  ],
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof DateTimeRangePicker>;

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
    settings: {
      singleDatePicker: true,
      displayEndDate: true,
      retailCalendar: false,
      timezoneSupport: false,
      type: DatetimeRangeType.daily,
      viewDateFormat: "MMM D, YYYY",
      label: "Date",
      placeholder: "Date",
      inputDateFormat: "YYYY-MM-DD",
      showRowNumber: true,
    } as Settings,
    options: {},
    inputAs: Input,
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
    },
    buttonAs: Button,
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
    settings: {
      retailCalendar: false,
      timezoneSupport: false,
      type: DatetimeRangeType.weekly,
      viewDateFormat: "MMM D, YYYY",
      label: "Date Range",
      placeholder: "Date Range",
      inputDateFormat: "YYYY-MM-DD",
    } as Settings,
    options: {},
    inputAs: Input,
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
    },
    buttonAs: Button,
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
    settings: {
      retailCalendar: false,
      timezoneSupport: false,
      type: DatetimeRangeType.daily,
      viewDateFormat: "MMM D, YYYY",
      label: "Date Array Range",
      placeholder: "Date Array Range",
      inputDateFormat: "YYYY-MM-DD",
    } as Settings,
    options: {},
    inputAs: Input,
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
    },
    buttonAs: Button,
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
    settings: {
      retailCalendar: false,
      timezoneSupport: false,
      timePicker: true,
      type: DatetimeRangeType.daily,
      viewDateFormat: "MMM D, YYYY",
      label: "Date Time Range",
      placeholder: "Date Time Range",
      inputDateFormat: "YYYY-MM-DD",
    } as Settings,
    options: {},
    inputAs: Input,
    selectAs: {
      tag: Select,
      optionTag: SelectItem,
      selectedAttributeName: "defaultSelectedKeys",
      selectedAttributeValueType: "array",
    },
    buttonAs: Button,
  },
};
