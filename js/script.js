console.log("Let's write some javascript")
let currentsong = new Audio()
let songs;
let currfolder;



function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlists
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">

                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Sahil</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert"src="img/play.svg" alt="">
                            </div>
                            </li>`;
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())


        })

    })

}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track

    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="45" height="45">
                                <!-- Green circular background -->
                                <circle cx="12" cy="12" r="12" fill="green" />

                                <!-- Play button -->
                                <path
                                    d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z"
                                    stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img width="100%" src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }

    // Load a playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })

}

async function main() {


    // Get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the album on the page
    await displayAlbums()


    // Attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    // Add an event listner to seeker
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (((e.offsetX / e.target.getBoundingClientRect().width) * 100))
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    // Add an event listner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listner to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // Add an event listner to previous
    previous.addEventListener("click", () => {
        currentsong.pause();
        console.log("Previous clicked")
        // console.log(currentsong.src.split("/").slice(-1)[0])
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })

    // Add an event listner to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next clicked")
        // console.log(currentsong.src.split("/").slice(-1)[0])
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100
        if(e.target.value > 0){
              document.querySelector(".volume>img").src=   document.querySelector(".volume>img").src.replace("mute.svg" , "volume.svg");
        }
    })

    // Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click" , e=>{
        console.log(e.target)
        console.log("Changing" , e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
           e.target.src=  e.target.src.replace("mute.svg" , "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}



main()