const apiKey = process.env.NEXT_PUBLIC_FACE_API_KEY;
const url = process.env.NEXT_PUBLIC_FACE_API_URL;

//サーバーの情報を保存(curlコマンドを分解)
async function callFaceAPI(file: File) {
    if (!url || !apiKey) {
        console.error("APIのURLまたはキーが設定されていません。");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);//curlの -F 部分

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
        },
        body: formData
    });

    const data = await response.json();
    console.log("APIの結果:", data);
    return data;
}