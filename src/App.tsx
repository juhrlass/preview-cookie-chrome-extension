import {useCallback, useLayoutEffect, useMemo, useState} from "react";
import {HostConfig, HostConfigs} from "@/types";
import {protocolAndHostnameFromCurrentTab} from "@/lib/chromeHelpers.ts";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ChevronDown, ChevronUp, CopyPlusIcon, PlusIcon, TrashIcon} from "lucide-react";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@radix-ui/react-collapsible";
import {cn} from "@/lib/utils.ts";

function findConfigsForHostname(hostConfigs: HostConfigs, queryResultHostname: string): HostConfig[] | null {
    if (hostConfigs.hostConfigs !== undefined) {
        const foundHostConfigs = hostConfigs?.hostConfigs.filter((hostConfig: HostConfig) => {
            return hostConfig.hostName === queryResultHostname
        })
        if (foundHostConfigs) {
            return foundHostConfigs
        }
    }
    return null;
}

function findConfigForId(hostConfigs: HostConfig[], id: string): HostConfig | null {
    if (hostConfigs) {
        const foundHostConfig = hostConfigs?.find((hostConfig: HostConfig) => {
            return hostConfig.id === id
        })
        if (foundHostConfig) {
            return foundHostConfig
        }
    }
    return null;
}

interface HostConfigsTableProps {
    hostConfigs?: HostConfig[]
    label?: string
    onDelete?: (id: string) => void
    onDuplicate?: (id: string) => void
}

const HostConfigsTable = (props: HostConfigsTableProps) => {

    return (
        <div className={"w-full"}>
            <p className={"text-gray-500 font-bold"}>{props?.label}</p>

            {(props?.hostConfigs && props?.hostConfigs?.length>0) ? (
            <table className="table-auto w-full">
                <thead>
                <tr>
                    <th className={"text-left w-56"}>Host</th>
                    <th className={"text-left"}>Cookie Name</th>
                    <th className={"text-left"}>Switch Label</th>
                    <th className={"text-left w-16"}>&nbsp;</th>
                </tr>
                </thead>
                <tbody>


                {props?.hostConfigs?.map((item: HostConfig) => (
                    <tr>

                        <td>
                            <p>{item.hostName}</p>
                        </td>
                        <td>
                            <p>  {item.cookieName}</p>
                        </td>
                        <td>
                            <p>  {item.cookieLabel}</p>
                        </td>

                        <td>
                            <div className={"flex gap-1 justify-end"}>
                                {props?.onDuplicate &&

                                    <Button size={"xs"} variant={"default"} aria-label={"Delete Config"}
                                            onClick={() => props?.onDuplicate && props?.onDuplicate(item.id)}><CopyPlusIcon
                                        className={"aspect-square h-3"}/></Button>
                                }
                                <Button size={"xs"} variant={"destructive"}
                                        aria-label={"Delete Config"}
                                        onClick={() => props?.onDelete && props?.onDelete(item.id)}><TrashIcon
                                    className={"aspect-square h-3"}/></Button>
                            </div>
                        </td>

                    </tr>
                ))
                }


                </tbody>
            </table>):(
                <p>No configs found</p>
            )
            }
        </div>
    )

}


