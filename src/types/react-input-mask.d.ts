declare module "react-input-mask" {
  import * as React from "react";

  export interface InputMaskProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    mask?: string;
    maskPlaceholder?: string | null;
    alwaysShowMask?: boolean;
    beforeMaskedValueChange?: (
      newState: { value: string; selection: any },
      oldState: { value: string; selection: any },
      userInput: string
    ) => { value: string; selection: any };
  }

  export default class InputMask extends React.Component<InputMaskProps> {}
}
