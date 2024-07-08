import {useCallback, useLayoutEffect, useState} from "react";
import {HostConfig, HostConfigs} from "@/types";
import {protocolAndHostnameFromCurrentTab} from "@/lib/chromeHelpers.ts";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ChevronDown, ChevronUp, TrashIcon} from "lucide-react";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@radix-ui/react-collapsible";

function findConfigForHostname(hostConfigs: HostConfigs, queryResultHostname: string) {
    if (hostConfigs.hostConfigs !== undefined) {
        const foundHostConfig = hostConfigs?.hostConfigs.find((hostConfig: HostConfig) => {
            return hostConfig.hostName === queryResultHostname
        })
        if (foundHostConfig) {
            return foundHostConfig
        }
    }
    return null;
}

export default function App() {

    const [configs, setConfigs] = useState<HostConfigs>({})
    const [currentProtocolAndHostname, setCurrentProtocolAndHostname] = useState<string>("")
    const [previewCookieName, setPreviewCookieName] = useState<string>("preview")
    const [previewOn, setPreviewOn] = useState<boolean>(false)
    const [currentHostConfig, setCurrentHostConfig] = useState<HostConfig | null>(null)

    const [isOpen, setIsOpen] = useState(false)

    const fetchData = useCallback(async () => {

        let protocolAndHostname = await protocolAndHostnameFromCurrentTab();
        if (protocolAndHostname) {
            setCurrentProtocolAndHostname(protocolAndHostname);
        }

        chrome.storage.local.get(["configs"], async (result) => {
            let hostConfigs: HostConfigs = {hostConfigs: []}
            if (result?.configs) {
                hostConfigs = result.configs as HostConfigs;
            }
            setConfigs(hostConfigs)
            if (protocolAndHostname) {
                const foundHostConfig = findConfigForHostname(hostConfigs, protocolAndHostname);
                if (foundHostConfig) {
                    const cookieValue = await chrome.cookies.get({
                        url: protocolAndHostname,
                        name: foundHostConfig.cookieName
                    })
                    if (cookieValue && cookieValue.value !== "0") {
                        setPreviewOn(true)
                    }
                }
                setCurrentHostConfig(foundHostConfig)

            }
        })


    }, [])

    useLayoutEffect(() => {
        fetchData();
    }, [fetchData])


    async function addConfig() {
        if (!configs.hostConfigs) {
            configs.hostConfigs = []
        }
        configs.hostConfigs?.push({
            id: Date.now().toString(),
            hostName: currentProtocolAndHostname,
            cookieName: previewCookieName
        });

        const newConfigs = {...configs}
        setConfigs(newConfigs)
        chrome.storage.local.set({"configs": newConfigs}, () => {
        });
        const foundConfigForHostname = findConfigForHostname(newConfigs, currentProtocolAndHostname);
        setCurrentHostConfig(foundConfigForHostname)
    }

    function deleteConfig(id: string) {

        const newConfigs = {...configs}

        const hostConfigs = configs.hostConfigs
        if (hostConfigs) {
            newConfigs.hostConfigs = hostConfigs.filter((item: HostConfig) => {
                return item.id !== id
            })
            setConfigs(newConfigs);
            chrome.storage.local.set({"configs": newConfigs}, () => {
            });
            const foundConfigForHostname = findConfigForHostname(newConfigs, currentProtocolAndHostname);
            setCurrentHostConfig(foundConfigForHostname)

        }

    }

    function onChangePreview() {

        if (currentHostConfig) {
            const newPreviewState = !previewOn
            if (newPreviewState) {
                chrome.cookies.set({url: currentProtocolAndHostname, name: currentHostConfig.cookieName, value: "1"})
            } else {
                chrome.cookies.remove({url: currentProtocolAndHostname, name: currentHostConfig.cookieName})
            }

            setPreviewOn(newPreviewState);
        }
    }

    return <div className={"w-96 h-auto p-4 flex  flex-col gap-2"}>

        <div className={"flex flex-col gap-2 border rounded-lg border-gray-200 p-4"}>
            <p className={"text-lg font-bold"}>{currentProtocolAndHostname}</p>
            {currentHostConfig ? <div className="flex items-center space-x-2">
                <Switch checked={previewOn}
                        onCheckedChange={onChangePreview} id="preview-cookie-switch"/>
                <Label htmlFor="preview-cookie-switch">Preview Cookie</Label>
            </div> : <div>
                <p className={"text-gray-500"}>No preview cookie config found for this site.</p>
                <p className={"text-gray-500"}>Use settings to add one if needed.</p>
            </div>}

        </div>

        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-2"
        >
            <div className="flex items-center justify-between space-x-4">

                <CollapsibleTrigger asChild>
                    <div className={"flex w-full gap-2 justify-end items-center"}>
                        <Button variant="ghost" size="sm" className={"text-gray-500"}>
                            Settings
                            {!isOpen ?
                                <ChevronDown className="h-5 w-5"/> : <ChevronUp className="h-5 w-5"/>
                            }
                        </Button>
                    </div>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-2">

                <div className="flex items-center space-x-2">
                    <Input
                        value={previewCookieName}
                        onChange={e => setPreviewCookieName(e.target.value)}
                    />
                    <Button size={"sm"} onClick={addConfig} disabled={currentHostConfig !== null}>Add Config</Button>
                </div>

                <div>
                    {(configs?.hostConfigs && configs?.hostConfigs?.length > 0) &&
                        <div className={"flex w-full flex-col gap-2 items-start justify-start"}>
                            <p className={"font-bold text-lg"}>Configs</p>
                            <p className={"text-gray-500"}>All preview cookie configs</p>
                            {configs?.hostConfigs?.map((item: HostConfig) => (
                                <div className={"w-full"} key={item.id}>

                                    <div
                                        className={"flex w-full gap-2 justify-between items-center py-2 border-t border-gray-200"}>

                                        <p>{item.hostName}</p>
                                        <p>  {item.cookieName}</p>

                                        <div>
                                            <Button size={"sm"} variant={"destructive"}
                                                    onClick={() => deleteConfig(item.id)}><TrashIcon
                                                className={"h-4 w-4"}/></Button>
                                        </div>


                                    </div>
                                </div>))
                            }

                        </div>}
                </div>

            </CollapsibleContent>
        </Collapsible>

    </div>
}