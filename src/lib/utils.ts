import { createCn } from "cn/config";

/**
 * Class merging that knows the custom theme tokens in globals.css.
 * Without this, `text-label` reads as a text colour and `cn("text-label", "text-primary")`
 * would drop the size. Keep these lists in step with the @theme block.
 */
export const cn = createCn({
  extend: {
    theme: {
      text: [
        "micro",
        "tag",
        "label",
        "eyebrow",
        "code",
        "meta",
        "body-sm",
        "emphasis",
        "counter",
        "section"
      ],
      tracking: ["display", "title", "subtle", "label", "label-wide"],
      leading: ["numeral", "display", "title", "compact", "copy", "roll"],
      spacing: [
        "gutter",
        "screen-y",
        "statement-y",
        "screen-end",
        "panel-x",
        "panel-x-md",
        "panel-y-md",
        "columns",
        "cluster",
        "index",
        "row",
        "row-x",
        "row-indent",
        "bars",
        "sketch-line",
        "sketch-bar",
        "roll"
      ],
      container: ["measure"]
    }
  }
});