export default function App() {

    const [configs, setConfigs] = useState<HostConfigs>({})
    const [currentProtocolAndHostname, setCurrentProtocolAndHostname] = useState<string>("")
    const [previewCookieName, setPreviewCookieName] = useState<string>("preview")
    const [previewCookieLabel, setPreviewCookieLabel] = useState<string>("Preview Cookie")

    const [cookieOnMap, setCookieOnMap] = useState<{[key: string]: boolean}>({})
    const [currentHostConfigs, setCurrentHostConfigs] = useState<HostConfig[] | null>(null)

    const [isOpen, setIsOpen] = useState(false)

    const fetchData = useCallback(async () => {

        const protocolAndHostname = await protocolAndHostnameFromCurrentTab();
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
                const foundHostConfigs = findConfigsForHostname(hostConfigs, protocolAndHostname);
                if (foundHostConfigs) {
                    const newCookieMap={...cookieOnMap}
                    for (const foundHostConfig of foundHostConfigs) {

                        const cookieValue = await chrome.cookies.get({
                            url: protocolAndHostname,
                            name: foundHostConfig.cookieName
                        })
                        if (cookieValue && cookieValue.value !== "0") {
                            newCookieMap[foundHostConfig.id]=true
                        }else {
                            newCookieMap[foundHostConfig.id]=false
                        }
                    }
                    setCookieOnMap(newCookieMap);
                }
                setCurrentHostConfigs(foundHostConfigs)
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
            cookieName: previewCookieName,
            cookieLabel: previewCookieLabel,
        });

        const newConfigs = {...configs}
        setConfigs(newConfigs)
        chrome.storage.local.set({"configs": newConfigs}, () => {
        });
        const foundConfigsForHostname = findConfigsForHostname(newConfigs, currentProtocolAndHostname);
        setCurrentHostConfigs(foundConfigsForHostname)
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
            const foundConfigsForHostname = findConfigsForHostname(newConfigs, currentProtocolAndHostname);
            setCurrentHostConfigs(foundConfigsForHostname)

        }

    }

    function duplicateConfig(id: string) {

        const newConfigs = {...configs}

        const allHostConfigs = configs.hostConfigs
        if (allHostConfigs) {
            newConfigs.hostConfigs = allHostConfigs

            const configToDuplicate = findConfigForId(allHostConfigs, id)
            if (configToDuplicate) {
                const newConfig: HostConfig = {...configToDuplicate}
                newConfig.hostName = currentProtocolAndHostname
                newConfig.id=Date.now().toString()
                newConfigs.hostConfigs.push(newConfig)
                setConfigs(newConfigs);
                chrome.storage.local.set({"configs": newConfigs}, () => {
                });
                const foundConfigsForHostname = findConfigsForHostname(newConfigs, currentProtocolAndHostname);
                setCurrentHostConfigs(foundConfigsForHostname)
            }

        }

    }

    function onChangePreview(id: string) {

        if (currentHostConfigs) {


            const newPreviewState = !cookieOnMap[id]

            const currentHostConfig = findConfigForId(currentHostConfigs, id)

            if (currentHostConfig) {
                if (newPreviewState) {
                    chrome.cookies.set({
                        url: currentProtocolAndHostname,
                        name: currentHostConfig.cookieName,
                        value: "1"
                    })
                } else {
                    chrome.cookies.remove({url: currentProtocolAndHostname, name: currentHostConfig.cookieName})
                }

                const newCookieOnMap= {...cookieOnMap}

                for(const currentConfig of currentHostConfigs){
                    if(currentConfig.cookieName === currentHostConfig.cookieName){
                        newCookieOnMap[currentConfig.id]=newPreviewState
                    }
                }

                setCookieOnMap(newCookieOnMap)
            }
        }
    }

    function filterCurrentHostConfigs() {
        if (configs?.hostConfigs) {
            const allHostConfigs: HostConfig[] = configs.hostConfigs
            return allHostConfigs.filter((hostConfig: HostConfig) => {
                return hostConfig.hostName === currentProtocolAndHostname
            })
        }
    }

    function filterOtherHostConfigs() {
        if (configs?.hostConfigs) {
            const allHostConfigs: HostConfig[] = configs.hostConfigs
            return allHostConfigs.filter((hostConfig: HostConfig) => {
                return hostConfig.hostName !== currentProtocolAndHostname
            })
        }
    }

    const getCurrentHostConfigs = useMemo(filterCurrentHostConfigs, [configs, currentProtocolAndHostname])
    const getOtherHostConfigs = useMemo(filterOtherHostConfigs, [configs, currentProtocolAndHostname])


    return <div className={cn("transition-[width] ease-in-out delay-300 w-96 h-auto p-4 flex flex-col gap-2", {
        "w-[780px] h-[580px]": isOpen
    })}>

        <div className={"flex flex-col gap-2 border rounded-lg border-gray-200 p-4"}>
            <p className={"text-lg font-bold"}>{currentProtocolAndHostname}</p>
            {(currentHostConfigs && currentHostConfigs.length > 0) ?
                <div className={"flex flex-col justify-start items-start gap-2"}>
                    {currentHostConfigs.map((currentHostConfig) => (
                        <div className="flex items-center space-x-2">
                            <Switch checked={cookieOnMap[currentHostConfig.id]}
                                    onCheckedChange={() => onChangePreview(currentHostConfig.id)}
                                    id={"preview-cookie-switch-" + currentHostConfig.id}
                                    key={"preview-cookie-switch-" + currentHostConfig.id}/>
                            <Label htmlFor="preview-cookie-switch">{currentHostConfig.cookieLabel}</Label>
                        </div>
                    ))}


                </div> : <div>
                    <p className={"text-gray-500"}>No preview cookie config found for this site.</p>
                    <p className={"text-gray-500"}>Use settings to add one if needed.</p>
                </div>}

        </div>

        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-t-2"
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

            <CollapsibleContent className="mt-2 mb-4">




                    <div className={"flex w-full flex-col gap-2 items-start justify-start"}>
                        <p className={"font-bold text-lg"}>Add new Cookie Config</p>
                        <div className="flex w-full items-center space-x-2">
                            <Input
                                value={previewCookieName}
                                onChange={e => setPreviewCookieName(e.target.value)}
                            />
                            <Input
                                value={previewCookieLabel}
                                onChange={e => setPreviewCookieLabel(e.target.value)}
                            />

                            <Button size={"sm"}
                                    aria-label={"Add Config"}
                                    onClick={addConfig}><PlusIcon
                                className={"aspect-square h-5"}/></Button>
                        </div>


    </div>

                <div>
                    {(configs?.hostConfigs && configs?.hostConfigs?.length > 0) &&
                        <>
                            <div className={"flex w-full flex-col gap-4 items-start justify-start"}>
                                <p className={"font-bold text-lg"}>Existing Cookie Configs</p>
                                <HostConfigsTable hostConfigs={getCurrentHostConfigs} label={"Existing cookie configs for current PROTOCOL://HOST"}
                                                  onDelete={deleteConfig} />
                                <HostConfigsTable hostConfigs={getOtherHostConfigs} label={"Existing cookie configs for other PROTOCOL://HOSTs"}
                                                  onDelete={deleteConfig} onDuplicate={duplicateConfig}/>


                            </div>
                        </>
                    }
                </div>

            </CollapsibleContent>
        </Collapsible>

    </div>
}