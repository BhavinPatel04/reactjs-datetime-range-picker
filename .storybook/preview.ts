import type { Preview } from "@storybook/react-vite";
import { DatetimeRangeType } from "../src";

const preview: Preview = {
  argTypes: {
    type: {
      control: "select",
      options: [
        DatetimeRangeType.daily,
        DatetimeRangeType.weekly,
        DatetimeRangeType.monthly,
        DatetimeRangeType.quarterly,
        DatetimeRangeType.yearly,
      ],
    },
    dateArray: {
      control: "array",
    },
  },
};

export default preview;
