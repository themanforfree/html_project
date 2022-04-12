let container = document.getElementById('container');
let video_files;
let video;

document.getElementById('videos').addEventListener('change', function () {
    video_files = Array.from(this.files);
});

function all_stop() {
    for (node in container.childNodes) {
        if (container.childNodes[node].tagName == 'VIDEO') {
            container.childNodes[node].pause();
            container.childNodes[node].hidden = true;
        }
    }
}

function player(code) {
    if (!document.getElementById(code)) {
        console.log("Can't find video with code: " + code);
        return;
    }
    video = document.getElementById(code);
    video.currentTime = 0;
    video.addEventListener('canplay', function () {
        all_stop();
        video.play();
        video.hidden = false;
        console.log('Playing video with code: ' + code);
        video.removeEventListener('canplay', arguments.callee);
    });
}

document.getElementById('start').addEventListener('click', async function () {
    const port = await navigator.serial.requestPort();

    for (index in video_files) {
        let new_video = document.createElement('video');
        new_video.className = 'video';
        new_video.src = URL.createObjectURL(video_files[index]);
        new_video.id = video_files[index].name.split('.')[0];
        new_video.hidden = true;
        new_video.volume = 1;
        if (new_video.id == 'default') {
            new_video.loop = true;
        } else {
            new_video.addEventListener('ended', function () {
                player('default');
            });
        }

        container.appendChild(new_video);
    }
    document.getElementById('init').hidden = true;
    player('default');
    await port.open({
        baudRate: document.getElementById('baudRate').value,
        dataBits: document.getElementById('dataBits').value,
        parityBit: document.getElementById('parity').value,
        stopBits: document.getElementById('stopBits').value,
    });
    const textDecoder = new TextDecoderStream('gb2312');
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    while (port.readable) {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    console.log('Received: ' + value);
                    player(value);
                    player(value);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    await port.close();
    console.log('port closed');
});

document.addEventListener('dblclick', function () {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener('keydown', function (e) {
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
        if (video.volume + 0.1 <= 1) {
            video.volume += 0.1;
        }
    }
    // key down
    if (e.keyCode == 40) {
        if (video.volume - 0.1 >= 0) {
            video.volume -= 0.1;
        }
    }

    // key num
    if (e.keyCode >= 49 && e.keyCode <= 57) {
        console.log('Press key: ' + (e.keyCode - 48));
        player(e.keyCode - 48);
    }
});
