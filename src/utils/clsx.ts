import classnames, { type ArgumentArray } from "classnames";

export default function clsx(...args: ArgumentArray) {
  return classnames(...args);
}
