import "react";

declare module "react" {
  interface CSSProperties {
    "--affected"?: string;
    "--delay"?: string;
  }
}
