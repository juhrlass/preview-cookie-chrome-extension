export interface HostConfig {
    id: string;
    hostName: string;
    cookieName: string;
    cookieLabel: string;
}

export interface HostConfigs {
    hostConfigs?: HostConfig[]
}
