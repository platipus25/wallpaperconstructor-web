importScripts("/wasm_exec.js")
if (!WebAssembly.instantiateStreaming) {
    // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

const go = new Go();

let mod, inst;

WebAssembly.instantiateStreaming(fetch("/main.wasm"), go.importObject).then(result => {

    mod = result.module;
    inst = result.instance;
    go.run(inst)
    postMessage("Initialized")
    //WebAssembly.instantiate(mod, go.importObject).then((result) => inst = result);
});

self.addEventListener('message', (event) => {
    console.log(event, event.data)
    let result = self.processImg(...event.data)
    postMessage(result)
})