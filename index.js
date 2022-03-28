let video = document.getElementById("video");
let container = document.getElementById("container");

function player(code) {
    document.getElementById("init").hidden = true;
    let next = document.createElement("video");
    next.className = "video";
    next.src = code + ".mp4";
    next.hidden = true;
    container.appendChild(next);
    next.addEventListener("canplay", function() {
        next.play();
        next.hidden = false;
        container.removeChild(video);
        video = next;
    });
}

document.getElementById("start").addEventListener("click", async function() {
    const port = await navigator.serial.requestPort();
    player("default");
    await port.open({
        baudRate: document.getElementById("baudRate").value,
        dataBits: document.getElementById("dataBits").value,
        parityBit: document.getElementById("parity").value,
        stopBits: document.getElementById("stopBits").value,
    });
    const textDecoder = new TextDecoderStream("gb2312");
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    while (port.readable) {
        try {
            while (true) {
                const {
                    value,
                    done
                } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    console.log(value);
                    player(value);
                    player(value);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    await port.close();
    console.log("port closed");
});

document.addEventListener("dblclick", function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});


document.addEventListener("keydown", function(e) {
    // space
    if (e.keyCode == 32) {
        if (!video.hidden) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    // key right
    if (e.keyCode == 39) {
        video.currentTime += 10;
    }
    // key left
    if (e.keyCode == 37) {
        video.currentTime -= 10;
    }
    // key up
    if (e.keyCode == 38) {
        video.volume += 0.1;
    }
    // key down
    if (e.keyCode == 40) {
        video.volume -= 0.1;
    }

    // key num
    if (e.keyCode >= 49 && e.keyCode <= 57) {
        player(e.keyCode - 48);
    }

    // key 0
    if (e.keyCode == 48) {
        video.hidden = true;
        init.hidden = false;
    }
});