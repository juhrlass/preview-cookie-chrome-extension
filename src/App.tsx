import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {useCallback, useEffect, useState} from "react";

export default function App() {

    const [currentHostname, setCurrentHostname] = useState<string>("")
    const [previewOn, setPreviewOn] = useState<boolean>(false)


    const fetchData = useCallback(async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (tab?.url) {
            try {
                const url = new URL(tab.url);
                setCurrentHostname(url.hostname);
                const previewCookie=await chrome.cookies.get({url: "https://"+url.hostname, name: "ub_preview"})
                if(previewCookie){
                   if(previewCookie.value==="1"){
                       setPreviewOn(true);
                   }
                }
            } catch {
                // ignore
            }
        }
    }, [])

    useEffect(() => {
        fetchData();
    }, [fetchData])


    function onChangePreview() {
        const newPreviewState=!previewOn

        if(newPreviewState){
            chrome.cookies.set({url:  "https://"+currentHostname,name:"ub_preview",value:"1"})
        } else {
            chrome.cookies.remove({url:  "https://"+currentHostname,name:"ub_preview"})
        }

        setPreviewOn(newPreviewState);
    }

    return <div className={"w-96 h-auto p-4"}>
        <div className={"flex flex-col gap-2 border rounded-lg border-gray-200 p-4"}>
            <div className="flex items-center space-x-2">
                <Switch checked={previewOn}
                        onCheckedChange={onChangePreview} id="preview-cookie-switch"/>
                <Label htmlFor="preview-cookie-switch">Preview Cookie</Label>
            </div>
            <div>{currentHostname}</div>

        </div>
    </div>
}