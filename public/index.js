class wallpaperificationOrder {
    readFile(){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async process(){
        console.log("Processing...")
        let img = this.base64_in
        //console.log(img)
    
        let start = img.search(",")
        img = img.substr(start+1)
        console.log(start, img)
    
        let string = window.processImg(this.width, this.height, img, this.blur)
        console.log("Done!")
        
        let url = `data:image/png;base64,${string}`
    
        return url
    }

    constructor(width, height, img_in, blur){
        this.width = width
        this.height = height
        this.blur = blur
        this.file = null
        this.base64_in = ""
        this.base64_out = ""

        let files = null
        switch(Object.getPrototypeOf(img_in)){
            case File.prototype:
                this.file = img_in
                break;
            case HTMLInputElement.prototype:
                files = img_in.files
                this.file = files[0]
                break;
            default:
                img_in = document.getElementById("upload")
                files = upload.files
                this.file = files[0]
                break;
        }

        if(this.file == undefined){
            throw new Error("Missing image file")
        }

    }

    async wallpaperify(){
        this.base64_in = await this.readFile()
        console.log("file read")
        this.base64_out = await this.process()
        return this.base64_out
    }

}


$("#wallpaperconstructor-order").on("submit", async (event) => {
    event.preventDefault();
    let width = parseInt($("#width").val())
    let height = parseInt($("#height").val())
    let file_input = document.getElementById("upload")
    let blur = parseInt($("#blur").val())
    window.order = null
    $("#error").text("")
    try{
        order = new wallpaperificationOrder(width, height, file_input, blur)
    } catch(e){
        $("#error").text("Image file is required")
        console.error(e)
        return null
    }
    $("#download").hide()
    $("#runButton").attr("disabled", true)
    await order.wallpaperify()
    $("#runButton").attr("disabled", false)
    $("#download").show()

    $("#image").attr("src", order.base64_out)
    $("#download").attr("href", order.base64_out)
})

$("#download").on("click", () => {
    console.log("downloading")
    download(order.base64_out, `${order.file.name}`, "image/png")
})

$(document).ready(() => {
	progressBar = [
		{ width:"0%", left:0, borderRadius: "0px 0px 0px 16px", backgroundColor:"steelblue"},
		{ borderRadius: "0px 0px 0px 6px", left:0, width:"30%"},
		{ borderRadius:"0px 0px 0px 0px", width: "20%"},
		{ borderRadius:"0px 0px 0px 0px"},
		{ width:"5%", left:"95%", right:0, borderRadius: "0px 0px 16px 0px"},
		{ width: "1%", left:"99%", right: 0, borderRadius: "0px 0px 16px 0px",  backgroundColor:"steelblue"},
	];
	
	progressBarTiming = {
		duration: 2000,
		iterations: Infinity,
		fill: "both",
		easing: "ease-in"
	}
	
	progress = document.getElementById("progress-bar").animate(
		progressBar,
		progressBarTiming
	)
	progress.cancel()
	
	wallpaperconstructorWorker = new Worker('worker.js');
	let listener = (event) => {
		wallpaperconstructorWorker.removeEventListener(event, listener)
		document.getElementById("runButton").disabled = false;
	}
	wallpaperconstructorWorker.addEventListener("message", listener)
	//worker.postMessage("hi")
})
