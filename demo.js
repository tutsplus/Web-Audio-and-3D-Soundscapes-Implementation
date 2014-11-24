//
// Web Audio and 3D Soundscapes: Implementation
// http://gamedev.tutsplus.com/tutorials/web-audio-and-3d-soundscapes-implementation--cms-22651
//
(function(){
	var canvas = document.querySelector("#canvas")
	var status = document.querySelector("#status")

	canvas.context = canvas.getContext("2d")

	canvas.context.fillStyle = "rgb(255,255,255)"
	canvas.context.shadowBlur = 16
	canvas.context.shadowColor = "rgba(255,255,255,0.8)"
	canvas.context.shadowOffsetX = 0
	canvas.context.shadowOffsetY = 0

	// Sets the demo status text.
	function setStatus(text) {
		status.innerHTML = String(text)
	}

	// Make sure the AudioPlayer API is available.
	if (window.AudioPlayer === undefined) {
		setStatus("Sorry, your web browser cannot run this demo")
		return
	}

	// Create a new AudioPlayer object (we only need one of these) and
	// then attach the event handlers needed while loading the sounds.
	var player = new AudioPlayer()

	// Called when the audio player starts loading a queue of sounds.
	player.onloadstart = function() {
		window.console.debug("Loading.")
	}

	// Called when the audio player encounters a problem loading a
	// sound. The sound queue will be cleared before this event is
	// broadcast to prevent any more sounds from loading.
	player.onloaderror = function() {
		// The errorType property informs us if the error was
		// caused by an I/O or audio decoding problem.
		if (player.errorType === player.IO_ERROR) {
			// Probably a problem with the server.
			setStatus("Sorry, the demo resource files failed to load")
		} else if (player.errorType === player.DECODING_ERROR) {
			// The browser doesn't support OGG Vorbis audio.
			setStatus("Sorry, your web browser cannot run this demo")
		}

		// The errorText property contains an error message that
		// can be thrown or sent to the dev console etc.
		window.console.debug(player.errorText)
	}

	// Called when the audio player has loaded a queue of sounds.
	player.onloadcomplete = function() {
		window.console.debug("Loaded.")
		
		player.onloadstart = null
		player.onloaderror = null
		player.onloadcomplete = null
		
		start()
	}

	// Load the sounds required for this demo.
	player.load("res/snd-01.ogg")
	player.load("res/snd-02.ogg")
	player.load("res/snd-03.ogg")
	player.load("res/snd-04.ogg")

	var sounds = [] // <String>
	var demoStarted = false
	var demoMuted = false

	// Starts the demo. This function is called by the onloadcomplete
	// event handler (above) when the sounds have been loaded.
	function start() {
		// Start the demo muted.
		mute()

		// Create the sounds and push them into the sounds array.
		sounds.push(player.create("res/snd-01.ogg"))
		sounds.push(player.create("res/snd-02.ogg"))
		sounds.push(player.create("res/snd-03.ogg"))
		sounds.push(player.create("res/snd-04.ogg"))

		// The first sound (snd-01) will be loop continuously so
		// we can start that one playing now. The other sounds
		// will be played randomly by the update() function.
		player.play(sounds[0], true)

		// Move the first sound so it's placed just in front of the listener.
		player.setZ(sounds[0], -10.0)

		// Start the update loop for rendering.
		window.requestAnimationFrame(update)

		demoStarted = true
		window.console.debug("Started.")
	}

	// Updates the demo. Called once per frame (60 Hz).
	function update(time) {
		window.requestAnimationFrame(update)

		var w = canvas.width
		var h = canvas.height

		canvas.context.clearRect(0, 0, w, h)
		canvas.context.beginPath()

		var i = 1 // The first sound is looping so ignore it.
		var n = sounds.length

		while (i < n) {
			var snd = sounds[i]

			if (player.isPlaying(snd) === false) {
				if (Math.random() >= 0.95) {
					var x = -150 + 300 * Math.random()
					var z = -150 + 300 * Math.random()

					player.setX(snd, x)
					player.setZ(snd, z)
					player.play(snd)
				}
			}

			if (player.isPlaying(snd)) {
				var x = (w * 0.5) + player.getX(snd)
				var y = (h * 0.5) + player.getZ(snd)

				x -= 10
				y -= 10

				canvas.context.rect(x|0, y|0, 20, 20)
			}

			i++
		}
		
		canvas.context.fill()
		canvas.context.closePath()
	}

	// Mutes the demo.
	function mute() {
		if (demoMuted === false) {
			player.setVolume(0.0)
			demoMuted = true
			setStatus("Click to unmute the demo.")
		}
	}

	// Unmutes the demo.
	function unmute() {
		if (demoMuted === true) {
			player.setVolume(1.0, 0.5) // 0.5 second fade-in
			demoMuted = false
			setStatus("Click to mute the demo.")
		}
	}

	// Handles UI clicks/taps.
	function onClick(event) {
		if (demoStarted) {
			if (demoMuted) {
				unmute()
			} else {
				mute()
			}
		}

		event.preventDefault()
	}

	//
	function onEvent(event) {
		event.preventDefault()
	}

	window.addEventListener("click", onClick)
	window.addEventListener("contextmenu", onEvent)
	window.addEventListener("selectstart", onEvent)
})()
