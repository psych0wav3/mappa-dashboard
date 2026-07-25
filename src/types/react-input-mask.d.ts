declare module "react-input-mask" {
  import * as React from "react";

  interface InputMaskSelection {
    start: number;
    end: number;
  }

  interface InputMaskState {
    value: string;
    selection: InputMaskSelection | null;
  }

  export interface InputMaskProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string;
    maskPlaceholder?: string | null;
    alwaysShowMask?: boolean;
    beforeMaskedValueChange?: (
      newState: InputMaskState,
      oldState: InputMaskState,
      userInput: string | null,
    ) => InputMaskState;
  }

  export default class InputMask extends React.Component<InputMaskProps> {}
}