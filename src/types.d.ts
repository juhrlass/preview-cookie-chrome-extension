export type OnValue = "1" | "true";
export type OffBehavior = "remove" | "0" | "false";

export interface HostConfig {
    id: string;
    hostName: string;
    cookieName: string;
    cookieLabel: string;
    onValue?: OnValue; // default: "1"
    offBehavior?: OffBehavior; // default: "remove"
}

export interface HostConfigs {
    hostConfigs?: HostConfig[]
}
